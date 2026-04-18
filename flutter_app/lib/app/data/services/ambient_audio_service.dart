import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_session/audio_session.dart';

import '../models/event_model.dart';
import 'audio_cache_manager.dart';

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
  int _currentFadeId = 0;
  DateTime _lastOperationTime = DateTime.fromMillisecondsSinceEpoch(0);

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
    final now = DateTime.now();
    final timeSinceLast = now.difference(_lastOperationTime);
    
    debugPrint('[AmbientAudio] Entering playForEvent: ${event.slug}');

    if (timeSinceLast < const Duration(milliseconds: 400)) {
       debugPrint('[AmbientAudio] Skipping: Debounced');
       return;
    }

    _lastOperationTime = now;
    HapticFeedback.lightImpact();

    try {
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
        _fadeOut(stop: false); // Fire and forget, _currentFadeId handles conflicts
      }

      isLoading.value = true;
      hasError.value = false;
      currentEventSlug.value = event.slug;
      currentTitle.value = event.ambientAudio?.title.isNotEmpty == true
          ? event.ambientAudio!.title
          : '${event.title} Ambient';

      String? s3Key = event.ambientAudio?.s3Key;
      String? fallbackFile = event.ambientAudio?.filename;

      if (s3Key != null && s3Key.isNotEmpty) {
        // --- 1. S3 Path Resolution & Folder Intelligence ---
        String finalKey = s3Key;
        if (!finalKey.startsWith('http') && !finalKey.contains('/')) {
          // Default Event Folder
          finalKey = 'audio/originals/$finalKey';
        }

        String cleanKey = finalKey.startsWith('/') ? finalKey.substring(1) : finalKey;
        
        // Resilient Check: Avoid double-root segments (e.g., Utsav/stage/Utsav/stage/...)
        final Uri baseUri = Uri.parse(_cdnBase);
        String basePath = baseUri.path;
        if (basePath.startsWith('/')) basePath = basePath.substring(1);
        if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);

        if (basePath.isNotEmpty && cleanKey.startsWith(basePath)) {
          cleanKey = cleanKey.substring(basePath.length);
          if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);
        }

        final fullUrl = (cleanKey.startsWith('http') || _cdnBase.isEmpty)
            ? cleanKey
            : (_cdnBase.endsWith('/') ? '$_cdnBase$cleanKey' : '$_cdnBase/$cleanKey');

        // --- 2. Offline-First Check ---
        final localPath = await AudioCacheManager.getLocalPath(fullUrl);
        if (localPath != null) {
          debugPrint('[AmbientAudio] Playing Event from PERMANENT CACHE: $localPath');
          await _player.setAudioSource(AudioSource.file(localPath));
        } else {
          debugPrint('[AmbientAudio] Streaming Event + Downloading: $fullUrl');
          AudioCacheManager.downloadToCache(fullUrl);
          
          try {
            await _player.setAudioSource(
              LockCachingAudioSource(Uri.parse(fullUrl)), 
              preload: true
            ).timeout(const Duration(seconds: 10));
          } catch (e) {
            debugPrint('[AmbientAudio] Streaming failed: $e. Falling back to Local/Global Asset.');
            await _playFallbackAsset(fallbackFile ?? '${event.slug}_ambient.aac');
          }
        }
      } else {
        // --- 3. No S3 Key: Try Local Asset OR Global 'Atmosphere' Fallback ---
        await _playFallbackAsset(fallbackFile ?? '${event.slug}_ambient.aac');
      }
      
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
      // Log error but avoid disruptive Snackbar for automatic ambient transitions
      debugPrint('[AmbientAudio] Error loading audio: $e');
    }
  }

  /// Plays a custom audio file (e.g., for Mantras or Quotes) via its S3 key.
  Future<void> playCustomAudio({
    required String s3Key,
    required String title,
    String slug = 'custom',
  }) async {
    final now = DateTime.now();
    final timeSinceLast = now.difference(_lastOperationTime);
    
    debugPrint('[AmbientAudio] Entering playCustomAudio: $slug');

    if (timeSinceLast < const Duration(milliseconds: 400)) {
       debugPrint('[AmbientAudio] Skipping: Debounced');
       return;
    }

    _lastOperationTime = now;
    HapticFeedback.lightImpact();

    try {
      // Toggle if same slug
      if (currentEventSlug.value == slug) {
        if (isPlaying.value) {
          await _fadeOut(stop: false);
        } else {
          await _player.play();
          await _fadeIn(targetVolume: volume.value);
        }
        return;
      }

      if (isPlaying.value) {
        _fadeOut(stop: false); // Fire and forget, _currentFadeId handles conflicts
      }

      isLoading.value = true;
      hasError.value = false;
      currentEventSlug.value = slug;
      currentTitle.value = title;

      // Smart URL Resolution & Folder Intelligence
      String finalKey = s3Key;
      if (!finalKey.startsWith('http') && !finalKey.contains('/')) {
        // MANTRA Detection: If slug contains 'mantra' and no folder provided, use mantras folder
        if (slug.contains('mantra')) {
          finalKey = 'audio/mantras/$finalKey';
        } else {
          finalKey = 'audio/originals/$finalKey';
        }
      }

      String cleanKey = finalKey.startsWith('/') ? finalKey.substring(1) : finalKey;
      
      // Resilient Check: Avoid double-root segments
      final Uri baseUri = Uri.parse(_cdnBase);
      String basePath = baseUri.path;
      if (basePath.startsWith('/')) basePath = basePath.substring(1);
      if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);

      if (basePath.isNotEmpty && cleanKey.startsWith(basePath)) {
        cleanKey = cleanKey.substring(basePath.length);
        if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);
      }

      final fullUrl = (cleanKey.startsWith('http') || _cdnBase.isEmpty)
          ? cleanKey
          : (_cdnBase.endsWith('/') ? '$_cdnBase$cleanKey' : '$_cdnBase/$cleanKey');

      // Check Offline Cache First
      final localPath = await AudioCacheManager.getLocalPath(fullUrl);
      if (localPath != null) {
        debugPrint('[AmbientAudio] Playing CUSTOM from PERMANENT CACHE: $localPath');
        await _player.setAudioSource(AudioSource.file(localPath));
      } else {
        debugPrint('[AmbientAudio] Streaming Custom + Downloading: $fullUrl');
        AudioCacheManager.downloadToCache(fullUrl);

        await _player.setAudioSource(
          LockCachingAudioSource(Uri.parse(fullUrl)),
          preload: true,
        ).timeout(const Duration(seconds: 10));
      }
      
      await _player.setLoopMode(LoopMode.one);
      await _player.setVolume(0.0);
      isLoading.value = false;
      await _player.play();
      await _fadeIn(targetVolume: volume.value);
    } catch (e) {
      isLoading.value = false;
      hasError.value = true;
      currentEventSlug.value = '';
      debugPrint('[AmbientAudio] Custom load failed: $e');
    }
  }

  /// Plays a local asset with a global atmosphere fallback policy.
  Future<void> _playFallbackAsset(String filename) async {
    try {
      debugPrint('[AmbientAudio] Trying primary local asset: $filename');
      await _player.setAudioSource(
        AudioSource.asset('assets/audio/$filename')
      );
    } catch (e) {
      debugPrint('[AmbientAudio] Local asset failed, using GLOBAL ATMOSPHERE fallback.');
      // Atmosphere First Policy: If specific audio is missing, play the meditation pad
      // to ensure the app experience feels premium and sacred.
      await _player.setAudioSource(
        AudioSource.asset('assets/audio/meditation_pad.aac')
      );
    }
  }
  /// Proactively downloads an audio file to the local cache for offline use.
  Future<void> preCache(String s3Key) async {
    if (s3Key.isEmpty) return;
    try {
      // Smart URL Resolution
      String finalKey = s3Key;
      if (!finalKey.startsWith('http') && !finalKey.contains('/')) {
        finalKey = 'audio/originals/$finalKey';
      }

      final uri = finalKey.startsWith('http')
          ? Uri.parse(finalKey)
          : Uri.parse('$_cdnBase/${finalKey.startsWith('/') ? finalKey.substring(1) : finalKey}');
      
      // Creating the source triggers the download/cache logic in just_audio
      final source = LockCachingAudioSource(uri);
      await source.resolve(); 
      debugPrint('[AmbientAudio] Successfully pre-cached: $s3Key');
    } catch (e) {
      debugPrint('[AmbientAudio] Pre-cache failed for $s3Key: $e');
    }
  }

  /// Stop playback and clear current state
  Future<void> stop() async {
    await _fadeOut(stop: true);
    currentEventSlug.value = '';
    currentTitle.value = '';
    hasError.value = false;
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
    final fadeId = ++_currentFadeId;
    final target = targetVolume ?? volume.value;
    
    debugPrint('[AmbientAudio] Starting FadeIn ($fadeId) -> Target: $target');
    
    // 250ms delay to allow OS audio session to fully stabilize after play()
    await Future.delayed(const Duration(milliseconds: 250));
    
    try {
      for (int i = 0; i <= _fadeSteps; i++) {
        // Break if a newer fade operation has started
        if (fadeId != _currentFadeId) {
          debugPrint('[AmbientAudio] Aborting FadeIn ($fadeId): Newer operation detected');
          return;
        }

        final nextVol = (i / _fadeSteps) * target;
        await _player.setVolume(nextVol);
        
        if (i % 10 == 0) {
          debugPrint('[AmbientAudio] FadeIn ($fadeId) Step $i/$_fadeSteps - Vol: ${nextVol.toStringAsFixed(2)}');
        }

        await Future.delayed(_fadeStep);
        if (i > 5 && !isPlaying.value && i < _fadeSteps) break;
      }
      debugPrint('[AmbientAudio] FadeIn ($fadeId) Complete');
    } catch (e) {
       debugPrint('[AmbientAudio] FadeIn ($fadeId) Error: $e');
    }
  }

  Future<void> _fadeOut({bool stop = true}) async {
    final fadeId = ++_currentFadeId;
    final startVol = _player.volume;
    
    debugPrint('[AmbientAudio] Starting FadeOut ($fadeId) from $startVol');

    try {
      for (int i = _fadeSteps; i >= 0; i--) {
        if (fadeId != _currentFadeId) {
          debugPrint('[AmbientAudio] Aborting FadeOut ($fadeId): Newer operation detected');
          return;
        }

        final nextVol = (i / _fadeSteps) * startVol;
        await _player.setVolume(nextVol);
        await Future.delayed(_fadeStep);
      }
      
      if (stop) {
        await _player.stop();
      } else {
        await _player.pause();
      }
      debugPrint('[AmbientAudio] FadeOut ($fadeId) Complete (Mode: ${stop ? 'Stop' : 'Pause'})');
    } catch (e) {
       debugPrint('[AmbientAudio] FadeOut ($fadeId) Error: $e');
    }
  }
}
