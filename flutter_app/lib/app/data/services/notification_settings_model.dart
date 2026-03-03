import 'package:get_storage/get_storage.dart';

/// Stores user notification preferences.
/// All defaults are ON — users can turn off granularly.
class NotificationSettingsModel {
  static const _kFestivalEvents = 'notif_festival_events';
  static const _kCountdown = 'notif_countdown';
  static const _kWeeklyDigest = 'notif_weekly_digest';
  static const _kMonthlyDigest = 'notif_monthly_digest';
  static const _kPermAsked = 'notif_permission_asked';

  final GetStorage _s;

  NotificationSettingsModel([GetStorage? storage])
    : _s = storage ?? GetStorage();

  // ─── Getters ─────────────────────────────────────────────────────────────

  /// Day-of and eve notifications (most important)
  bool get festivalEvents => _s.read<bool>(_kFestivalEvents) ?? true;

  /// 7-day and 30-day countdowns
  bool get countdown => _s.read<bool>(_kCountdown) ?? true;

  /// Weekly Sunday digest
  bool get weeklyDigest => _s.read<bool>(_kWeeklyDigest) ?? true;

  /// Monthly 1st-of-month opener
  bool get monthlyDigest => _s.read<bool>(_kMonthlyDigest) ?? true;

  /// Whether we've already asked for permission (avoid re-asking)
  bool get permissionAsked => _s.read<bool>(_kPermAsked) ?? false;

  // ─── Setters ─────────────────────────────────────────────────────────────

  set festivalEvents(bool v) => _s.write(_kFestivalEvents, v);
  set countdown(bool v) => _s.write(_kCountdown, v);
  set weeklyDigest(bool v) => _s.write(_kWeeklyDigest, v);
  set monthlyDigest(bool v) => _s.write(_kMonthlyDigest, v);
  set permissionAsked(bool v) => _s.write(_kPermAsked, v);

  /// True if the user has at least one type of notification enabled.
  bool get anyEnabled =>
      festivalEvents || countdown || weeklyDigest || monthlyDigest;
}
