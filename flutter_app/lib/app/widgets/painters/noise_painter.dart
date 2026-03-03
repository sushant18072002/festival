import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';

/// Paints a static film grain noise texture using efficient drawPoints
class NoisePainter extends CustomPainter {
  final double opacity;
  final double density; // 0.0 to 1.0

  NoisePainter({this.opacity = 0.03, this.density = 0.5});

  @override
  void paint(Canvas canvas, Size size) {
    if (opacity == 0) return;

    final Paint paint = Paint()
      ..color = Colors.white.withValues(alpha: opacity)
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.square;

    final Random random = Random();

    // Calculate number of points based on area and density
    // A density of 1.0 covers ~1% of pixels which looks like good grain
    final int count = (size.width * size.height * 0.01 * density).toInt();

    final List<Offset> points = List.generate(count, (i) {
      return Offset(
        random.nextDouble() * size.width,
        random.nextDouble() * size.height,
      );
    });

    canvas.drawPoints(PointMode.points, points, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
