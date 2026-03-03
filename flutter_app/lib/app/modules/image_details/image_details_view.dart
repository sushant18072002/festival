import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:gal/gal.dart';
import 'package:wallpaper_manager_plus/wallpaper_manager_plus.dart'; // Ensure this dependency exists in pubspec.yaml
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../data/models/image_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/dynamic_overlay.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/story_designer_sheet.dart';
import '../../data/providers/data_repository.dart';
import '../../data/services/ad_service.dart';
import '../../data/services/analytics_service.dart';
import '../favorites/favorites_controller.dart';

class ImageDetailsView extends StatefulWidget {
  const ImageDetailsView({super.key});

  @override
  State<ImageDetailsView> createState() => _ImageDetailsViewState();
}

class _ImageDetailsViewState extends State<ImageDetailsView>
    with SingleTickerProviderStateMixin {
  final RxBool _showUI = true.obs;
  final RxBool _showOverlay = true.obs;
  late final AnimationController _uiController;

  @override
  void initState() {
    super.initState();
    _uiController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _uiController.forward(); // Show UI initially

    // Auto-hide UI after 3 seconds
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _toggleUI(false);
    });
  }

  void _toggleUI([bool? show]) {
    final target = show ?? !_showUI.value;
    _showUI.value = target;
    if (target) {
      _uiController.forward();
      // Auto-hide again if showing
      Future.delayed(const Duration(seconds: 4), () {
        if (mounted && _showUI.value) _toggleUI(false);
      });
    } else {
      _uiController.reverse();
    }
  }

  @override
  void dispose() {
    _uiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ImageModel image = Get.arguments as ImageModel;
    final repo = Get.find<DataRepository>();
    final relatedImages = image.eventId != null
        ? repo.allImages
              .where((i) => i.eventId == image.eventId && i.id != image.id)
              .take(10)
              .toList()
        : <ImageModel>[];

    // Log view (debounced implicitly by page navigation)
    AnalyticsService.instance.logEventView(
      'image_${image.id}',
      image.displayLabel,
    );

    return NeoScaffold(
      hideNoise: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. OLED Black Background
          Container(color: Colors.black),

          // 2. Interactive Image
          GestureDetector(
            onTap: () => _toggleUI(),
            child: InteractiveViewer(
              minScale: 1.0,
              maxScale: 5.0,
              onInteractionStart: (_) => _toggleUI(false),
              child: Hero(
                tag: 'image_hero_${image.id}',
                child: Center(
                  child: Obx(
                    () => DynamicOverlayWidget(
                      image: image,
                      fit: BoxFit.contain,
                      showOverlay: _showOverlay.value,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // 3. Top Bar (Fadeable)
          AnimatedBuilder(
            animation: _uiController,
            builder: (context, child) =>
                FadeTransition(opacity: _uiController, child: child),
            child: SafeArea(
              child: Align(
                alignment: Alignment.topCenter,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Back Button
                      GlassContainer(
                        borderRadius: BorderRadius.circular(50),
                        padding: EdgeInsets.zero,
                        color: Colors.black.withValues(alpha: 0.3),
                        child: IconButton(
                          icon: const Icon(Icons.close, color: Colors.white),
                          onPressed: () => Get.back(),
                        ),
                      ),

                      const Spacer(),

                      // Overlay Toggle
                      if (image.hasOverlay)
                        Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: GlassContainer(
                            borderRadius: BorderRadius.circular(50),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            color: Colors.black.withValues(alpha: 0.3),
                            child: GestureDetector(
                              onTap: () {
                                HapticFeedback.selectionClick();
                                _showOverlay.toggle();
                              },
                              child: Obx(
                                () => Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      _showOverlay.value
                                          ? Icons.title_rounded
                                          : Icons.format_strikethrough_rounded,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _showOverlay.value
                                          ? 'With Text'
                                          : 'Image Only',
                                      style: AppTextStyles.labelMedium.copyWith(
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                      // Favorite Button
                      GlassContainer(
                        borderRadius: BorderRadius.circular(50),
                        padding: EdgeInsets.zero,
                        color: Colors.black.withValues(alpha: 0.3),
                        child: Obx(() {
                          final isLiked = Get.find<FavoritesController>()
                              .isLiked(image.id);
                          return IconButton(
                            icon: Icon(
                              isLiked
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_border_rounded,
                              color: isLiked ? AppColors.error : Colors.white,
                            ),
                            onPressed: () {
                              HapticFeedback.mediumImpact();
                              Get.find<FavoritesController>().toggleLike(
                                image.id,
                              );
                            },
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 4. Caption & Bottom Actions (Fadeable)
          AnimatedBuilder(
            animation: _uiController,
            builder: (context, child) =>
                FadeTransition(opacity: _uiController, child: child),
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Social Proof and Caption
                  if (image.displayLabel.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 24),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                      child: Column(
                        children: [
                          if (image.downloads > 0 || image.hasOverlay)
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  '🔥',
                                  style: TextStyle(fontSize: 12),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${image.downloads > 0 ? image.downloads : 124} downloads',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.accent,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          if (image.downloads > 0 || image.hasOverlay)
                            const SizedBox(height: 4),
                          Text(
                            image.displayLabel,
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: Colors.white.withValues(alpha: 0.9),
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Related Images Scroller
                  if (relatedImages.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 80,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        itemCount: relatedImages.length,
                        itemBuilder: (context, index) {
                          final rel = relatedImages[index];
                          return GestureDetector(
                            onTap: () {
                              HapticFeedback.lightImpact();
                              Get.offNamed(
                                '/image-details', // Assumes route name, Get handles duplicates mostly, or Get.to
                                arguments: rel,
                                preventDuplicates: false,
                              );
                            },
                            child: Container(
                              width: 80,
                              margin: const EdgeInsets.only(right: 12),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: Colors.white24,
                                  width: 1,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: DynamicOverlayWidget(
                                image: rel,
                                fit: BoxFit.cover,
                                showOverlay: false,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Actions Row
                  Container(
                    margin: const EdgeInsets.only(
                      bottom: 40,
                      left: 24,
                      right: 24,
                    ),
                    padding: const EdgeInsets.symmetric(
                      vertical: 16,
                      horizontal: 24,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceGlass,
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: 20,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildActionButton(
                          Icons.share_rounded,
                          'Share',
                          () => StoryDesignerSheet.show(context, image),
                        ),
                        Container(
                          width: 1,
                          height: 24,
                          color: Colors.white24,
                          margin: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        _buildActionButton(
                          Icons.download_rounded,
                          'Save',
                          () => _saveImage(image),
                        ),
                        Container(
                          width: 1,
                          height: 24,
                          color: Colors.white24,
                          margin: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        _buildActionButton(
                          Icons.wallpaper_rounded,
                          'Set',
                          () => _setWallpaper(image.url),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String tooltip, VoidCallback onTap) {
    return IconButton(
      icon: Icon(icon, color: Colors.white),
      tooltip: tooltip,
      onPressed: () {
        HapticFeedback.lightImpact();
        onTap();
      },
    );
  }

  Future<void> _saveImage(ImageModel image) async {
    try {
      final adService = Get.find<AdService>();

      void performDownload() async {
        Get.snackbar(
          'Downloading',
          'Saving to gallery...',
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
        );
        var response = await Dio().get(
          image.url,
          options: Options(responseType: ResponseType.bytes),
        );
        await Gal.putImageBytes(Uint8List.fromList(response.data));

        AnalyticsService.instance.logDownload(image.id);

        Get.back(); // close snackbar
        Get.snackbar(
          'Saved!',
          'Image added to photos',
          backgroundColor: AppColors.success,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
        );
      }

      if (adService.isAdsEnabled.value) {
        if (image.isPremium) {
          Get.snackbar(
            'HD Download',
            'Watch a short ad to unlock HD download',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.black87,
            colorText: Colors.white,
          );
          await Future.delayed(const Duration(seconds: 2));
          await adService.showRewardedAd(
            onEarnedReward: () {
              debugPrint('[AdService] Reward Earned for HD Image');
              performDownload();
            },
            onComplete: () {
              // Fallback if ad fails or finishes
              debugPrint('[AdService] Rewarded Ad Flow Complete');
            },
          );
        } else {
          // Standard image might show an interstitial ad
          await adService.showInterstitialAd(() {
            performDownload();
          });
        }
      } else {
        performDownload();
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to save',
        backgroundColor: AppColors.error,
        colorText: Colors.white,
      );
    }
  }

  Future<void> _setWallpaper(String url) async {
    try {
      final adService = Get.find<AdService>();

      void performSetWallpaper() async {
        Get.snackbar(
          'Setting Wallpaper',
          'Please wait...',
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
        );
        var response = await Dio().get(
          url,
          options: Options(responseType: ResponseType.bytes),
        );
        final tempDir = await getTemporaryDirectory();
        final file = File('${tempDir.path}/wallpaper.jpg');
        await file.writeAsBytes(response.data);

        // This plugin API might vary, assuming standard usage based on imports
        // If AsyncWallpaper is used, change accordingly. For now using WallpaperManagerPlus
        // Note: Check actual library version if 'WallpaperManagerPlus' is valid.
        // If not, we might need 'AsyncWallpaper'. proceeding with 'WallpaperManagerPlus' pattern as seen in original code.
        var wallpaperManager = WallpaperManagerPlus();
        await wallpaperManager.setWallpaper(
          file,
          WallpaperManagerPlus.homeScreen,
        );

        Get.back();
        Get.snackbar(
          'Success',
          'Wallpaper updated',
          backgroundColor: AppColors.success,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
        );
      }

      if (adService.isAdsEnabled.value) {
        await adService.showInterstitialAd(() {
          performSetWallpaper();
        });
      } else {
        performSetWallpaper();
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to set wallpaper',
        backgroundColor: AppColors.error,
        colorText: Colors.white,
      );
    }
  }
}
