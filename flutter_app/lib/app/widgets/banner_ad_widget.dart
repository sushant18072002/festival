import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:get/get.dart';
import '../data/services/ad_service.dart';
import '../theme/app_colors.dart';

class BannerAdWidget extends StatefulWidget {
  final bool isLarge;
  const BannerAdWidget({super.key, this.isLarge = false});

  @override
  State<BannerAdWidget> createState() => _BannerAdWidgetState();
}

class _BannerAdWidgetState extends State<BannerAdWidget> {
  BannerAd? _bannerAd;
  bool _isLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadAd();
  }

  void _loadAd() {
    if (Get.isRegistered<AdService>()) {
      _bannerAd = Get.find<AdService>().loadBannerAd(
        onLoaded: () {
          if (mounted) {
            setState(() {
              _isLoaded = true;
            });
          }
        },
      );
    }
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<AdService>() ||
        !Get.find<AdService>().isAdsEnabled.value) {
      return const SizedBox.shrink();
    }

    return Obx(() {
      // Re-evaluate if ads get disabled at runtime
      if (!Get.find<AdService>().isAdsEnabled.value) {
        return const SizedBox.shrink();
      }

      if (_isLoaded && _bannerAd != null) {
        return Container(
          width: _bannerAd!.size.width.toDouble(),
          height: _bannerAd!.size.height.toDouble(),
          margin: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: AdWidget(ad: _bannerAd!),
        );
      }

      return const SizedBox.shrink();
    });
  }
}
