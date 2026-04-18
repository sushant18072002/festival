import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class CollectionModel {
  final String id;
  final String title;
  final String subtitle;
  final String coverPlaceholder;
  final List<String> matchTags;

  const CollectionModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.coverPlaceholder,
    required this.matchTags,
  });
}

// Dummy predefined curated collections
const kCuratedCollections = [
  CollectionModel(
    id: 'diwali_lights',
    title: 'Diwali Lights 🪔',
    subtitle: 'Brighten your feed',
    coverPlaceholder: 'festival_diwali',
    matchTags: ['diwali', 'lights', 'diyas'],
  ),
  CollectionModel(
    id: 'holi_colors',
    title: 'Holi Colors 🎨',
    subtitle: 'Vibrant & Joyful',
    coverPlaceholder: 'festival_holi',
    matchTags: ['holi', 'colors', 'gulaal'],
  ),
  CollectionModel(
    id: 'sacred_temples',
    title: 'Sacred Temples 🏛️',
    subtitle: 'Spiritual journeys',
    coverPlaceholder: 'festival_durga_puja',
    matchTags: ['temple', 'spiritual', 'puja'],
  ),
  CollectionModel(
    id: 'monsoon_magic',
    title: 'Monsoon Magic 🌧️',
    subtitle: 'Chariots & Rain',
    coverPlaceholder: 'festival_rath_yatra',
    matchTags: ['monsoon', 'yatra', 'rain'],
  ),
];

class CollectionsGrid extends StatelessWidget {
  const CollectionsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.85,
      ),
      itemCount: kCuratedCollections.length,
      itemBuilder: (context, index) {
        final collection = kCuratedCollections[index];

        return GestureDetector(
          onTap: () {
            // Future implementation: Navigate to a filtered view based on matchTags
            Get.snackbar(
              'Coming Soon',
              'The ${collection.title} collection is gathering magic...',
              snackPosition: SnackPosition.BOTTOM,
              backgroundColor: AppColors.primaryAdaptive(context),
              colorText: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
            );
          },
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.surfaceGlass(context),
                  AppColors.surfaceGlass(context).withValues(alpha: 0.3),
                ],
              ),
              border: AppColors.adaptiveBorder(context),
              boxShadow: AppColors.glassShadow(context),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Placeholder for collection cover
                  Container(
                    color: AppColors.accentAdaptive(context).withValues(alpha: 0.1),
                    child: Center(
                      child: Icon(
                        LucideIcons.images,
                        size: 48,
                        color: AppColors.textAdaptive(context).withValues(alpha: 0.2),
                      ),
                    ),
                  ),

                  // Gradient Overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Theme.of(context).brightness == Brightness.dark
                              ? Colors.black.withValues(alpha: 0.8)
                              : Colors.black.withValues(alpha: 0.5),
                        ],
                      ),
                    ),
                  ),

                  // Text Info
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          collection.title,
                          style: AppTextStyles.titleMedium(context).copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          collection.subtitle,
                          style: AppTextStyles.labelMedium(context).copyWith(
                            color: Colors.white70,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ).animate().fade(delay: (index * 100).ms).slideY(begin: 0.1);
      },
    );
  }
}
