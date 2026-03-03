import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

class AdService extends GetxService {
  static AdService get instance => Get.find<AdService>();

  final _storage = GetStorage();
  final isAdsEnabled = true.obs;

  @override
  void onInit() {
    super.onInit();
    isAdsEnabled.value = _storage.read<bool>('ads_enabled') ?? true;
    if (isAdsEnabled.value) {
      _initGoogleMobileAds();
    }
  }

  Future<void> _initGoogleMobileAds() async {
    try {
      await MobileAds.instance.initialize();
      debugPrint('[AdService] AdMob Initialized');
    } catch (e) {
      debugPrint('[AdService] AdMob Init Failed: $e');
    }
  }

  void toggleAds(bool enabled) {
    isAdsEnabled.value = enabled;
    _storage.write('ads_enabled', enabled);
    if (enabled) {
      _initGoogleMobileAds();
    }
  }

  // --- Ad Unit IDs (Test IDs for Development) ---
  // Replace these with real IDs in production matching your package name

  String get bannerAdUnitId {
    if (GetPlatform.isAndroid) return 'ca-app-pub-3940256099942544/6300978111';
    if (GetPlatform.isIOS) return 'ca-app-pub-3940256099942544/2934735716';
    return '';
  }

  String get interstitialAdUnitId {
    if (GetPlatform.isAndroid) return 'ca-app-pub-3940256099942544/1033173712';
    if (GetPlatform.isIOS) return 'ca-app-pub-3940256099942544/4411468910';
    return '';
  }

  String get rewardedAdUnitId {
    if (GetPlatform.isAndroid) return 'ca-app-pub-3940256099942544/5224354917';
    if (GetPlatform.isIOS) return 'ca-app-pub-3940256099942544/1712485313';
    return '';
  }

  // --- Ad Loaders ---

  BannerAd? loadBannerAd({required Function() onLoaded}) {
    if (!isAdsEnabled.value) return null;

    final banner = BannerAd(
      adUnitId: bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) => onLoaded(),
        onAdFailedToLoad: (ad, error) {
          debugPrint('BannerAd failed to load: $error');
          ad.dispose();
        },
      ),
    );
    banner.load();
    return banner;
  }

  Future<void> showInterstitialAd(Function() onComplete) async {
    if (!isAdsEnabled.value) {
      onComplete();
      return;
    }

    InterstitialAd.load(
      adUnitId: interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              onComplete();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              onComplete();
            },
          );
          ad.show();
        },
        onAdFailedToLoad: (error) {
          debugPrint('InterstitialAd failed to load: $error');
          onComplete();
        },
      ),
    );
  }

  Future<void> showRewardedAd({
    required Function() onEarnedReward,
    required Function() onComplete,
  }) async {
    if (!isAdsEnabled.value) {
      onEarnedReward();
      onComplete();
      return;
    }

    RewardedAd.load(
      adUnitId: rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              onComplete();
            },
            onAdFailedToShowFullScreenContent: (ad, error) {
              ad.dispose();
              onComplete();
            },
          );
          ad.show(
            onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
              onEarnedReward();
            },
          );
        },
        onAdFailedToLoad: (error) {
          debugPrint('RewardedAd failed to load: $error');
          onComplete(); // Failsafe
        },
      ),
    );
  }
}
