import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Festival Extras Section
// Shows: Recipes (inline preview) + Dress Guide (inline) + Playlists
// All sections adapt to Light/Dark mode.
// ─────────────────────────────────────────────────────────────────────────────
class FestivalExtrasSection extends StatelessWidget {
  final EventModel event;

  const FestivalExtrasSection({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    final hasRecipes = event.recipes.isNotEmpty && event.recipes.any((r) => r.name.isNotEmpty);
    final hasDressGuide = event.dressGuide != null && 
        (event.dressGuide!.colors.isNotEmpty || event.dressGuide!.description.trim().isNotEmpty);
    final hasPlaylists = event.playlistLinks.isNotEmpty;

    if (!hasRecipes && !hasDressGuide && !hasPlaylists) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Recipes ────────────────────────────────────────────────────────────
        if (hasRecipes) ...[
          _SectionHeading(
            icon: LucideIcons.utensilsCrossed,
            label: 'Traditional Recipes',
            badge: '${event.recipes.length} dishes',
            color: const Color(0xFFFF6B35),
          ),
          const SizedBox(height: 16),
          _RecipesList(recipes: event.recipes),
          const SizedBox(height: 32),
        ],

        // ── Dress Guide ────────────────────────────────────────────────────────
        if (hasDressGuide) ...[
          _SectionHeading(
            icon: LucideIcons.shirt,
            label: 'Dress Guide',
            color: AppColors.secondaryAdaptive(context),
          ),
          const SizedBox(height: 16),
          _DressGuideInlineCard(guide: event.dressGuide!),
          const SizedBox(height: 32),
        ],

        // ── Playlists ─────────────────────────────────────────────────────────
        if (hasPlaylists) ...[
          _SectionHeading(
            icon: LucideIcons.headphones,
            label: 'Curated Playlists',
            color: const Color(0xFF1DB954),
          ),
          const SizedBox(height: 12),
          _PlaylistsList(playlists: event.playlistLinks),
        ],
      ],
    );
  }
}

// ── Section Heading ────────────────────────────────────────────────────────────
class _SectionHeading extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? badge;
  final Color color;

  const _SectionHeading({
    required this.icon,
    required this.label,
    required this.color,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: AppTextStyles.headlineMedium(context).copyWith(
              color: AppColors.textAdaptive(context),
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        if (badge != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.3)),
            ),
            child: Text(
              badge!,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
      ],
    );
  }
}

// ── Recipes List — inline cards ───────────────────────────────────────────────
class _RecipesList extends StatefulWidget {
  final List<FestivalRecipe> recipes;
  const _RecipesList({required this.recipes});

  @override
  State<_RecipesList> createState() => _RecipesListState();
}

class _RecipesListState extends State<_RecipesList> {
  bool _showAll = false;

  @override
  Widget build(BuildContext context) {
    final toShow = _showAll ? widget.recipes : widget.recipes.take(2).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...toShow.asMap().entries.map((e) {
          final recipe = e.value;
          return _RecipeCard(
            recipe: recipe,
            index: e.key,
          ).animate(delay: (e.key * 80).ms).fadeIn().slideY(begin: 0.08);
        }),

        // "See more recipes" button
        if (!_showAll && widget.recipes.length > 2)
          GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              setState(() => _showAll = true);
            },
            child: Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B35).withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFFFF6B35).withValues(alpha: 0.2),
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                'See ${widget.recipes.length - 2} more recipes ↓',
                style: AppTextStyles.labelMedium(context).copyWith(
                  color: const Color(0xFFFF6B35),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _RecipeCard extends StatelessWidget {
  final FestivalRecipe recipe;
  final int index;
  const _RecipeCard({required this.recipe, required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(18),
        border: AppColors.adaptiveBorder(context),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF6B35).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  LucideIcons.soup,
                  color: Color(0xFFFF6B35),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  recipe.name,
                  style: AppTextStyles.titleMedium(context).copyWith(
                    color: AppColors.textAdaptive(context),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          if (recipe.description.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              recipe.description,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
                height: 1.5,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (recipe.ingredients.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Ingredients',
              style: AppTextStyles.labelSmall(context).copyWith(
                color: AppColors.textAdaptiveSecondary(
                  context,
                ).withValues(alpha: 0.6),
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: recipe.ingredients.take(8).map((ing) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceGlass(context),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.glassBorder(context),
                    ),
                  ),
                  child: Text(
                    ing,
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
                      fontSize: 11,
                    ),
                  ),
                );
              }).toList(),
            ),
            if (recipe.ingredients.length > 8)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  '+${recipe.ingredients.length - 8} more ingredients',
                  style: AppTextStyles.labelSmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(
                      context,
                    ).withValues(alpha: 0.5),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

// ── Dress Guide — Inline Card ────────────────────────────────────────────────
class _DressGuideInlineCard extends StatelessWidget {
  final DressGuide guide;
  const _DressGuideInlineCard({required this.guide});

  Color _parseColor(String name) {
    switch (name.toLowerCase()) {
      case 'red':
        return const Color(0xFFE53935);
      case 'orange':
        return const Color(0xFFFB8C00);
      case 'yellow':
        return const Color(0xFFFDD835);
      case 'green':
        return const Color(0xFF43A047);
      case 'blue':
        return const Color(0xFF1E88E5);
      case 'purple':
        return const Color(0xFF8E24AA);
      case 'pink':
        return const Color(0xFFE91E8C);
      case 'white':
        return const Color(0xFFF5F5F5);
      case 'gold':
        return const Color(0xFFFFD700);
      case 'saffron':
        return const Color(0xFFFF9933);
      case 'maroon':
        return const Color(0xFF800000);
      case 'navy':
        return const Color(0xFF001F5B);
      case 'cream':
        return const Color(0xFFFFF8DC);
      case 'crimson':
        return const Color(0xFFDC143C);
      case 'turquoise':
        return const Color(0xFF00CED1);
      default:
        return const Color(0xFF9E9E9E);
    }
  }

  @override
  Widget build(BuildContext context) {

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(20),
        border: AppColors.adaptiveBorder(context),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Description
          if (guide.description.isNotEmpty)
            Text(
              guide.description,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
                height: 1.6,
              ),
            ),

          // Color Swatches
          if (guide.colors.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              'AUSPICIOUS COLOURS',
              style: AppTextStyles.labelSmall(context).copyWith(
                color: AppColors.textAdaptiveSecondary(
                  context,
                ).withValues(alpha: 0.55),
                letterSpacing: 1.5,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: guide.colors.map((colorName) {
                final chipColor = _parseColor(colorName);
                final isLight = chipColor.computeLuminance() > 0.5;
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: chipColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: AppColors.glassBorder(context),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: chipColor.withValues(alpha: 0.4),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    colorName,
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: isLight ? Colors.black87 : Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.08);
  }
}

// ── Playlists List ─────────────────────────────────────────────────────────────
class _PlaylistsList extends StatelessWidget {
  final List<PlaylistLink> playlists;
  const _PlaylistsList({required this.playlists});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: playlists.asMap().entries.map((entry) {
        final pl = entry.value;
        final isSpotify = pl.platform.toLowerCase() == 'spotify';
        final isYouTube = pl.platform.toLowerCase() == 'youtube';

        final Color brandColor = isSpotify
            ? const Color(0xFF1DB954)
            : (isYouTube ? const Color(0xFFFF0000) : AppColors.primaryAdaptive(context));
        final IconData brandIcon = isYouTube
            ? LucideIcons.circlePlay
            : LucideIcons.music;

        return GestureDetector(
          onTap: () async {
            HapticFeedback.selectionClick();
            if (pl.url.isNotEmpty) {
              final uri = Uri.tryParse(pl.url);
              if (uri != null) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            }
          },
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: brandColor.withValues(alpha: 0.07),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: brandColor.withValues(alpha: 0.25)),
            ),
            child: Row(
              children: [
                Icon(brandIcon, color: brandColor, size: 30),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        pl.title,
                        style: AppTextStyles.titleMedium(context).copyWith(
                          color: AppColors.textAdaptive(context),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Listen on ${pl.platform}',
                        style: AppTextStyles.bodySmall(context).copyWith(
                          color: brandColor.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  LucideIcons.externalLink,
                  color: brandColor.withValues(alpha: 0.7),
                  size: 18,
                ),
              ],
            ),
          ).animate(delay: (entry.key * 80).ms).fadeIn().slideX(begin: 0.05),
        );
      }).toList(),
    );
  }
}
