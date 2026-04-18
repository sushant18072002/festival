import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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
        title: Text('Inspirations', style: AppTextStyles.headlineMedium(context).copyWith(color: AppColors.textAdaptive(context))),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.shuffle),
            onPressed: () => controller.refreshQuotes(),
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return Center(
            child: CircularProgressIndicator(color: AppColors.primaryAdaptive(context)),
          );
        }

        if (controller.quotesList.isEmpty) {
          return Center(
            child: Text(
              'No quotes found.',
              style: AppTextStyles.bodyLarge(context).copyWith(color: AppColors.textAdaptiveSecondary(context)),
            ),
          );
        }

        return RefreshIndicator(
          color: AppColors.primaryAdaptive(context),
          backgroundColor: AppColors.surface(context),
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
              return _buildQuoteCard(quote, index, context);
            },
          ),
        );
      }),
    );
  }

  Widget _buildQuoteCard(quote, int index, BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        Get.to(
          () => QuoteDetailView(quote: quote),
          transition: Transition.fadeIn,
        );
      },
      // No Hero — quotes appear in both QuotesView and ExploreView simultaneously
      child: GlassContainer(
        borderRadius: BorderRadius.circular(16),
        padding: const EdgeInsets.all(AppSpacing.md),
        color: AppColors.surfaceGlass(context),
        border: Border.all(color: AppColors.glassBorder(context)),
        // Added a slight random rotation/tilt for a scattered note look
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              LucideIcons.quote,
              color: AppColors.primaryAdaptive(context),
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              quote.text,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
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
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
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
    );
  }
}
