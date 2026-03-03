import 'dart:math';
import 'package:flutter/material.dart';

class ParticleExplosionPainter extends CustomPainter {
  final double progress; // 0.0 to 1.0
  final Color color;

  ParticleExplosionPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    if (progress == 0) return;

    final paint = Paint()..style = PaintingStyle.fill;
    final center = Offset(size.width / 2, size.height / 2);
    final Random random = Random(42); // Fixed seed for consistent explosion

    // Explosion Parameters
    final double maxRadius = size.width * 1.2;
    final int particleCount = 100;

    for (int i = 0; i < particleCount; i++) {
      // Random angle and speed
      final double angle = random.nextDouble() * 2 * pi;
      final double speed = 0.5 + random.nextDouble() * 4.0;

      // Calculate current position based on progress
      // Non-linear easing for "Pop" effect
      final double currentDist = maxRadius * pow(progress, 0.5) * speed;

      // Calculate opacity (fade out as it expands)
      final double opacity = (1.0 - progress).clamp(0.0, 1.0);

      if (opacity <= 0) continue;

      final double x = center.dx + cos(angle) * currentDist;
      final double y = center.dy + sin(angle) * currentDist;

      paint.color = color.withValues(alpha: opacity);

      // Particle Size shrinks as it travels
      final double particleSize =
          (4.0 * (1.0 - progress)) * random.nextDouble() + 1.0;

      canvas.drawCircle(Offset(x, y), particleSize, paint);
    }
  }

  @override
  bool shouldRepaint(covariant ParticleExplosionPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
