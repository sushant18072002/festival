import 'package:flutter/foundation.dart';
import 'event_model.dart';

class CalendarData {
  final Map<int, Map<int, Map<int, List<EventModel>>>> years;

  CalendarData({required this.years});

  factory CalendarData.fromJson(Map<String, dynamic> json) {
    final years = <int, Map<int, Map<int, List<EventModel>>>>{};

    json.forEach((yearKey, yearVal) {
      try {
        final year = int.tryParse(yearKey);
        if (year != null && yearVal is Map) {
          final months = <int, Map<int, List<EventModel>>>{};
          yearVal.forEach((monthKey, monthVal) {
            final month = int.tryParse(monthKey);
            if (month != null && monthVal is Map) {
              final days = <int, List<EventModel>>{};
              monthVal.forEach((dayKey, dayVal) {
                final day = int.tryParse(dayKey);
                if (day != null && dayVal is List) {
                  try {
                    days[day] = dayVal
                        .map((e) => EventModel.fromJson(e))
                        .toList();
                  } catch (e) {
                    debugPrint(
                      'Calendar Parse Error (Event): Year $year Month $month Day $day: $e',
                    );
                    // rethrow; // Optional: suppress if we want partial load
                  }
                }
              });
              months[month] = days;
            }
          });
          years[year] = months;
        }
      } catch (e) {
        debugPrint('Calendar Parse Error (Year): Key $yearKey: $e');
      }
    });

    return CalendarData(years: years);
  }

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    years.forEach((year, months) {
      final yearMap = <String, dynamic>{};
      months.forEach((month, days) {
        final monthMap = <String, dynamic>{};
        days.forEach((day, events) {
          monthMap[day.toString()] = events.map((e) => e.toJson()).toList();
        });
        yearMap[month.toString()] = monthMap;
      });
      json[year.toString()] = yearMap;
    });
    return json;
  }

  List<EventModel> getEventsForDay(DateTime date) {
    return years[date.year]?[date.month]?[date.day] ?? [];
  }
}
