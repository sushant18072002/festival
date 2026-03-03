import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/models/image_model.dart';
import '../../../routes/app_pages.dart';
import '../../favorites/favorites_controller.dart';
import '../../../widgets/dynamic_overlay.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_animations.dart';
import 'dart:ui' as ui;

/// Neo-Modern Trending Image Card
/// Floating style with no extensive borders.
/// Glass pills for actions.
class TrendingImageCard extends StatefulWidget {
  final ImageModel image;
  final int index;

  const TrendingImageCard({
    super.key,
    required this.image,
    required this.index,
  });

  @override
  State<TrendingImageCard> createState() => _TrendingImageCardState();
}

class _TrendingImageCardState extends State<TrendingImageCard> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Trending Image: ${widget.image.displayLabel}',
      hint: 'Double tap to open image details, long press to preview',
      button: true,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _scale = 0.96),
        onTapUp: (_) => setState(() => _scale = 1.0),
        onTapCancel: () => setState(() => _scale = 1.0),
        onTap: () {
          HapticFeedback.lightImpact();
          Get.toNamed(Routes.IMAGE_DETAILS, arguments: widget.image);
        },
        onLongPress: () {
          HapticFeedback.heavyImpact();
          _showPeekPreview(context);
        },
        onLongPressEnd: (_) {
          if (Get.isDialogOpen ?? false) {
            Get.back(); // Dismiss peek preview
          }
        },
        child: AnimatedScale(
          scale: _scale,
          duration: AppAnimations.fast,
          curve: AppAnimations.smooth,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                fit: StackFit.loose,
                children: [
                  // 1. Image
                  Hero(
                    tag: 'image_${widget.image.id}',
                    child: AspectRatio(
                      aspectRatio: widget.image.aspectRatio > 0
                          ? widget.image.aspectRatio
                          : 0.7,
                      child: DynamicOverlayWidget(
                        image: widget.image,
                        fit: BoxFit.cover,
                        // Prevent memory bloat by caching decoded images at a smaller fixed logical size
                        memCacheWidth: 400,
                        useThumbnail: true,
                      ),
                    ),
                  ),

                  // 2. Subtle Gradient Overlay (Bottom)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.8),
                          ],
                          stops: const [0.0, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // 3. Download Badge (Glass Pill)
                  Positioned(
                    bottom: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.download_rounded,
                            color: AppColors.textSecondary,
                            size: 12,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatCount(widget.image.downloads),
                            style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 4. Favorite Button (Glass Circle)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: _buildFavoriteButton(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showPeekPreview(BuildContext context) {
    Get.dialog(
      BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Hero(
                tag: 'image_${widget.image.id}',
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.7,
                      maxWidth: MediaQuery.of(context).size.width * 0.9,
                    ),
                    child: DynamicOverlayWidget(
                      image: widget.image,
                      fit: BoxFit.contain,
                      useThumbnail: true,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Subtle instruction
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Release to close',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ).animate().fade().slideY(begin: 0.2),
            ],
          ),
        ),
      ),
      barrierColor: Colors.black.withValues(alpha: 0.4),
      barrierDismissible: true,
      useSafeArea: true,
      transitionDuration: const Duration(milliseconds: 200),
    );
  }

  Widget _buildFavoriteButton() {
    return Obx(() {
      final controller = Get.find<FavoritesController>();
      final isLiked = controller.isLiked(widget.image.id);

      return Semantics(
        label: isLiked ? 'Remove from favorites' : 'Add to favorites',
        button: true,
        child: GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            controller.toggleLike(widget.image.id);
          },
          child: AnimatedContainer(
            duration: 200.ms,
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isLiked
                  ? AppColors.error
                  : Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
              border: Border.all(
                color: isLiked
                    ? Colors.transparent
                    : Colors.white.withValues(alpha: 0.2),
              ),
            ),
            child: Icon(
              isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              size: 18,
              color: Colors.white,
            ),
          ),
        ),
      );
    });
  }

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}
