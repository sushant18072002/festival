import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/image_model.dart';
import '../../../routes/app_pages.dart';
import '../../favorites/favorites_controller.dart';
import '../../../widgets/dynamic_overlay.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_animations.dart';
import 'dart:ui' as ui;
import '../../../widgets/image_share_menu.dart';

/// Neo-Modern Trending Image Card
/// Floating style with no extensive borders.
/// Glass pills for actions.
class TrendingImageCard extends StatefulWidget {
  final ImageModel image;
  final int index;
  final String heroTagPrefix;
  final bool isGrid;

  const TrendingImageCard({
    super.key,
    required this.image,
    required this.index,
    required this.heroTagPrefix,
    this.isGrid = true,
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
          Get.toNamed(
            Routes.imageDetails,
            arguments: {
              'image': widget.image,
              'heroTagPrefix': widget.heroTagPrefix,
            },
          );
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
              boxShadow: Theme.of(context).brightness == Brightness.dark
                  ? [
                      BoxShadow(
                        color: AppColors.primaryAdaptive(context).withValues(alpha: 0.15),
                        blurRadius: 20,
                        spreadRadius: -2,
                        offset: const Offset(0, 8),
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 15,
                        spreadRadius: -2,
                        offset: const Offset(0, 6),
                      ),
                    ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                fit: StackFit.loose,
                children: [
                  // 1. Image
                  // Hero tag is constructed using a context-aware prefix
                  // to prevent collisions when the same image is in multiple lists.
                  Hero(
                    tag: '${widget.heroTagPrefix}_image_${widget.image.id}',
                    child: AspectRatio(
                      aspectRatio: widget.isGrid
                          ? (widget.image.aspectRatio > 0
                              ? widget.image.aspectRatio
                              : 0.7)
                          // List view has a locked taller ratio mirroring the instagram/admin-feed feel
                          : 0.85,
                      child: DynamicOverlayWidget(
                        image: widget.image,
                        fit: BoxFit.cover,
                        memCacheWidth: widget.isGrid ? 400 : 800,
                        useThumbnail: true,
                        dominantColor: widget.image.dominantColors.isNotEmpty 
                            ? _parseColor(widget.image.dominantColors.first) 
                            : null,
                        isVideo: widget.image.mediaType == 'video',
                      ),
                    ),
                  ),

                  // 1.5 Glass Shell Inside Border
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        border: AppColors.adaptiveBorder(context),
                      ),
                    ),
                  ),

                  // 2. Gradient Overlay (Bottom)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: widget.isGrid ? 80 : 160,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            widget.isGrid
                                ? Colors.black.withValues(alpha: 0.8)
                                : Colors.black.withValues(alpha: 0.95),
                          ],
                          stops: widget.isGrid
                              ? const [0.0, 1.0]
                              : const [0.0, 0.8],
                        ),
                      ),
                    ),
                  ),

                  // 3. Details Column (Title, Categories, Downloads)
                  Positioned(
                    bottom: widget.isGrid ? 12 : 16,
                    left: widget.isGrid ? 12 : 16,
                    right: widget.isGrid ? 90 : 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Title / Description
                        Text(
                          widget.image.displayLabel,
                          style: (widget.isGrid
                                  ? AppTextStyles.labelMedium(context)
                                  : AppTextStyles.titleMedium(context))
                              .copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            shadows: const [
                              Shadow(color: Colors.black45, blurRadius: 4),
                            ],
                          ),
                          maxLines: widget.isGrid ? 2 : 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (!widget.isGrid &&
                            widget.image.categories.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: widget.image.categories
                                .take(3)
                                .map(
                                  (cat) => Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          Colors.white.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: Colors.white.withValues(
                                          alpha: 0.1,
                                        ),
                                      ),
                                    ),
                                    child: Text(
                                      cat,
                                      style: AppTextStyles.labelSmall(context).copyWith(
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // 4. Badges (Top right for List View, Bottom for Grid)
                  if (!widget.isGrid && widget.image.isPremium)
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              LucideIcons.award,
                              color: Colors.amber,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'HD',
                              style: AppTextStyles.labelMedium(context).copyWith(
                                color: Colors.amber,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  if (widget.isGrid && widget.image.isPremium)
                    Positioned(
                      bottom: 12,
                      left: 12,
                      child: Transform.translate(
                        offset:
                            const Offset(0, 24), // Push below title in grid
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                LucideIcons.award,
                                color: Colors.amber,
                                size: 12,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'HD',
                                style: AppTextStyles.labelSmall(context).copyWith(
                                  color: Colors.amber,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // 5. Action Buttons (Share & Favorite)
                  Positioned(
                    bottom: widget.isGrid ? 8 : 16,
                    right: widget.isGrid ? 8 : 16,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildShareButton(),
                        const SizedBox(width: 8),
                        _buildFavoriteButton(),
                      ],
                    ),
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
              // No Hero here — dialogs are overlay routes sharing the same
              // navigator subtree as the page below. Reusing the same tag
              // causes 'multiple heroes with same tag' assertion errors.
              ClipRRect(
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
                  style: AppTextStyles.labelMedium(context).copyWith(
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

  Widget _buildShareButton() {
    return Semantics(
      label: 'Share',
      button: true,
      child: GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          _shareImage();
        },
        child: AnimatedContainer(
          duration: 200.ms,
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
          ),
          child: const Icon(LucideIcons.send, size: 18, color: Colors.white),
        ),
      ),
    );
  }

  Future<void> _shareImage() async {
    ImageShareMenu.show(context, widget.image);
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
              isLiked ? LucideIcons.heart : LucideIcons.heart,
              size: 18,
              color: Colors.white,
            ),
          ),
        ),
      );
    });
  }

  Color? _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex'; // Add 100% opacity
    }
    if (hex.length == 8) {
      return Color(int.parse('0x$hex'));
    }
    return null;
  }
}
