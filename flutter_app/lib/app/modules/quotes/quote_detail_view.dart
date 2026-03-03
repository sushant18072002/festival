import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../data/models/quote_model.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/glass_container.dart';

class QuoteDetailView extends StatelessWidget {
  final QuoteModel quote;

  const QuoteDetailView({super.key, required this.quote});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
          onPressed: () => Get.back(),
        ).animate().scale(delay: 200.ms),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded, color: Colors.white),
            onPressed: () {
              HapticFeedback.selectionClick();
              _shareQuote();
            },
          ).animate().scale(delay: 300.ms),
          IconButton(
            icon: const Icon(Icons.content_copy_rounded, color: Colors.white),
            onPressed: () {
              HapticFeedback.lightImpact();
              Clipboard.setData(
                ClipboardData(text: '${quote.text} - ${quote.author}'),
              );
              Get.snackbar(
                'Copied',
                'Quote copied to clipboard',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: AppColors.surfaceGlass,
                colorText: Colors.white,
              );
            },
          ).animate().scale(delay: 400.ms),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Gradient base
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  AppColors.primary.withValues(alpha: 0.15),
                  AppColors.backgroundDark,
                ],
                center: const Alignment(0, -0.3),
                radius: 1.2,
              ),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.format_quote_rounded,
                    color: AppColors.accent,
                    size: 80,
                  ).animate().scale(delay: 100.ms, curve: Curves.easeOutBack),

                  const SizedBox(height: AppSpacing.xl),

                  Hero(
                    tag: 'quote_${quote.id}',
                    child: Material(
                      type: MaterialType.transparency,
                      child: Text(
                        quote.text,
                        textAlign: TextAlign.center,
                        style: AppTextStyles.headlineLarge.copyWith(
                          color: Colors.white,
                          height: 1.5,
                          fontWeight: FontWeight.w300,
                          fontSize: quote.text.length > 100 ? 24 : 32,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  Container(
                    width: 40,
                    height: 2,
                    color: AppColors.primary,
                  ).animate().scaleX(delay: 400.ms),

                  const SizedBox(height: AppSpacing.lg),

                  Text(
                    quote.author.isNotEmpty ? quote.author : 'Unknown',
                    textAlign: TextAlign.center,
                    style: AppTextStyles.titleLarge.copyWith(
                      color: AppColors.accent,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ).animate().fade(delay: 500.ms).slideY(begin: 0.2),

                  if (quote.category != null) ...[
                    const SizedBox(height: AppSpacing.lg),
                    GlassContainer(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      color: AppColors.surfaceGlass,
                      border: Border.all(color: Colors.white12),
                      child: Text(
                        quote.category!.name.toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: Colors.white70,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ).animate().fade(delay: 600.ms),
                  ],
                ],
              ),
            ),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms),
    );
  }

  void _shareQuote() {
    Get.snackbar(
      'Sharing',
      'Quote is being prepared...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.white10,
      colorText: Colors.white,
    );
  }
}
