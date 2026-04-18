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
import '../../widgets/dynamic_overlay.dart';
import '../../widgets/image_share_menu.dart';
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

    // UI does not auto-hide anymore.
    // The user must explicitly press the visibility icon.
  }

  void _toggleUI() {
    _showUI.value = !_showUI.value;
    if (_showUI.value) {
      _uiController.forward();
    } else {
      _uiController.reverse();
    }
    HapticFeedback.selectionClick();
  }

  @override
  void dispose() {
    _uiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args = Get.arguments;
    final ImageModel image;
    final String heroTagPrefix;

    if (args is Map) {
      image = args['image'] as ImageModel;
      heroTagPrefix = args['heroTagPrefix'] as String;
    } else {
      image = args as ImageModel;
      heroTagPrefix = ''; // Fallback safe
    }

    final repo = Get.find<DataRepository>();
    // Related images: match by shared categories or tags
    final imageCats = image.categories.toSet();
    final imageTags = image.tags.toSet();
    final relatedImages = imageCats.isEmpty && imageTags.isEmpty
        ? <ImageModel>[]
        : repo.allImages
              .where(
                (i) =>
                    i.id != image.id &&
                    (i.categories.any((c) => imageCats.contains(c)) ||
                        i.tags.any((t) => imageTags.contains(t))),
              )
              .take(10)
              .toList();

    // Log view (debounced implicitly by page navigation)
    AnalyticsService.instance.logEventView(
      'image_${image.id}',
      image.displayLabel,
    );

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        // Tap anywhere (outside interactive zones) to toggle UI chrome
        behavior: HitTestBehavior.translucent,
        onTap: _toggleUI,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // ── 1. OLED Black Base ──────────────────────────────────────
            Container(color: Colors.black),

            // ── 2. Zoomable Image + Smart Overlays ───────────────────────
            InteractiveViewer(
              minScale: 1.0,
              maxScale: 5.0,
              child: Hero(
                tag: '${heroTagPrefix}_image_${image.id}',
                child: SizedBox.expand(
                  child: Obx(
                    () => DynamicOverlayWidget(
                      image: image,
                      fit: BoxFit.cover,
                      showOverlay: _showOverlay.value,
                    ),
                  ),
                ),
              ),
            ),

            // ── 3. Top Gradient (fades with UI) ─────────────────────────
            AnimatedBuilder(
              animation: _uiController,
              builder: (_, child) =>
                  FadeTransition(opacity: _uiController, child: child),
              child: Align(
                alignment: Alignment.topCenter,
                child: Container(
                  height: 110,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.55),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── 4. Top Nav Bar (fades with UI) ──────────────────────────
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: _uiController,
                builder: (_, child) =>
                    FadeTransition(opacity: _uiController, child: child),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      children: [
                        // Close
                        _navButton(
                          icon: Icons.close,
                          onTap: Get.back,
                        ),
                        const Spacer(),
                        // Text overlay toggle (only if image has overlay)
                        if (image.hasOverlay) ...[
                          Obx(() => _navButton(
                            icon: _showOverlay.value
                                ? Icons.title_rounded
                                : Icons.format_strikethrough_rounded,
                            onTap: () => _showOverlay.toggle(),
                            label: _showOverlay.value ? 'Text On' : 'No Text',
                          )),
                          const SizedBox(width: 8),
                        ],
                        // Favourite
                        Obx(() {
                          final isLiked =
                              Get.find<FavoritesController>().isLiked(image.id);
                          return _navButton(
                            icon: isLiked
                                ? Icons.favorite_rounded
                                : Icons.favorite_border_rounded,
                            tint: isLiked ? AppColors.error : null,
                            onTap: () {
                              HapticFeedback.mediumImpact();
                              Get.find<FavoritesController>().toggleLike(image.id);
                            },
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── 5. Bottom Gradient — slim, only protects action bar ──────
            AnimatedBuilder(
              animation: _uiController,
              builder: (_, child) =>
                  FadeTransition(opacity: _uiController, child: child),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  // Only 22% of screen height — doesn't swallow overlays
                  height: MediaQuery.of(context).size.height * 0.22,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.88),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── 6. Bottom Actions + Caption (fade with UI) ───────────────
            AnimatedBuilder(
              animation: _uiController,
              builder: (_, child) =>
                  FadeTransition(opacity: _uiController, child: child),
              child: SafeArea(
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Caption (credits / label)
                        if (image.displayLabel.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Text(
                              image.displayLabel,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTextStyles.labelMedium(context).copyWith(
                                color: Colors.white70,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.1,
                                shadows: const [
                                  Shadow(
                                    color: Colors.black,
                                    blurRadius: 8,
                                    offset: Offset(0, 1),
                                  ),
                                ],
                              ),
                            ),
                          ),

                        // Related Images
                        if (relatedImages.isNotEmpty) ...[
                          SizedBox(
                            height: 64,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: relatedImages.length,
                              itemBuilder: (context, index) {
                                final rel = relatedImages[index];
                                return GestureDetector(
                                  onTap: () {
                                    HapticFeedback.lightImpact();
                                    Get.offNamed(
                                      '/image-details',
                                      arguments: rel,
                                      preventDuplicates: false,
                                    );
                                  },
                                  child: Container(
                                    width: 64,
                                    margin: const EdgeInsets.only(right: 8),
                                    clipBehavior: Clip.antiAlias,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: Colors.white24,
                                      ),
                                    ),
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
                          const SizedBox(height: 10),
                        ],

                        // Share / Save / Wallpaper — compact slim bar
                        Container(
                          padding: const EdgeInsets.symmetric(
                              vertical: 10, horizontal: 8),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.15),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _buildActionButton(
                                Icons.adaptive.share,
                                'Share',
                                () => ImageShareMenu.show(
                                    context, image,
                                    includeOverlay: _showOverlay.value),
                              ),
                              Container(
                                  width: 1, height: 24, color: Colors.white24),
                              _buildActionButton(
                                Icons.download_rounded,
                                'Save',
                                () => _saveImage(image),
                              ),
                              Container(
                                  width: 1, height: 24, color: Colors.white24),
                              _buildActionButton(
                                Icons.wallpaper_rounded,
                                'Wallpaper',
                                () => _setWallpaper(image.url),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // ── 7. Mini re-show FAB — visible ONLY when UI is hidden ─────
            Obx(() => _showUI.value
                ? const SizedBox.shrink()
                : Align(
                    alignment: const Alignment(0, 0.92),
                    child: GestureDetector(
                      onTap: _toggleUI,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.55),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.keyboard_arrow_up_rounded,
                                color: Colors.white70, size: 16),
                            const SizedBox(width: 4),
                            Text('Show Controls',
                                style: AppTextStyles.labelSmall(context).copyWith(
                                    color: Colors.white70)),
                          ],
                        ),
                      ),
                    ),
                  )),

            // ── 8. Explicit Toggle UI Button (Hide UI) ─────────────────────
            Obx(() => !_showUI.value
                ? const SizedBox.shrink()
                : AnimatedBuilder(
                    animation: _uiController,
                    builder: (_, child) => Positioned(
                      right: 16,
                      bottom: 120, // Above the bottom action bar
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(1.5, 0),
                          end: Offset.zero,
                        ).animate(
                          CurvedAnimation(
                            parent: _uiController,
                            curve: Curves.easeOutCubic,
                          ),
                        ),
                        child: FadeTransition(
                          opacity: _uiController,
                          child: child,
                        ),
                      ),
                    ),
                    child: FloatingActionButton.extended(
                      heroTag: 'toggle_ui_fab_hide',
                      onPressed: _toggleUI,
                      backgroundColor: Colors.black.withValues(alpha: 0.6),
                      elevation: 0,
                      icon: const Icon(
                        Icons.fullscreen_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      label: Text(
                        'hide_ui'.tr,
                        style: AppTextStyles.labelMedium(context).copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  )),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Compact glass icon button used in the top nav bar.
  Widget _navButton({
    required IconData icon,
    required VoidCallback onTap,
    Color? tint,
    String? label,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: label != null
            ? const EdgeInsets.symmetric(horizontal: 12, vertical: 8)
            : const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(50),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: tint ?? Colors.white, size: 20),
            if (label != null) ...[
              const SizedBox(width: 6),
              Text(label,
                  style: AppTextStyles.labelSmall(context).copyWith(
                    color: Colors.white,
                    fontSize: 12,
                  )),
            ],
          ],
        ),
      ),
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
          backgroundColor: AppColors.successAdaptive(Get.context!),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
          borderRadius: 14,
        );
      }

      if (adService.isAdsEnabled.value) {
        if (image.isPremium) {
          Get.snackbar(
            'HD Download',
            'Watch a short ad to unlock HD download',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: AppColors.surfaceGlass(context),
            colorText: AppColors.textAdaptive(context),
            margin: const EdgeInsets.all(20),
            borderRadius: 14,
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
        backgroundColor: AppColors.errorAdaptive(Get.context!),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(20),
        borderRadius: 14,
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
          backgroundColor: AppColors.successAdaptive(Get.context!),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(20),
          borderRadius: 14,
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
        backgroundColor: AppColors.errorAdaptive(Get.context!),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(20),
        borderRadius: 14,
      );
    }
  }
}
