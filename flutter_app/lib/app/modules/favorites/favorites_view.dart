import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'favorites_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/festival_card.dart'; // We can reuse this or make a specific one
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/void_empty_state.dart';
import '../../routes/app_pages.dart';

class FavoritesView extends GetView<FavoritesController> {
  const FavoritesView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text('Memory Lane', style: AppTextStyles.headlineMedium),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
      ),
      body: Obx(() {
        final events = controller.favoriteEvents;
        final images = controller.favoriteImages;

        if (events.isEmpty && images.isEmpty) {
          return _buildEmptyState();
        }

        return CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            if (events.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Text(
                    "Saved Events",
                    style: AppTextStyles.headlineSmall,
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final event = events[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: 8,
                    ),
                    child: Transform(
                      alignment: Alignment.center,
                      transform: Matrix4.identity()
                        ..setEntry(3, 2, 0.001)
                        ..rotateX(0.05), // Subtle 3D Tilt
                      child: FestivalCard(
                        event: event,
                        onTap: () =>
                            Get.toNamed(Routes.EVENT_DETAILS, arguments: event),
                      ),
                    ),
                  ).animate().fade(delay: (index * 50).ms).slideX(begin: 0.1);
                }, childCount: events.length),
              ),
            ],

            if (images.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md,
                    AppSpacing.xl,
                    AppSpacing.md,
                    AppSpacing.md,
                  ),
                  child: Text(
                    "Collected Moments",
                    style: AppTextStyles.headlineSmall,
                  ),
                ),
              ),
              SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: AppSpacing.md,
                  crossAxisSpacing: AppSpacing.md,
                  childAspectRatio: 0.8,
                ),
                delegate: SliverChildBuilderDelegate((context, index) {
                  final image = images[index];
                  // Reuse FestivalCard logic or simple Image Card
                  // For now, keep it simple with existing widgets is safer
                  // Let's make a mini glass card inline
                  return GestureDetector(
                    onTap: () =>
                        Get.toNamed('/image-details', arguments: image),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        image: DecorationImage(
                          image: NetworkImage(image.thumbnail),
                          fit: BoxFit.cover,
                        ),
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Colors.black54],
                          ),
                        ),
                        alignment: Alignment.bottomRight,
                        padding: const EdgeInsets.all(8),
                        child: const Icon(
                          Icons.favorite,
                          color: AppColors.error,
                          size: 18,
                        ),
                      ),
                    ),
                  ).animate(delay: (index * 50).ms).fade().scale();
                }, childCount: images.length),
              ),
            ],

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        );
      }),
    );
  }

  Widget _buildEmptyState() {
    return const VoidEmptyState(
      message: "No memories collected",
      subMessage: "Explore the void to find light.",
    );
  }
}
