import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../data/models/image_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/smart_image.dart';

class EventGalleryGrid extends StatelessWidget {
  final List<ImageModel> gallery;
  final ImageModel? heroImage;

  const EventGalleryGrid({
    super.key,
    required this.gallery,
    required this.heroImage,
  });

  List<ImageModel> get _allImages {
    if (gallery.isEmpty && heroImage != null) return [heroImage!];
    return gallery;
  }

  void _openSlideshow(int startIndex) {
    HapticFeedback.mediumImpact();
    Get.to(
      () => _FullscreenGallery(images: _allImages, initialIndex: startIndex),
      transition: Transition.fade,
    );
  }

  @override
  Widget build(BuildContext context) {
    final images = _allImages;
    if (images.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.images,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Visual Journey',
              style: AppTextStyles.headlineMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            if (images.length > 1)
              Text(
                '${images.length} PHOTOS',
                style: AppTextStyles.labelSmall(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: _buildGrid(context, images),
        ),
      ],
    );
  }

  Widget _buildGrid(BuildContext ctx, List<ImageModel> images) {
    if (images.length == 1) {
      return GestureDetector(
        onTap: () => _openSlideshow(0),
        child: AspectRatio(
          aspectRatio: 16 / 9,
          child: SmartImage(images[0].url, fit: BoxFit.cover),
        ),
      );
    }
    if (images.length == 2) {
      return SizedBox(
        height: 200,
        child: Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => _openSlideshow(0),
                child: SmartImage(images[0].url, fit: BoxFit.cover),
              ),
            ),
            const SizedBox(width: 3),
            Expanded(
              child: GestureDetector(
                onTap: () => _openSlideshow(1),
                child: SmartImage(images[1].url, fit: BoxFit.cover),
              ),
            ),
          ],
        ),
      );
    }
    final showCount = images.length > 4 ? images.length - 3 : 0;
    final gridImages = images.take(4).toList();
    return SizedBox(
      height: 280,
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.0,
          crossAxisSpacing: 3,
          mainAxisSpacing: 3,
        ),
        itemCount: gridImages.length,
        itemBuilder: (ctx, i) {
          final isLast = i == 3 && showCount > 0;
          final img = gridImages[i];
          return GestureDetector(
            onTap: () => _openSlideshow(i),
            child: Stack(
              fit: StackFit.expand,
              children: [
                SmartImage(
                  img.thumbnail.isNotEmpty ? img.thumbnail : img.url,
                  fit: BoxFit.cover,
                ),
                if (isLast)
                  Container(
                    color: Colors.black.withValues(alpha: 0.55),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          LucideIcons.imagePlus,
                          color: Colors.white,
                          size: 28,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '+$showCount more',
                          style: AppTextStyles.titleMedium(ctx).copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _FullscreenGallery extends StatefulWidget {
  final List<ImageModel> images;
  final int initialIndex;
  const _FullscreenGallery({required this.images, required this.initialIndex});

  @override
  State<_FullscreenGallery> createState() => _FullscreenGalleryState();
}

class _FullscreenGalleryState extends State<_FullscreenGallery> {
  late final PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: widget.images.length,
            onPageChanged: (i) => setState(() => _currentIndex = i),
            itemBuilder: (ctx, i) {
              return GestureDetector(
                onTap: () => Get.back(),
                child: InteractiveViewer(
                  child: Center(
                    child: SmartImage(
                      widget.images[i].url,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              );
            },
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Colors.black54,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      LucideIcons.x,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_currentIndex + 1} / ${widget.images.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (widget.images[_currentIndex].displayLabel.isNotEmpty)
            Positioned(
              bottom: MediaQuery.of(context).padding.bottom + 20,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  widget.images[_currentIndex].displayLabel,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
