import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:share_plus/share_plus.dart';
import '../../data/models/mantra_model.dart';
import '../../data/providers/data_repository.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/smart_lottie.dart';
import '../../data/services/ambient_audio_service.dart';
import 'widgets/related_mantra_card.dart';

class MantraDetailsView extends StatefulWidget {
  final MantraModel mantra;

  const MantraDetailsView({super.key, required this.mantra});

  @override
  State<MantraDetailsView> createState() => _MantraDetailsViewState();
}

class _MantraDetailsViewState extends State<MantraDetailsView> {
  late final List<MantraModel> _relatedMantras;

  @override
  void initState() {
    super.initState();
    final allMantras = Get.find<DataRepository>().allMantras;
    _relatedMantras = allMantras
        .where((m) =>
            m.id != widget.mantra.id &&
            (widget.mantra.category == null || m.category?.code == widget.mantra.category?.code))
        .take(3)
        .toList();
  }

  void _toggleAudio() {
    if (widget.mantra.audioFile.isEmpty) {
      HapticFeedback.heavyImpact();
      Get.snackbar(
        'Sacred Chant',
        'Audio for this mantra is being prepared! 🪔',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.black87,
        colorText: Colors.white,
        margin: const EdgeInsets.all(20),
        borderRadius: 12,
        duration: const Duration(seconds: 2),
      );
      return;
    }

    HapticFeedback.lightImpact();
    final audioService = AmbientAudioService.to;
    
    // Convert hyphenated slug to Readable Title (e.g., 'gayatri-mantra' -> 'Gayatri Mantra')
    final readableTitle = widget.mantra.slug.split('-').map((str) => str.capitalize).join(' ');

    audioService.playCustomAudio(
      s3Key: widget.mantra.audioFile,
      title: readableTitle,
      slug: 'mantra_${widget.mantra.id}',
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return NeoScaffold(
      hideNoise: true,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Adaptive Background
          Container(
            color: isDark
                ? AppColors.backgroundDark
                : AppColors.backgroundLight,
          ),

          // --- BREATHING MANDALA (Dynamic Lottie Backdrop) ---
          Positioned.fill(
            child: Opacity(
              opacity: isDark ? 0.15 : 0.08,
              child: const SmartLottie(
                url: 'lotties/loading_mandala.json',
                fallbackAsset: 'assets/lottie/loading_mandala.json',
                fit: BoxFit.contain,
                repeat: true,
              ),
            ),
          ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(
            begin: const Offset(0.85, 0.85),
            end: const Offset(1.05, 1.05),
            duration: const Duration(seconds: 8),
            curve: Curves.easeInOutSine,
          ),

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
                          widget.mantra.category?.name.toUpperCase() ??
                              'SACRED CHANT',
                          style: AppTextStyles.labelSmall(context).copyWith(
                            color: AppColors.textAdaptiveSecondary(context),
                            letterSpacing: 1.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ).animate().fade().scale(),
                      const SizedBox(width: 40),
                    ],
                  ),
                ),

                Expanded(
                  child: _MantraContentCard(
                    mantra: widget.mantra,
                    isDark: isDark,
                  ),
                ),

                // Related Mantras Carousel
                if (_relatedMantras.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Similar Mantras',
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
                      itemCount: _relatedMantras.length,
                      itemBuilder: (context, index) {
                        return RelatedMantraCard(
                          mantra: _relatedMantras[index],
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
                      Obx(() {
                        final audio = AmbientAudioService.to;
                        final playingThis = audio.currentEventSlug.value ==
                            'mantra_${widget.mantra.id}';
                        final isPlaying = audio.isPlaying.value && playingThis;

                        return _buildBottomAction(
                          icon: isPlaying ? LucideIcons.pause : LucideIcons.play,
                          label: isPlaying ? 'Pause' : 'Chant',
                          accent: AppColors.goldAccent,
                          isDark: isDark,
                          context: context,
                          onTap: () => _toggleAudio(),
                        )
                            .animate(target: isPlaying ? 1 : 0)
                            .shimmer(
                              duration: 1200.ms,
                              color: AppColors.goldAccent.withValues(alpha: 0.8),
                            )
                            .scale(
                              end: const Offset(1.1, 1.1),
                              duration: 200.ms,
                            );
                      }),
                      Container(
                        width: 1,
                        height: 28,
                        color: isDark ? Colors.white24 : Colors.black12,
                      ),
                      _buildBottomAction(
                        icon: LucideIcons.copy,
                        label: 'Copy',
                        isDark: isDark,
                        context: context,
                        onTap: () {
                          HapticFeedback.lightImpact();
                          Clipboard.setData(
                            ClipboardData(
                              text:
                                  '${widget.mantra.text}\nMeaning: ${widget.mantra.meaning}',
                            ),
                          );
                          Get.snackbar(
                            'Copied',
                            'Mantra copied to clipboard',
                            snackPosition: SnackPosition.BOTTOM,
                            backgroundColor: AppColors.primaryAdaptive(context),
                            colorText: isDark ? Colors.black : Colors.white,
                            margin: const EdgeInsets.all(16),
                            borderRadius: 14,
                          );
                        },
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
                              '${widget.mantra.text}\n"${widget.mantra.meaning}"\n\nExplore more on Utsav App 🪔';
                          SharePlus.instance.share(
                            ShareParams(text: shareText),
                          );
                        },
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.2),
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
    Color? accent,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: accent ?? AppColors.textAdaptive(context),
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.labelSmall(context).copyWith(
                color: accent ?? AppColors.textAdaptiveSecondary(context),
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
class _MantraContentCard extends StatefulWidget {
  final MantraModel mantra;
  final bool isDark;

  const _MantraContentCard({required this.mantra, required this.isDark});

  @override
  State<_MantraContentCard> createState() => _MantraContentCardState();
}

class _MantraContentCardState extends State<_MantraContentCard> {
  final ScrollController _scrollController = ScrollController();
  bool _showScrollHint = false;

  @override
  void initState() {
    super.initState();
    // After first frame, check if content overflows
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

    return Stack(
      children: [
        // Main scrollable content
        Center(
          child: SingleChildScrollView(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(36),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.05)
                        : Colors.white.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(36),
                    border: Border.all(
                      color: isDark
                          ? Colors.white12
                          : Colors.black.withValues(alpha: 0.05),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(
                          0xFFD4AF37,
                        ).withValues(alpha: isDark ? 0.05 : 0.02),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        LucideIcons.flower,
                        color: AppColors.goldAccent,
                        size: 42,
                      ).animate().scale(
                        delay: 200.ms,
                        curve: Curves.easeOutBack,
                      ),

                      const SizedBox(height: 32),

                      Text(
                        widget.mantra.text,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.headlineMedium(context).copyWith(
                          color: AppColors.textAdaptive(context),
                          height: 1.6,
                          fontWeight: FontWeight.w500,
                          fontSize: widget.mantra.text.length > 50 ? 24 : 32,
                        ),
                      ),

                      if (widget.mantra.transliteration.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        Text(
                          widget.mantra.transliteration,
                          textAlign: TextAlign.center,
                          style: AppTextStyles.titleMedium(context).copyWith(
                            color: AppColors.textAdaptiveSecondary(context),
                            height: 1.6,
                            fontStyle: FontStyle.italic,
                            fontWeight: FontWeight.w400,
                          ),
                        ).animate().fade(delay: 400.ms).slideY(begin: 0.1),
                      ],

                      const SizedBox(height: 32),

                      Container(
                        width: 50,
                        height: 2,
                        color: AppColors.goldAccent.withValues(alpha: 0.5),
                      ).animate().scaleX(delay: 500.ms),

                      const SizedBox(height: 32),

                      if (widget.mantra.meaning.isNotEmpty) ...[
                        Text(
                          '"${widget.mantra.meaning}"',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.bodyLarge(context).copyWith(
                            color: AppColors.textAdaptiveSecondary(context),
                            height: 1.6,
                            fontWeight: FontWeight.w500,
                          ),
                        ).animate().fade(delay: 600.ms).slideY(begin: 0.1),
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
                    bottom: Radius.circular(36),
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
                    color: AppColors.goldAccent.withValues(alpha: 0.7),
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
