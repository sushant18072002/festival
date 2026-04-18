import 'package:flutter/material.dart' hide SearchController;
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'dart:ui';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/glass_container.dart';
import '../../widgets/smart_image.dart';
import '../../data/models/event_model.dart';
import '../../data/models/image_model.dart';
import '../../routes/app_pages.dart';
import 'search_controller.dart';

class SearchOracleView extends GetView<SearchController> {
  const SearchOracleView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Blur Background (The Veil)
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              color: isDark
                  ? Colors.black.withValues(alpha: 0.82)
                  : Colors.white.withValues(alpha: 0.55),
            ),
          ),

          // 2. Content
          SafeArea(
            child: Column(
              children: [
                // Header / Close
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Align(
                    alignment: Alignment.topRight,
                    child: IconButton(
                      onPressed: () => Get.back(),
                      icon: Icon(
                        LucideIcons.x,
                        color: AppColors.textAdaptiveSecondary(context),
                        size: 32,
                      ),
                    ),
                  ),
                ),

                const Spacer(flex: 1),

                // 3. The Oracle Input
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: Hero(
                          tag: 'search_bar_hero',
                          child: Material(
                            color: Colors.transparent,
                            child: TextField(
                              controller: controller.textController,
                              onChanged: controller.onSearchChanged,
                              autofocus: true,
                              style: AppTextStyles.headlineMedium(context).copyWith(
                                color: AppColors.primaryAdaptive(context),
                              ),
                              textAlign: TextAlign.center,
                              cursorColor: AppColors.primaryAdaptive(context),
                              decoration: InputDecoration(
                                hintText: 'Ask the Oracle...',
                                hintStyle: AppTextStyles.headlineMedium(context)
                                    .copyWith(
                                      color: isDark
                                          ? Colors.white24
                                          : Colors.black26,
                                    ),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Obx(
                        () => GestureDetector(
                          onTap: controller.isListening.value
                              ? controller.stopListening
                              : controller.startListening,
                          behavior: HitTestBehavior.opaque,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: controller.isListening.value
                                  ? AppColors.error.withValues(alpha: 0.2)
                                  : Colors.transparent,
                              boxShadow: controller.isListening.value
                                  ? [
                                      BoxShadow(
                                        color: AppColors.error.withValues(
                                          alpha: 0.5,
                                        ),
                                        blurRadius: 20,
                                        spreadRadius: 5,
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Icon(
                                      controller.isListening.value
                                          ? LucideIcons.mic
                                          : LucideIcons.micOff,
                                      color: controller.isListening.value
                                          ? AppColors.error
                                          : AppColors.primaryAdaptive(context),
                                      size: 28,
                                    )
                                    .animate(
                                      target: controller.isListening.value
                                          ? 1
                                          : 0,
                                    )
                                    .scaleXY(end: 1.2, duration: 400.ms)
                                    .shimmer(duration: 1000.ms),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Loading Indicator
                Obx(
                  () => controller.isSearching.value
                      ? Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: CircularProgressIndicator(
                            color: AppColors.primaryAdaptive(context),
                          ),
                        )
                      : const SizedBox(height: 16),
                ),

                const Spacer(flex: 1),

                // 4. Results (3D Fly-in)
                Expanded(
                  flex: 4,
                  child: Obx(() {
                    if (controller.searchQuery.isEmpty) {
                      return const SizedBox.shrink();
                    }

                    final results = controller.searchResults;
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final item = results[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _buildResultItem(item, index, context),
                        );
                      },
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultItem(dynamic item, int index, BuildContext context) {
    // Determine type
    final isEvent = item is EventModel;
    final title = isEvent ? item.title : (item as ImageModel).displayLabel;
    final sub = isEvent ? item.location : 'Gallery Image';
    final image = isEvent
        ? (item.displayThumbnailUrl ?? '')
        : item.thumbnail;

    return GlassContainer(
          color: AppColors.surfaceGlass(context),
          child: ListTile(
            contentPadding: const EdgeInsets.all(8),
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SmartImage(
                image,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
              ),
            ),
            title: Text(title, style: AppTextStyles.titleMedium(context).copyWith(color: AppColors.textAdaptive(context))),
            subtitle: Text(
              sub,
              style: AppTextStyles.bodySmall(context).copyWith(
                color: AppColors.textAdaptiveSecondary(context),
              ),
            ),
            trailing: Icon(
              LucideIcons.chevronRight,
              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
              size: 16,
            ),
            onTap: () {
              if (isEvent) {
                Get.toNamed(Routes.eventDetails, arguments: item);
              } else {
                Get.toNamed(Routes.imageDetails, arguments: item);
              }
            },
          ),
        )
        .animate(delay: (100 * index).ms)
        .fadeIn(duration: 400.ms)
        .slideY(
          begin: 0.2,
          end: 0,
          curve: Curves.easeOutBack,
        ) // Fly in from bottom
        .shimmer(
          delay: (400 + 100 * index).ms,
          duration: 1000.ms,
        ); // Neon shimmer scan
  }
}
