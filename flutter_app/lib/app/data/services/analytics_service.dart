import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import '../../../firebase_options.dart';

/// Centralized service for application analytics.
/// Currently defaults to debug logging. Once Firebase is configured via
/// `flutterfire configure`, uncomment the Firebase implementations.
class AnalyticsService extends GetxService {
  static AnalyticsService get instance => Get.find();

  late final FirebaseAnalytics _analytics;

  Future<AnalyticsService> init() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      _analytics = FirebaseAnalytics.instance;
      debugPrint('[AnalyticsService] Firebase Analytics Initialized');
    } catch (e) {
      debugPrint('[AnalyticsService] Cannot init firebase: $e');
    }
    return this;
  }

  /// Log a screen/event view
  Future<void> logEventView(String eventId, String title) async {
    _debugLog('Event View', {'id': eventId, 'title': title});
    try {
      await _analytics.logEvent(
        name: 'view_festival',
        parameters: {'festival_id': eventId, 'title': title},
      );
    } catch (_) {}
  }

  /// Log when a user interacts with the share button
  Future<void> logShare(String itemId, String contentType) async {
    _debugLog('Share', {'item_id': itemId, 'type': contentType});
    try {
      await _analytics.logShare(
        contentType: contentType,
        itemId: itemId,
        method: 'native_share',
      );
    } catch (_) {}
  }

  /// Log when an image/card is downloaded to the local device
  Future<void> logDownload(String imageId) async {
    _debugLog('Download Image', {'image_id': imageId});
    try {
      await _analytics.logEvent(
        name: 'download_media',
        parameters: {'image_id': imageId},
      );
    } catch (_) {}
  }

  /// Log gamification - completed compatibility quiz
  Future<void> logQuizCompleted(String quizId, int karmaEarned) async {
    _debugLog('Quiz Completed', {'quiz': quizId, 'karma': karmaEarned});
    try {
      await _analytics.logEvent(
        name: 'quiz_completed',
        parameters: {'quiz_id': quizId, 'karma_awarded': karmaEarned},
      );
    } catch (_) {}
  }

  /// Log gamification - answered daily trivia
  Future<void> logTriviaAnswered(bool isCorrect) async {
    _debugLog('Trivia Answered', {'correct': isCorrect});
    try {
      await _analytics.logEvent(
        name: 'trivia_answered',
        parameters: {'correct': isCorrect.toString()},
      );
    } catch (_) {}
  }

  /// Log when an ad completes successfully
  Future<void> logAdWatched(String adType) async {
    _debugLog('Ad Watched', {'type': adType});
    try {
      await _analytics.logAdImpression(adUnitName: adType);
    } catch (_) {}
  }

  void _debugLog(String eventName, Map<String, dynamic> params) {
    if (kDebugMode) {
      debugPrint('[Analytics] 📊 $eventName: $params');
    }
  }
}
