import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import '../../../theme/app_spacing.dart';

class GridShimmerLoader extends StatelessWidget {
  const GridShimmerLoader({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? Colors.white10 : Colors.black12;
    final highlightColor = isDark ? Colors.white24 : Colors.black26;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: MasonryGridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        mainAxisSpacing: AppSpacing.sm,
        crossAxisSpacing: AppSpacing.sm,
        itemCount: 8,
        itemBuilder: (context, index) {
          // Alternate heights to mimic masonry
          final height = index % 3 == 0 ? 250.0 : 180.0;
          return Container(
            height: height,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
          );
        },
      ),
    );
  }
}
