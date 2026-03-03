import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class MeshGradientPainter extends CustomPainter {
  final double animationValue;

  MeshGradientPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    // 3 moving blobs of light
    final Paint paint = Paint()..blendMode = BlendMode.screen;

    // Blob 1: Cyan (Top Left)
    _drawBlob(
      canvas,
      paint,
      color: AppColors.primary.withValues(alpha: 0.15),
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
      color: AppColors.secondary.withValues(alpha: 0.12),
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
      color: AppColors.accent.withValues(alpha: 0.08),
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
    return oldDelegate.animationValue != animationValue;
  }
}
