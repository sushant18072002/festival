import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';

/// Central registry for all system-wide assets.
enum GlobalAsset {
  success,
  error,
  loading,
  emptySearch,
  levelUp,
  tick,
}

/// AssetService — Manages system-wide Lottie animations and SFX.
/// Supports a "Hybrid" model: Local by default, with Remote S3 overrides via .env or JSON.
class AssetService extends GetxService {
  static AssetService get to => Get.find();

  final AudioPlayer _sfxPlayer = AudioPlayer();
  
  // -- Remote Overrides (usually loaded from a dynamic config JSON) --
  final _remoteOverrides = <GlobalAsset, String>{}.obs;

  @override
  void onInit() {
    super.onInit();
    _sfxPlayer.setVolume(0.5);
  }

  @override
  void onClose() {
    _sfxPlayer.dispose();
    super.onClose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Lottie Management
  // ─────────────────────────────────────────────────────────────────────────

  /// Gets the Lottie path/key for a global event.
  /// Returns the remote override if exists, otherwise the local asset path.
  String getLottie(GlobalAsset asset) {
    if (_remoteOverrides.containsKey(asset)) {
      return _remoteOverrides[asset]!;
    }

    switch (asset) {
      case GlobalAsset.success:
        return 'assets/lottie/celebration_confetti.json';
      case GlobalAsset.error:
        return 'assets/lottie/error_vibration.json';
      case GlobalAsset.loading:
        return 'assets/lottie/loading_mandala.json';
      case GlobalAsset.emptySearch:
        return 'assets/lottie/empty_state_search.json';
      case GlobalAsset.levelUp:
        return 'assets/lottie/level_up_sparkle.json';
      case GlobalAsset.tick:
        return ''; // Interaction tick doesn't have a default Lottie
    }
  }

  /// Manually set a remote override (called by DataRepository after fetching config)
  void setOverride(GlobalAsset asset, String s3Key) {
    _remoteOverrides[asset] = s3Key;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Sound Effects (SFX)
  // ─────────────────────────────────────────────────────────────────────────

  /// Plays a short audio feedback sound.
  Future<void> playSFX(GlobalAsset type) async {
    String assetPath;
    switch (type) {
      case GlobalAsset.success:
        assetPath = 'assets/audio/chime_success.aac';
        HapticFeedback.mediumImpact();
        break;
      case GlobalAsset.error:
        assetPath = 'assets/audio/buzz_error.aac';
        HapticFeedback.heavyImpact();
        break;
      default:
        assetPath = 'assets/audio/tick_interaction.aac';
        HapticFeedback.lightImpact();
    }

    try {
      await _sfxPlayer.setAudioSource(AudioSource.asset(assetPath));
      await _sfxPlayer.play();
    } catch (e) {
      debugPrint('[AssetService] SFX Error: $e');
    }
  }
}
