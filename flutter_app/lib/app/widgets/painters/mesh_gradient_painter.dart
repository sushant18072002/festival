import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class MeshGradientPainter extends CustomPainter {
  final double animationValue;
  final bool isDark;

  MeshGradientPainter(this.animationValue, {this.isDark = true});

  @override
  void paint(Canvas canvas, Size size) {
    // In dark mode: BlendMode.screen makes blobs glow on black.
    // In light mode: BlendMode.multiply makes them appear as soft color washes on white.
    final Paint paint = Paint()
      ..blendMode = isDark ? BlendMode.screen : BlendMode.multiply;

    // Blob 1: Cyan (Top Left)
    _drawBlob(
      canvas,
      paint,
      color: AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.25),
      center: Offset(
        size.width * 0.2 + sin(animationValue * 0.5) * 50,
        size.height * 0.3 + cos(animationValue * 0.3) * 50,
      ),
      radius: size.width * 0.6,
    );

    // Blob 2: Magenta (Bottom Right)
    _drawBlob(
      canvas,
      paint,
      color: AppColors.secondary.withValues(alpha: isDark ? 0.12 : 0.20),
      center: Offset(
        size.width * 0.8 - cos(animationValue * 0.4) * 60,
        size.height * 0.7 - sin(animationValue * 0.6) * 60,
      ),
      radius: size.width * 0.7,
    );

    // Blob 3: Gold (Center)
    _drawBlob(
      canvas,
      paint,
      color: AppColors.accent.withValues(alpha: isDark ? 0.08 : 0.15),
      center: Offset(
        size.width * 0.5 + sin(animationValue * 0.8) * 30,
        size.height * 0.5 + cos(animationValue * 0.7) * 30,
      ),
      radius: size.width * 0.5 + sin(animationValue) * 20,
    );
  }

  void _drawBlob(
    Canvas canvas,
    Paint paint, {
    required Color color,
    required Offset center,
    required double radius,
  }) {
    paint.shader = RadialGradient(
      colors: [color, Colors.transparent],
      stops: const [0.0, 1.0],
    ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(covariant MeshGradientPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.isDark != isDark;
  }
}
