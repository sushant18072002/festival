import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class GlassContainer extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final Color? color;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BoxBorder? border;
  final List<BoxShadow>? shadows;
  final VoidCallback? onTap;

  const GlassContainer({
    super.key,
    required this.child,
    this.blur = 12.0, // Slightly increased for more "frosted" look
    this.opacity = 0.1, // Reduced for cleaner clarity
    this.color,
    this.borderRadius,
    this.padding,
    this.margin,
    this.border,
    this.shadows,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final br = borderRadius ?? BorderRadius.circular(24);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Professional Defaults
    final baseColor = color ?? (isDark ? Colors.white : const Color(0xFF0F172A));
    final effectiveShadows = shadows ?? AppColors.glassShadow(context);
    final effectiveBorder = border ?? AppColors.adaptiveBorder(context);

    Widget container = Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: br,
        boxShadow: effectiveShadows,
      ),
      child: ClipRRect(
        borderRadius: br,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Stack(
            children: [
              // 1. Base Opacity Layer
              Container(
                padding: padding,
                decoration: BoxDecoration(
                  color: baseColor.withValues(alpha: opacity),
                  borderRadius: br,
                  border: effectiveBorder,
                ),
                child: child,
              ),
              
              // 2. Inner Glow Overlay (Premium edge lighting)
              if (isDark)
                Positioned.fill(
                  child: IgnorePointer(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: br,
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white.withValues(alpha: 0.05),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.05),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: () {
          Feedback.forTap(context);
          onTap!();
        },
        child: container,
      );
    }

    return container;
  }
}
