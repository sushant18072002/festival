import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class FestivalExtrasSection extends StatelessWidget {
  final EventModel event;

  const FestivalExtrasSection({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    final hasRecipes = event.recipes.isNotEmpty;
    final hasDressGuide = event.dressGuide != null;
    final hasPlaylists = event.playlistLinks.isNotEmpty;

    if (!hasRecipes && !hasDressGuide && !hasPlaylists) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              Icons.celebration_rounded,
              color: AppColors.primary,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              'Festival Extras',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (hasRecipes) ...[
          _ExtraTile(
            icon: Icons.restaurant_menu_rounded,
            title: 'Traditional Recipes',
            subtitle: '${event.recipes.length} special dishes',
            onTap: () => _showRecipeSheet(event),
          ),
          const SizedBox(height: 12),
        ],
        if (hasDressGuide) ...[
          _ExtraTile(
            icon: Icons.checkroom_rounded,
            title: 'Dress Guide',
            subtitle: 'Traditional attire & colors',
            onTap: () => _showDressGuideSheet(event),
          ),
          const SizedBox(height: 12),
        ],
        if (hasPlaylists) ...[
          _ExtraTile(
            icon: Icons.headphones_rounded,
            title: 'Curated Playlists',
            subtitle: 'Sacred chants & festive songs',
            onTap: () => _showPlaylistSheet(event),
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }

  void _showRecipeSheet(EventModel event) {
    HapticFeedback.mediumImpact();
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: AppColors.surfaceGlass,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(32),
            topRight: Radius.circular(32),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🍲 Traditional Recipes',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
            const SizedBox(height: AppSpacing.lg),
            Flexible(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: event.recipes.map((recipe) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.xl),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            recipe.name,
                            style: AppTextStyles.titleMedium.copyWith(
                              color: AppColors.accent,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            recipe.description,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: Colors.white70,
                              height: 1.5,
                            ),
                          ),
                          if (recipe.ingredients.isNotEmpty) ...[
                            const SizedBox(height: AppSpacing.md),
                            Text(
                              'Ingredients:',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            ...recipe.ingredients.map(
                              (ing) => Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: Row(
                                  children: [
                                    const Text(
                                      '• ',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    Expanded(
                                      child: Text(
                                        ing,
                                        style: AppTextStyles.bodyMedium
                                            .copyWith(color: Colors.white70),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Center(
              child: ElevatedButton.icon(
                onPressed: () => Get.back(),
                icon: const Icon(Icons.close),
                label: const Text('Close'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surfaceLight,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  void _showDressGuideSheet(EventModel event) {
    final guide = event.dressGuide!;
    HapticFeedback.mediumImpact();
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: AppColors.surfaceGlass,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(32),
            topRight: Radius.circular(32),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '👘 Dress Guide',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Wear Your Best',
              style: AppTextStyles.titleMedium.copyWith(
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              guide.description,
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.white70,
                height: 1.5,
              ),
            ),
            if (guide.colors.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Auspicious Colors',
                style: AppTextStyles.labelMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: guide.colors.map((colorName) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white12,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: Text(
                      colorName,
                      style: AppTextStyles.labelSmall.copyWith(
                        color: Colors.white,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: AppSpacing.xl),
            Center(
              child: ElevatedButton.icon(
                onPressed: () => Get.back(),
                icon: const Icon(Icons.close),
                label: const Text('Close'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surfaceLight,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  void _showPlaylistSheet(EventModel event) {
    HapticFeedback.mediumImpact();
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: AppColors.surfaceGlass,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(32),
            topRight: Radius.circular(32),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '🎵 Curated Playlists',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Sacred Sounds',
              style: AppTextStyles.titleMedium.copyWith(
                color: AppColors.accent,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Listen to beautiful chants, mantras, and festive songs specially curated for this occasion.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.white70,
                height: 1.5,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            ...event.playlistLinks.map((playlist) {
              final isSpotify = playlist.platform.toLowerCase() == 'spotify';
              final isYouTube = playlist.platform.toLowerCase() == 'youtube';

              Color brandColor = isSpotify
                  ? const Color(0xFF1DB954)
                  : (isYouTube ? const Color(0xFFFF0000) : Colors.white);
              IconData brandIcon = isYouTube
                  ? Icons.play_circle_filled_rounded
                  : Icons.music_note_rounded;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  onTap: () {
                    // Future intent handling
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: brandColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: brandColor.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(brandIcon, color: brandColor, size: 32),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                playlist.title,
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: brandColor,
                                ),
                              ),
                              Text(
                                'Listen on ${playlist.platform}',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: brandColor.withValues(alpha: 0.7),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          Icons.open_in_new_rounded,
                          color: brandColor,
                          size: 20,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
            const SizedBox(height: AppSpacing.xl),
            Center(
              child: ElevatedButton.icon(
                onPressed: () => Get.back(),
                icon: const Icon(Icons.close),
                label: const Text('Close'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surfaceLight,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helper tile widget
// ─────────────────────────────────────────────────────────────────────────────
class _ExtraTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ExtraTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceGlass,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.titleMedium.copyWith(
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.white54,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              color: Colors.white38,
              size: 20,
            ),
          ],
        ),
      ),
    ).animate().fade().slideY(begin: 0.1);
  }
}
