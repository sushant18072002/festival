import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:share_plus/share_plus.dart';
import '../../data/models/calendar_model.dart';
import '../../data/models/event_model.dart';
import '../../data/providers/data_repository.dart';

class CalendarController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();

  final calendarData = Rxn<CalendarData>();
  final focusedDay = DateTime.now().obs;
  final selectedDay = Rxn<DateTime>();
  final selectedEvents = <EventModel>[].obs;
  final upcomingEvents = <EventModel>[].obs;
  final isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    // Rebuild the month event list whenever user swipes calendar pages or events hydrate
    ever(focusedDay, (_) => buildMonthEvents());
    ever(_repository.allEvents, (_) => buildMonthEvents());

    // Attempt initial build if repo is instantly ready
    buildMonthEvents();

    Future.delayed(const Duration(milliseconds: 200), fetchCalendarData);
  }

  Future<void> fetchCalendarData() async {
    isLoading.value = true;
    final data = await _repository.getCalendarData(
      _repository.currentLang.value,
    );
    if (data != null) {
      calendarData.value = data;
      if (selectedDay.value != null) {
        updateSelectedEvents(selectedDay.value!);
      }
    }
    buildMonthEvents();
    isLoading.value = false;
  }

  void buildMonthEvents() {
    final all = _repository.allEvents;
    final start = DateTime(focusedDay.value.year, focusedDay.value.month, 1);
    final end = DateTime(
      focusedDay.value.year,
      focusedDay.value.month + 1,
      0,
      23,
      59,
      59,
    );
    final monthEvents =
        all.where((e) {
          if (e.date == null) return false;
          final d = e.date!;
          return d.isAfter(start.subtract(const Duration(days: 1))) &&
              d.isBefore(end.add(const Duration(days: 1)));
        }).toList()..sort(
          (a, b) =>
              (a.date ?? DateTime.now()).compareTo(b.date ?? DateTime.now()),
        );
    upcomingEvents.assignAll(monthEvents);
  }

  List<EventModel> getEventsForDay(DateTime day) =>
      calendarData.value?.getEventsForDay(day) ?? [];

  void onDaySelected(DateTime selected, DateTime focused) {
    if (isSameDay(selectedDay.value, selected)) {
      // Toggle off selection if tapping same day
      selectedDay.value = null;
      selectedEvents.clear();
      focusedDay.value = focused;
    } else {
      selectedDay.value = selected;
      focusedDay.value = focused;
      updateSelectedEvents(selected);
    }
  }

  void updateSelectedEvents(DateTime day) =>
      selectedEvents.value = getEventsForDay(day);

  List<EventModel> get filteredUpcomingEvents => upcomingEvents;

  // ─── Month Mood ───────────────────────────────────────────────────────────

  String get monthMood {
    final month = focusedDay.value.month;
    const moods = {
      1: '❄️ mood_jan',
      2: '🕊️ mood_feb',
      3: '🌸 mood_mar',
      4: '🌿 mood_apr',
      5: '🌞 mood_may',
      6: '🥭 mood_jun',
      7: '🌧️ mood_jul',
      8: '🦚 mood_aug',
      9: '🐘 mood_sep',
      10: '🎨 mood_oct',
      11: '🪔 mood_nov',
      12: '🧘 mood_dec',
    };
    final key = moods[month] ?? '✨ mood_default';
    final parts = key.split(' ');
    final emoji = parts[0];
    final trKey = parts[1];
    return '$emoji ${trKey.tr}';
  }

  // ─── Heatmap Support ─────────────────────────────────────────────────────

  int getEventDensity(DateTime day) => getEventsForDay(day).length;

  // ─── Countdown ───────────────────────────────────────────────────────────

  int? getDaysUntil(DateTime targetDate) {
    final today = DateTime(
      DateTime.now().year,
      DateTime.now().month,
      DateTime.now().day,
    );
    final target = DateTime(targetDate.year, targetDate.month, targetDate.day);
    if (target.isBefore(today)) return null;
    return target.difference(today).inDays;
  }

  String getDaysUntilLabel(DateTime date) {
    final days = getDaysUntil(date);
    if (days == null) return 'cal_past'.tr;
    if (days == 0) return 'cal_today'.tr;
    if (days == 1) return 'cal_tomorrow'.tr;
    if (days <= 7) return '$days ${'cal_days_prep'.tr}';
    return '$days ${'days_left'.tr}';
  }

  // ─── Share ────────────────────────────────────────────────────────────────

  void shareEvent(EventModel event) {
    final title = event.title;
    final dateStr = event.date != null
        ? '${event.date!.day}/${event.date!.month}/${event.date!.year}'
        : '';
    final desc = event.description.length > 120
        ? '${event.description.substring(0, 120)}...'
        : event.description;
    final link = event.wikiLink ?? '';
    final text =
        '🎉 *$title* — $dateStr\n\n$desc'
        '${link.isNotEmpty ? '\n\n🔗 $link' : ''}'
        '\n\n${'share_via_utsav'.tr} 🙏';
    Share.share(text, subject: title);
  }

  // Formatted day label (e.g., Mon 14)
  String getDayLabel(DateTime date) {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[date.month - 1]} ${date.day} • ${weekdays[date.weekday - 1]}';
  }
}
