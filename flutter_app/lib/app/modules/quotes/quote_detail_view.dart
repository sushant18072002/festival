import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
import '../../data/models/quote_model.dart';
import '../../data/providers/data_repository.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/neo_scaffold.dart';
import 'widgets/related_quote_card.dart';

class QuoteDetailView extends StatefulWidget {
  final QuoteModel quote;

  const QuoteDetailView({super.key, required this.quote});

  @override
  State<QuoteDetailView> createState() => _QuoteDetailViewState();
}

class _QuoteDetailViewState extends State<QuoteDetailView> {
  bool _isSaved = false;
  late final List<QuoteModel> _relatedQuotes;

  @override
  void initState() {
    super.initState();
    // Fetch up to 5 related quotes (excluding the current one) based on same category code
    final allQuotes = Get.find<DataRepository>().allQuotes;
    _relatedQuotes = allQuotes
        .where((q) =>
            q.id != widget.quote.id &&
            (widget.quote.category == null || q.category?.code == widget.quote.category?.code))
        .take(3)
        .toList();
  }

  void _toggleSave() {
    HapticFeedback.lightImpact();
    setState(() => _isSaved = !_isSaved);
    Get.snackbar(
      _isSaved ? 'Saved' : 'Removed',
      _isSaved ? 'Quote saved to favorites ✨' : 'Removed from favorites',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: AppColors.primaryAdaptive(context),
      colorText: Theme.of(context).brightness == Brightness.dark ? Colors.black : Colors.white,
      margin: const EdgeInsets.all(16),
      borderRadius: 14,
      duration: const Duration(seconds: 2),
    );
  }

  @override
  Widget build(BuildContext context) {
    final quote = widget.quote;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return NeoScaffold(
      hideNoise: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Adaptive Background
          Container(
            color: isDark
                ? AppColors.backgroundDark
                : AppColors.backgroundLight,
          ),

          // Glowing Orbs
          Positioned(
            top: MediaQuery.of(context).size.height * 0.1,
            right: -100,
            child:
                Container(
                      width: 300,
                      height: 300,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primaryAdaptive(context).withValues(
                          alpha: isDark ? 0.15 : 0.08,
                        ),
                      ),
                    )
                    .animate()
                    .fadeIn(duration: const Duration(seconds: 1))
                    .shimmer(
                      duration: const Duration(seconds: 3),
                      delay: const Duration(seconds: 1),
                    ),
          ),
          Positioned(
            bottom: MediaQuery.of(context).size.height * 0.2,
            left: -100,
            child:
                Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.accentAdaptive(context).withValues(
                          alpha: isDark ? 0.1 : 0.05,
                        ),
                      ),
                    )
                    .animate()
                    .fadeIn(duration: const Duration(milliseconds: 1500))
                    .shimmer(
                      duration: const Duration(seconds: 3),
                      delay: const Duration(seconds: 2),
                    ),
          ),

          // 2. Main Content
          SafeArea(
            child: Column(
              children: [
                // Top Bar
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildIconButton(
                        context,
                        LucideIcons.x,
                        () => Get.back(),
                        isDark,
                      ),
                      if (quote.category != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.1)
                                : Colors.black.withValues(alpha: 0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isDark ? Colors.white24 : Colors.black12,
                            ),
                          ),
                          child: Text(
                            quote.category!.name.toUpperCase(),
                            style: AppTextStyles.labelSmall(context).copyWith(
                              color: AppColors.textAdaptiveSecondary(context),
                              letterSpacing: 1.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ).animate().fade().scale(),
                      const SizedBox(width: 40), // Balance the close button
                    ],
                  ),
                ),

                Expanded(
                  child: _QuoteContentCard(
                    quote: quote,
                    isDark: isDark,
                  ),
                ),


                // Related Quotes Carousel
                if (_relatedQuotes.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'More Like This',
                        style: AppTextStyles.titleMedium(context).copyWith(
                          color: AppColors.textAdaptiveSecondary(context),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ).animate().fadeIn(delay: 600.ms),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 170,
                    child: PageView.builder(
                      controller: PageController(viewportFraction: 0.78),
                      physics: const BouncingScrollPhysics(),
                      itemCount: _relatedQuotes.length,
                      itemBuilder: (context, index) {
                        return RelatedQuoteCard(
                          quote: _relatedQuotes[index],
                          index: index,
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Bottom Action Bar
                Container(
                  margin: const EdgeInsets.only(
                    bottom: 24,
                    left: 24,
                    right: 24,
                  ),
                  padding: const EdgeInsets.symmetric(
                    vertical: 14,
                    horizontal: 16,
                  ),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.black.withValues(alpha: 0.03),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isDark
                          ? Colors.white12
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildBottomAction(
                        icon: LucideIcons.copy,
                        label: 'Copy',
                        isDark: isDark,
                        context: context,
                        onTap: () {
                          HapticFeedback.lightImpact();
                          Clipboard.setData(
                            ClipboardData(
                              text: '${quote.text} - ${quote.author}',
                            ),
                          );
                          Get.snackbar(
                            'Copied',
                            'Quote copied to clipboard',
                            snackPosition: SnackPosition.BOTTOM,
                            backgroundColor: AppColors.primaryAdaptive(context),
                            colorText: isDark ? Colors.black : Colors.white,
                            margin: const EdgeInsets.all(16),
                            borderRadius: 14,
                            duration: const Duration(seconds: 2),
                          );
                        },
                      ),
                      Container(
                        width: 1,
                        height: 28,
                        color: isDark ? Colors.white24 : Colors.black12,
                      ),
                      _buildBottomAction(
                        icon: _isSaved ? LucideIcons.bookmark : LucideIcons.bookmark,
                        label: 'Save',
                        isDark: isDark,
                        context: context,
                        onTap: _toggleSave,
                        isActive: _isSaved,
                      ),
                      Container(
                        width: 1,
                        height: 28,
                        color: isDark ? Colors.white24 : Colors.black12,
                      ),
                      _buildBottomAction(
                        icon: LucideIcons.share2,
                        label: 'Share',
                        isDark: isDark,
                        context: context,
                        onTap: () {
                          HapticFeedback.mediumImpact();
                          final shareText =
                              '"${quote.text}"\n— ${quote.author}\n\nExplore more on Utsav App 🪔';
                          SharePlus.instance.share(
                            ShareParams(text: shareText),
                          );
                        },
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIconButton(
    BuildContext context,
    IconData icon,
    VoidCallback onTap,
    bool isDark,
  ) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withValues(alpha: 0.1)
              : Colors.black.withValues(alpha: 0.05),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.textAdaptive(context), size: 20),
      ),
    );
  }

  Widget _buildBottomAction({
    required BuildContext context,
    required IconData icon,
    required String label,
    required bool isDark,
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? AppColors.accentAdaptive(context) : AppColors.textAdaptive(context),
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: isActive ? AppColors.accentAdaptive(context) : AppColors.textAdaptiveSecondary(context),
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Scroll-aware content card with bottom fade gradient & animated "scroll down"
/// chevron that disappears once the user begins scrolling.
class _QuoteContentCard extends StatefulWidget {
  final QuoteModel quote;
  final bool isDark;

  const _QuoteContentCard({required this.quote, required this.isDark});

  @override
  State<_QuoteContentCard> createState() => _QuoteContentCardState();
}

class _QuoteContentCardState extends State<_QuoteContentCard> {
  final ScrollController _scrollController = ScrollController();
  bool _showScrollHint = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients &&
          _scrollController.position.maxScrollExtent > 10) {
        setState(() => _showScrollHint = true);
      }
    });
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.offset > 20 && _showScrollHint) {
      setState(() => _showScrollHint = false);
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final quote = widget.quote;

    return Stack(
      children: [
        Center(
          child: SingleChildScrollView(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(32),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.white.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(
                      color: isDark
                          ? Colors.white12
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryAdaptive(context).withValues(
                          alpha: isDark ? 0.05 : 0.02,
                        ),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        LucideIcons.quote,
                        color: AppColors.primaryAdaptive(context),
                        size: 48,
                      ).animate().scale(
                        delay: 200.ms,
                        curve: Curves.easeOutBack,
                      ),

                      const SizedBox(height: 24),

                      Text(
                        '"${quote.text}"',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.headlineMedium(context).copyWith(
                          color: AppColors.textAdaptive(context),
                          height: 1.5,
                          fontWeight: FontWeight.w400,
                          fontSize: quote.text.length > 100 ? 22 : 28,
                        ),
                      ),

                      const SizedBox(height: 32),

                      Container(
                        width: 40,
                        height: 3,
                        decoration: BoxDecoration(
                          color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ).animate().scaleX(delay: 400.ms),

                      const SizedBox(height: 24),

                      Text(
                        quote.author.isNotEmpty ? quote.author : 'Unknown',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.titleMedium(context).copyWith(
                          color: AppColors.textAdaptiveSecondary(context),
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.2,
                        ),
                      ).animate().fade(delay: 500.ms).slideY(begin: 0.2),

                      if (quote.source.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          quote.source,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.labelMedium(context).copyWith(
                            color: AppColors.textAdaptiveSecondary(context)
                                .withValues(alpha: 0.6),
                            fontStyle: FontStyle.italic,
                          ),
                        ).animate().fade(delay: 600.ms),
                      ],
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05),
          ),
        ),

        // Bottom fade gradient — signals "more content below"
        if (_showScrollHint)
          Positioned(
            left: 24,
            right: 24,
            bottom: 0,
            child: IgnorePointer(
              child: Container(
                height: 60,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(32),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      (isDark ? AppColors.backgroundDark : AppColors.backgroundLight)
                          .withValues(alpha: 0.0),
                      (isDark ? AppColors.backgroundDark : AppColors.backgroundLight)
                          .withValues(alpha: 0.85),
                    ],
                  ),
                ),
                child: Center(
                  child: Icon(
                    LucideIcons.chevronDown,
                    color: AppColors.primaryAdaptive(context).withValues(alpha: 0.7),
                    size: 28,
                  )
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .moveY(begin: -4, end: 4, duration: 800.ms),
                ),
              ),
            ).animate().fadeIn(delay: 800.ms),
          ),
      ],
    );
  }
}
