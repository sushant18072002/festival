import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'quotes_controller.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/glass_container.dart';
import 'quote_detail_view.dart';

class QuotesView extends GetView<QuotesController> {
  const QuotesView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      appBar: AppBar(
        title: Text('Inspirations', style: AppTextStyles.headlineMedium),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.shuffle_rounded),
            onPressed: () => controller.refreshQuotes(),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          );
        }

        if (controller.quotesList.isEmpty) {
          return Center(
            child: Text(
              'No quotes found.',
              style: AppTextStyles.bodyLarge.copyWith(color: Colors.white54),
            ),
          );
        }

        return RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.surfaceLight,
          onRefresh: () async => controller.refreshQuotes(),
          child: MasonryGridView.count(
            crossAxisCount: 2,
            mainAxisSpacing: AppSpacing.md,
            crossAxisSpacing: AppSpacing.md,
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.sm,
              AppSpacing.md,
              100,
            ),
            physics: const BouncingScrollPhysics(
              parent: AlwaysScrollableScrollPhysics(),
            ),
            itemCount: controller.quotesList.length,
            itemBuilder: (context, index) {
              final quote = controller.quotesList[index];
              return _buildQuoteCard(quote, index);
            },
          ),
        );
      }),
    );
  }

  Widget _buildQuoteCard(quote, int index) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        Get.to(
          () => QuoteDetailView(quote: quote),
          transition: Transition.fadeIn,
        );
      },
      child: Hero(
        tag: 'quote_${quote.id}',
        child: GlassContainer(
          borderRadius: BorderRadius.circular(16),
          padding: const EdgeInsets.all(AppSpacing.md),
          color: AppColors.surfaceGlass,
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          // Added a slight random rotation/tilt for a scattered note look
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.format_quote_rounded,
                color: AppColors.primary,
                size: 28,
              ),
              const SizedBox(height: 8),
              Text(
                quote.text,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white,
                  height: 1.4,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Flexible(
                    child: Text(
                      '- ${quote.author.isNotEmpty ? quote.author : 'Unknown'}',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: Colors.white70,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.end,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ).animate(delay: (50 * (index % 10)).ms).fade().slideY(begin: 0.1),
      ),
    );
  }
}
