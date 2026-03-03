import 'package:flutter/foundation.dart';
import 'package:home_widget/home_widget.dart';
import '../models/event_model.dart';
import '../../modules/quotes/quotes_controller.dart';
import 'package:get/get.dart';

class WidgetService {
  WidgetService._();
  static final instance = WidgetService._();

  static const String _groupId = "group.com.utsav.app_festival";
  static const String _androidWidgetName = "UtsavWidgetProvider";
  // To be used if iOS is configured:
  // static const String _iosWidgetName = "UtsavWidget";

  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    try {
      await HomeWidget.setAppGroupId(_groupId);
      _initialized = true;
      debugPrint("[WidgetService] Initialized.");
    } catch (e) {
      debugPrint("[WidgetService] Failed to initialize: $e");
    }
  }

  Future<void> updateWidgetWithEvent(EventModel? event) async {
    if (!_initialized) await init();

    try {
      // 1. Save Event Data
      if (event != null) {
        final now = DateTime.now();
        final eventDate = event.nextOccurrence ?? event.date;

        String countdownText = "--";
        if (eventDate != null) {
          final diff = eventDate.difference(now).inDays;
          countdownText = diff == 0
              ? "Today!"
              : (diff < 0 ? "Past" : "$diff Days");
        }

        await HomeWidget.saveWidgetData<String>('title', event.title);
        await HomeWidget.saveWidgetData<String>('countdown', countdownText);
        // Save thumbnail path if available
        if (event.thumbnail != null) {
          await HomeWidget.saveWidgetData<String>(
            'thumbnail',
            event.thumbnail!,
          );
        } else {
          await HomeWidget.saveWidgetData<String>('thumbnail', '');
        }
      } else {
        await HomeWidget.saveWidgetData<String>(
          'title',
          "No upcoming festivals",
        );
        await HomeWidget.saveWidgetData<String>('countdown', "--");
        await HomeWidget.saveWidgetData<String>('thumbnail', '');
      }

      // 2. Save Daily Quote Data (Fallback to a default if not found)
      String quoteText =
          "Let the spirit of celebration bring joy and peace to your life.";
      String quoteAuthor = "Utsav";

      try {
        if (Get.isRegistered<QuotesController>()) {
          final quotes = Get.find<QuotesController>()
              .quotesList; // used quotesList instead of quotes
          if (quotes.isNotEmpty) {
            final today = DateTime.now();
            final q = quotes[today.day % quotes.length];
            quoteText = q.text;
            quoteAuthor = q.author;
          }
        }
      } catch (e) {
        debugPrint("[WidgetService] Failed to grab quote: $e");
      }

      await HomeWidget.saveWidgetData<String>('quote_text', quoteText);
      await HomeWidget.saveWidgetData<String>('quote_author', quoteAuthor);

      await HomeWidget.updateWidget(
        name: _androidWidgetName,
        iOSName: _androidWidgetName, // Replace with _iosWidgetName if added
      );

      debugPrint("[WidgetService] Widget fully updated.");
    } catch (e) {
      debugPrint("[WidgetService] Error updating widget: $e");
    }
  }
}
