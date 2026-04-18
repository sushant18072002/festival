import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get_storage/get_storage.dart';
import 'package:timezone/data/latest_all.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

import '../models/event_model.dart';
import 'notification_service.dart';

/// Unique ID allocation ranges
///   0–999   : event-specific (discovery, countdown, eve, day-of, afterglow)
///             ID = eventSlotIndex * 5 + stageOffset
///  1000–1099: weekly pulse Sunday
///  1100–1199: monthly pulse (month opener)

const _kStorageKey = 'scheduled_notif_ids';
const _kChannelEventsId = 'utsav_events';
const _kChannelDigestId = 'utsav_digest';

/// Each stage has a fixed offset within the event's ID block.
enum _Stage { discovery, countdown, eve, dayOf, afterglow }

extension _StageExt on _Stage {
  int get offset => index; // 0,1,2,3,4
}

class NotificationScheduler {
  NotificationScheduler._();
  static final NotificationScheduler instance = NotificationScheduler._();

  bool _tzInitialized = false;

  // ─── Public Entry Point ────────────────────────────────────────────────────

  Future<void> scheduleAll({
    required List<EventModel> events,
    required FlutterLocalNotificationsPlugin plugin,
    required GetStorage storage,
  }) async {
    await _ensureTz();
    final now = DateTime.now();

    // Load previously-scheduled IDs to skip re-scheduling
    final scheduledIds = _loadScheduledIds(storage);

    // Cancel all old ones first — re-schedule cleanly on every app launch.
    // This ensures stale schedules (event date changed) are automatically fixed.
    await plugin.cancelAll();
    scheduledIds.clear();

    int eventSlot = 0;
    for (final event in events) {
      final date = _effectiveDate(event, now);
      if (date == null) {
        eventSlot++;
        continue;
      }

      final baseId = eventSlot * 5;
      final thumbnail = event.thumbnail;
      final color = NotificationService.categoryColor(event);
      final payload = 'event:${event.slug}';

      await _scheduleStage(
        plugin: plugin,
        id: baseId + _Stage.discovery.offset,
        title: '${event.title} is coming in a month ✨',
        body: _discoveryBody(event),
        scheduledDate: date.subtract(const Duration(days: 30)),
        now: now,
        imageUrl: thumbnail,
        accentColor: color,
        payload: payload,
        channelId: _kChannelEventsId,
      );

      await _scheduleStage(
        plugin: plugin,
        id: baseId + _Stage.countdown.offset,
        title: '7 days to ${event.title} 🗓️',
        body: _countdownBody(event),
        scheduledDate: date.subtract(const Duration(days: 7)),
        now: now,
        imageUrl: thumbnail,
        accentColor: color,
        payload: payload,
        channelId: _kChannelEventsId,
      );

      await _scheduleStage(
        plugin: plugin,
        id: baseId + _Stage.eve.offset,
        title: "Tomorrow is ${event.title}! 🎊",
        body: _eveBody(event),
        scheduledDate: date.subtract(const Duration(days: 1)),
        now: now,
        hour: 19, // 7 PM eve reminder
        imageUrl: thumbnail,
        accentColor: color,
        payload: payload,
        channelId: _kChannelEventsId,
      );

      await _scheduleStage(
        plugin: plugin,
        id: baseId + _Stage.dayOf.offset,
        title: _dayOfTitle(event),
        body: _dayOfBody(event),
        scheduledDate: date,
        now: now,
        hour: 7, // 7 AM morning burst
        imageUrl: thumbnail,
        accentColor: color,
        payload: payload,
        channelId: _kChannelEventsId,
      );

      await _scheduleStage(
        plugin: plugin,
        id: baseId + _Stage.afterglow.offset,
        title: 'Missed the ${event.title} vibes? 📸',
        body:
            'The gallery from ${event.title} is waiting. Dive into the visuals.',
        scheduledDate: date.add(const Duration(days: 2)),
        now: now,
        hour: 10,
        imageUrl: thumbnail,
        accentColor: color,
        payload: payload,
        channelId: _kChannelEventsId,
      );

      scheduledIds.add(baseId);
      eventSlot++;
    }

    // Schedule repeating weekly + monthly digest
    await _scheduleWeeklyPulse(plugin, events, now);
    await _scheduleMonthlyPulse(plugin, events, now);

    _saveScheduledIds(storage, scheduledIds);
    debugPrint(
      '[Scheduler] Done. ${scheduledIds.length} event sets + digest scheduled.',
    );
  }

  // ─── Stage Scheduler ──────────────────────────────────────────────────────

  Future<void> _scheduleStage({
    required FlutterLocalNotificationsPlugin plugin,
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    required DateTime now,
    int hour = 9,
    String? imageUrl,
    Color? accentColor,
    required String payload,
    required String channelId,
  }) async {
    // Normalize fire time: set to specified hour, minute 0
    final fireDate = DateTime(
      scheduledDate.year,
      scheduledDate.month,
      scheduledDate.day,
      hour,
      0,
    );

    // Don't schedule in the past
    if (fireDate.isBefore(now)) return;

    try {
      final details = await NotificationService.buildDetails(
        channelId: channelId,
        imageUrl: imageUrl,
        accentColor: accentColor,
      );

      final tzFireDate = tz.TZDateTime.from(fireDate, tz.local);

      await plugin.zonedSchedule(
        id,
        title,
        body,
        tzFireDate,
        details,
        payload: payload,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      );

      debugPrint(
        '[Scheduler] ID $id → "${title.substring(0, title.length.clamp(0, 40))}..." @ ${fireDate.toIso8601String()}',
      );
    } catch (e) {
      debugPrint('[Scheduler] Failed to schedule ID $id: $e');
    }
  }

  // ─── Weekly Pulse (every Sunday at 9 AM) ──────────────────────────────────

  Future<void> _scheduleWeeklyPulse(
    FlutterLocalNotificationsPlugin plugin,
    List<EventModel> events,
    DateTime now,
  ) async {
    // Find the next Sunday
    DateTime nextSunday = now;
    while (nextSunday.weekday != DateTime.sunday) {
      nextSunday = nextSunday.add(const Duration(days: 1));
    }
    nextSunday = DateTime(nextSunday.year, nextSunday.month, nextSunday.day, 9);

    // Find events in the next 7 days
    final upcoming = events.where((e) {
      final d = _effectiveDate(e, now);
      if (d == null) return false;
      return d.isAfter(now) && d.isBefore(now.add(const Duration(days: 8)));
    }).toList();

    if (upcoming.isEmpty) return;

    final names = upcoming.map((e) => e.title).join(' · ');
    await _scheduleStage(
      plugin: plugin,
      id: 1000,
      title: 'This week\'s celebrations 🗓️',
      body: names,
      scheduledDate: nextSunday,
      now: now,
      hour: 9,
      channelId: _kChannelDigestId,
      payload: 'calendar',
    );
  }

  // ─── Monthly Pulse (1st of every month at 9 AM) ───────────────────────────

  Future<void> _scheduleMonthlyPulse(
    FlutterLocalNotificationsPlugin plugin,
    List<EventModel> events,
    DateTime now,
  ) async {
    // Find next 1st of month
    DateTime next1st = DateTime(
      now.month == 12 ? now.year + 1 : now.year,
      now.month == 12 ? 1 : now.month + 1,
      1,
      9,
    );

    final eventsThisMonth = events.where((e) {
      final d = _effectiveDate(e, now);
      if (d == null) return false;
      return d.year == next1st.year && d.month == next1st.month;
    }).toList();

    final monthName = _monthName(next1st.month);

    if (eventsThisMonth.isEmpty) {
      // Even with no events, send a gentle cultural message
      await _scheduleStage(
        plugin: plugin,
        id: 1100,
        title: '$monthName awaits 🌸',
        body: 'Open Utsav to explore what\'s coming this month.',
        scheduledDate: next1st,
        now: now,
        hour: 9,
        channelId: _kChannelDigestId,
        payload: 'home',
      );
      return;
    }

    final names = eventsThisMonth.map((e) => e.title).join(', ');
    await _scheduleStage(
      plugin: plugin,
      id: 1100,
      title: 'Festivals in $monthName 🎉',
      body: names,
      scheduledDate: next1st,
      now: now,
      hour: 9,
      channelId: _kChannelDigestId,
      payload: 'calendar',
    );
  }

  // ─── Content Generators ───────────────────────────────────────────────────

  String _discoveryBody(EventModel e) {
    if (e.notifications?.discovery.isNotEmpty == true) {
      return e.notifications!.discovery;
    }

    final templates = [
      'Did you know? {fact} Tap to discover more.',
      '{event} is coming next month. Explore its origins now.',
      'A month away! Dive into the history of {event}.',
    ];
    final selected = (templates.toList()..shuffle()).first;

    if (e.facts.isNotEmpty && selected.contains('{fact}')) {
      return selected
          .replaceAll('{fact}', e.facts.first.fact)
          .replaceAll('{event}', e.title);
    }

    final fallback = [
      '${e.title} is coming next month. Explore its history now.',
      'A month away! Dive into the traditions of ${e.title}.',
      '${e.title} is on the horizon. See what it is all about.',
    ];
    return (fallback.toList()..shuffle()).first;
  }

  String _countdownBody(EventModel e) {
    if (e.notifications?.countdown.isNotEmpty == true) {
      return e.notifications!.countdown;
    }

    if (e.facts.isNotEmpty) {
      final templates = [
        'Fun fact: {fact} See the visual journey.',
        'One week left! Did you know: {fact}',
        'Curious about ${e.title}? {fact}',
      ];
      return (templates.toList()..shuffle()).first.replaceAll(
        '{fact}',
        e.facts.first.fact,
      );
    }
    final vibeNames = e.vibes.map((v) => v.name).take(2).join(' & ');
    if (vibeNames.isNotEmpty) {
      final templates = [
        'The $vibeNames festival is almost here!',
        'Get ready for $vibeNames vibes next week!',
      ];
      return (templates.toList()..shuffle()).first;
    }

    final general = [
      'Explore traditions & photos before it arrives.',
      'Only 7 days to go! Dive into the gallery.',
    ];
    return (general.toList()..shuffle()).first;
  }

  String _eveBody(EventModel e) {
    if (e.notifications?.eve.isNotEmpty == true) {
      return e.notifications!.eve;
    }

    if (e.facts.length > 1) {
      final templates = [
        'Tonight\'s thought: {fact}',
        'Before tomorrow arrives: {fact}',
        'A pre-festival secret: {fact}',
      ];
      return (templates.toList()..shuffle()).first.replaceAll(
        '{fact}',
        e.facts[1].fact,
      );
    }
    final templates = [
      'Get ready! Check out the gallery and share wishes with loved ones.',
      'Tomorrow is the day! Prepare your greetings now.',
      'The wait is over tonight. Immerse yourself in the gallery.',
    ];
    return (templates.toList()..shuffle()).first;
  }

  String _dayOfTitle(EventModel e) {
    final emoji = _categoryEmoji(e);
    final templates = [
      'Happy ${e.title}! $emoji',
      'Celebrate ${e.title} Today! $emoji',
      'It\'s ${e.title}! $emoji',
    ];
    return (templates.toList()..shuffle()).first;
  }

  String _dayOfBody(EventModel e) {
    if (e.notifications?.dayOf.isNotEmpty == true) {
      return e.notifications!.dayOf;
    }

    final templates = [
      'The celebration is here. Explore traditions, share wishes & dive into the gallery.',
      'Wishing you a wonderful ${e.title}. Tap to see beautiful visuals and history.',
      'Immerse in the joy of ${e.title}. Discover, share, and celebrate!',
    ];
    return (templates.toList()..shuffle()).first;
  }

  String _categoryEmoji(EventModel e) {
    switch (e.category?.code) {
      case 'festival':
        return '🎉';
      case 'national':
        return '🇮🇳';
      case 'cultural':
        return '🎊';
      default:
        return '✨';
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /// Returns the best date for an event relative to now.
  /// Prefers the next future occurrence. Falls back to the primary date.
  DateTime? _effectiveDate(EventModel e, DateTime now) {
    final cutoff = now.subtract(const Duration(days: 3));

    // Use pre-computed nextOccurrence from model (already handles dates/nextDate)
    final next = e.nextOccurrence;
    if (next != null && next.isAfter(cutoff)) return next;

    // Fallback to primary date
    final d = e.date;
    if (d != null && d.isAfter(cutoff)) return d;

    return null;
  }

  Future<void> _ensureTz() async {
    if (_tzInitialized) return;
    tz_data.initializeTimeZones();
    // Use device local timezone
    try {
      final localeName = DateTime.now().timeZoneName;
      // Map abbreviated names to full IANA names where possible
      final tzName = _ianaFromAbbr(localeName);
      tz.setLocalLocation(tz.getLocation(tzName));
    } catch (_) {
      tz.setLocalLocation(tz.getLocation('Asia/Kolkata'));
    }
    _tzInitialized = true;
  }

  String _ianaFromAbbr(String abbr) {
    // Common mappings — extend as needed
    const map = {
      'IST': 'Asia/Kolkata',
      'UTC': 'UTC',
      'EST': 'America/New_York',
      'PST': 'America/Los_Angeles',
      'GMT': 'Europe/London',
    };
    return map[abbr] ?? 'Asia/Kolkata';
  }

  String _monthName(int m) => [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][m - 1];

  Set<int> _loadScheduledIds(GetStorage s) {
    final raw = s.read<String?>(_kStorageKey);
    if (raw == null) return {};
    try {
      return (jsonDecode(raw) as List).cast<int>().toSet();
    } catch (_) {
      return {};
    }
  }

  void _saveScheduledIds(GetStorage s, Set<int> ids) {
    s.write(_kStorageKey, jsonEncode(ids.toList()));
  }
}
