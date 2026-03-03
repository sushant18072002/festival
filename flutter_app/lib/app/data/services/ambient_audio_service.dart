import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';

import '../models/event_model.dart';

/// AmbientAudioService — Manages ambient audio playback for festival events.
///
/// - Singleton GetX service, registered globally at app start via global.dart
/// - Streams audio directly from S3/CDN via just_audio (no download to device)
/// - Manages audio session: pauses on phone calls, respects silent mode,
///   stops when headphones disconnected
/// - Smooth fade-in / fade-out transitions (1.6 seconds, 40 steps)
/// - Toggle same event, cross-fade when switching events
class AmbientAudioService extends GetxService {
  static AmbientAudioService get to => Get.find();

  final AudioPlayer _player = AudioPlayer();

  // ── Reactive State (use Obx() in widgets) ──────────────────────────────────
  final RxBool isPlaying = false.obs;
  final RxBool isLoading = false.obs;
  final RxBool hasError = false.obs;
  final RxString currentTitle = ''.obs;
  final RxString currentEventSlug = ''.obs;
  final RxDouble volume = 0.6.obs;
  final Rx<Duration> position = Duration.zero.obs;
  final Rx<Duration> duration = Duration.zero.obs;

  // CDN base URL — read from .env.prod (e.g. https://cdn.utsav.app or CloudFront)
  static String get _cdnBase {
    try {
      return dotenv.env['CDN_BASE_URL'] ?? '';
    } catch (_) {
      return '';
    }
  }

  // ── Fade config ────────────────────────────────────────────────────────────
  static const Duration _fadeStep = Duration(milliseconds: 40);
  static const int _fadeSteps = 40; // 40 × 40ms = 1.6s per fade direction

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  @override
  void onInit() {
    super.onInit();
    _initAudioSession();
    _bindPlayerStreams();
  }

  @override
  void onClose() {
    _player.dispose();
    super.onClose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Audio Session Setup
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _initAudioSession() async {
    final session = await AudioSession.instance;
    await session.configure(
      const AudioSessionConfiguration(
        avAudioSessionCategory: AVAudioSessionCategory.playback,
        avAudioSessionCategoryOptions:
            AVAudioSessionCategoryOptions.mixWithOthers,
        androidAudioAttributes: AndroidAudioAttributes(
          contentType: AndroidAudioContentType.music,
          usage: AndroidAudioUsage.media,
        ),
        androidAudioFocusGainType:
            AndroidAudioFocusGainType.gainTransientMayDuck,
      ),
    );

    // Pause/resume on audio interruptions (incoming calls, Siri, etc.)
    session.interruptionEventStream.listen((event) {
      if (event.begin) {
        _player.pause();
      } else if (event.type == AudioInterruptionType.pause ||
          event.type == AudioInterruptionType.duck) {
        _player.play();
      }
    });

    // Stop on headphone disconnect (Android "becoming noisy")
    session.becomingNoisyEventStream.listen((_) => _player.pause());
  }

  void _bindPlayerStreams() {
    _player.playingStream.listen((playing) => isPlaying.value = playing);
    _player.positionStream.listen((pos) => position.value = pos);
    _player.durationStream.listen((dur) {
      if (dur != null) duration.value = dur;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────

  /// Play ambient audio for an event. Toggles if same event tapped again.
  Future<void> playForEvent(EventModel event) async {
    HapticFeedback.lightImpact();

    // Same event → toggle play / pause
    if (currentEventSlug.value == event.slug) {
      if (isPlaying.value) {
        await _fadeOut(stop: false);
      } else {
        await _player.play();
        await _fadeIn(targetVolume: volume.value);
      }
      return;
    }

    // Different event → cross-fade
    if (isPlaying.value) {
      await _fadeOut(stop: false);
    }

    isLoading.value = true;
    hasError.value = false;
    currentEventSlug.value = event.slug;
    currentTitle.value = event.ambientAudio?.title.isNotEmpty == true
        ? event.ambientAudio!.title
        : '${event.title} Ambient';

    try {
      // Prefer CDN streaming (s3Key is a full HTTPS URL or S3 key path)
      final s3Key = event.ambientAudio?.s3Key;
      final AudioSource source;
      if (s3Key != null && s3Key.isNotEmpty) {
        // Stream directly from CDN — just_audio handles progressive buffering
        final uri = s3Key.startsWith('http')
            ? Uri.parse(s3Key)
            : Uri.parse('$_cdnBase/$s3Key');
        source = AudioSource.uri(uri);
      } else {
        // Fallback: local bundled MP3 (works offline, covers pre-CDN installs)
        source = AudioSource.asset('assets/audio/${event.slug}_ambient.mp3');
      }
      await _player.setAudioSource(source);
      // Ambient audio always loops seamlessly
      await _player.setLoopMode(LoopMode.one);
      await _player.setVolume(0.0);
      isLoading.value = false;
      await _player.play();
      await _fadeIn(targetVolume: volume.value);
    } catch (e) {
      isLoading.value = false;
      hasError.value = true;
      currentEventSlug.value = '';
      debugPrint('[AmbientAudio] Error: $e');
      Get.snackbar(
        'Audio Error',
        'Could not load ambient audio. Check your connection.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.black87,
        colorText: Colors.white70,
        icon: const Icon(Icons.error_outline_rounded, color: Colors.redAccent),
      );
    }
  }

  /// Stop playback and clear current state
  Future<void> stop() async {
    await _fadeOut(stop: true);
    currentEventSlug.value = '';
    currentTitle.value = '';
  }

  /// Adjust volume (0.0–1.0)
  Future<void> setVolume(double v) async {
    volume.value = v.clamp(0.0, 1.0);
    if (isPlaying.value) await _player.setVolume(volume.value);
  }

  /// Whether this event's audio is currently loaded (playing or paused)
  bool isActiveFor(String eventSlug) => currentEventSlug.value == eventSlug;

  // ─────────────────────────────────────────────────────────────────────────
  // Fade helpers
  // ─────────────────────────────────────────────────────────────────────────

  Future<void> _fadeIn({double? targetVolume}) async {
    final target = targetVolume ?? volume.value;
    for (int i = 0; i <= _fadeSteps; i++) {
      await _player.setVolume((i / _fadeSteps) * target);
      await Future.delayed(_fadeStep);
      if (!isPlaying.value && i < _fadeSteps) break;
    }
  }

  Future<void> _fadeOut({bool stop = true}) async {
    final startVol = _player.volume;
    for (int i = _fadeSteps; i >= 0; i--) {
      await _player.setVolume((i / _fadeSteps) * startVol);
      await Future.delayed(_fadeStep);
    }
    if (stop) {
      await _player.stop();
    } else {
      await _player.pause();
    }
  }
}
