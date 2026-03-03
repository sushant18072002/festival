import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class VoidEmptyState extends StatefulWidget {
  final String message;
  final String? subMessage;
  final Widget? action;

  const VoidEmptyState({
    super.key,
    required this.message,
    this.subMessage,
    this.action,
  });

  @override
  State<VoidEmptyState> createState() => _VoidEmptyStateState();
}

class _VoidEmptyStateState extends State<VoidEmptyState>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // The Lonely Firefly
            SizedBox(
              width: 100,
              height: 100,
              child: Stack(
                children: [
                  // Orbiting Firefly
                  AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      final t = _controller.value * 2 * pi;
                      return Transform.translate(
                        offset: Offset(
                          cos(t) * 20,
                          sin(t * 2) * 10 - 20, // Figure 8 ish
                        ),
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.6),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                              BoxShadow(
                                color: AppColors.secondary.withValues(
                                  alpha: 0.4,
                                ),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  // Faint Halo
                  Center(
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.05),
                          width: 1,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Text
            Text(
              widget.message.toUpperCase(),
              style: AppTextStyles.titleMedium.copyWith(
                color: Colors.white38,
                letterSpacing: 2,
              ),
              textAlign: TextAlign.center,
            ).animate().fade().slideY(begin: 0.2),

            if (widget.subMessage != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.subMessage!,
                style: AppTextStyles.bodySmall.copyWith(color: Colors.white24),
                textAlign: TextAlign.center,
              ).animate().fade(delay: 200.ms),
            ],

            if (widget.action != null) ...[
              const SizedBox(height: 32),
              widget.action!.animate().fade(delay: 400.ms).scale(),
            ],
          ],
        ),
      ),
    );
  }
}
