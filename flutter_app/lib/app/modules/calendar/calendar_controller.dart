import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../data/models/calendar_model.dart';
import '../../data/models/event_model.dart';
import '../../data/providers/data_repository.dart';

class CalendarController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();

  final calendarData = Rxn<CalendarData>();
  final focusedDay = DateTime.now().obs;
  final selectedDay = DateTime.now().obs;
  final selectedEvents = <EventModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchCalendarData();
  }

  Future<void> fetchCalendarData() async {
    final data = await _repository.getCalendarData(
      _repository.currentLang.value,
    );
    if (data != null) {
      calendarData.value = data;
      updateSelectedEvents(selectedDay.value);
    }
  }

  List<EventModel> getEventsForDay(DateTime day) {
    return calendarData.value?.getEventsForDay(day) ?? [];
  }

  void onDaySelected(DateTime selected, DateTime focused) {
    if (!isSameDay(selectedDay.value, selected)) {
      selectedDay.value = selected;
      focusedDay.value = focused;
      updateSelectedEvents(selected);
    }
  }

  void updateSelectedEvents(DateTime day) {
    selectedEvents.value = getEventsForDay(day);
  }

  // Phase 14: Month Mood
  String get monthMood {
    final month = focusedDay.value.month;
    switch (month) {
      case 1:
        return '❄️ Winter Harvests & New Solar Year';
      case 2:
        return '🕊️ Month of Devotion & Spring Hints';
      case 3:
        return '🌸 Spring of New Beginnings & Colors';
      case 4:
        return '🌿 Harvest Festivals & New Years';
      case 5:
        return '🌞 Peak Summer & Sacred Vows';
      case 6:
        return '🥭 Monsoon Arrival & Chariot Festivals';
      case 7:
        return '🌧️ Sacred Monsoons & Guru Worship';
      case 8:
        return '🦚 Month of Krishna & Sibling Bonds';
      case 9:
        return '🐘 Wisdom, Obstacles Removed & Ancestors';
      case 10:
        return '🎨 The Great Festival Season Begins';
      case 11:
        return '🪔 Festival of Lights & Gratitude';
      case 12:
        return '🧘 Winter Solstice & Serene Nights';
      default:
        return '✨ A Time for Celebration';
    }
  }

  // Phase 14: Heatmap Support
  int getEventDensity(DateTime day) {
    return getEventsForDay(day).length;
  }

  // Phase 14: Countdown Chip Support
  int? getDaysUntil(DateTime targetDate) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(targetDate.year, targetDate.month, targetDate.day);

    if (target.isBefore(today)) return null; // Past event
    return target.difference(today).inDays;
  }
}
