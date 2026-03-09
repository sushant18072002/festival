import 'package:flutter/material.dart';
import 'painters/mesh_gradient_painter.dart';
import 'painters/noise_painter.dart';

/// The foundational scaffold for the Neo-Modern aesthetic.
/// Provides:
/// 1. Kinetic Mesh Gradient Background (adapts to light / dark theme)
/// 2. Film Grain / Noise Overlay
/// 3. Proper Safe Area and App Bar handling
class NeoScaffold extends StatefulWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final bool hideNoise;
  final bool hideGradient;
  final Color? backgroundColor;

  const NeoScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.hideNoise = false,
    this.hideGradient = false,
    this.backgroundColor,
  });

  @override
  State<NeoScaffold> createState() => _NeoScaffoldState();
}

class _NeoScaffoldState extends State<NeoScaffold>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Use caller's override → theme's scaffold color → AppColors fallback
    final bgColor =
        widget.backgroundColor ?? Theme.of(context).scaffoldBackgroundColor;

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: bgColor,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Kinetic Gradient Background (theme-aware)
          if (!widget.hideGradient)
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return CustomPaint(
                  painter: MeshGradientPainter(
                    _controller.value,
                    isDark: isDark,
                  ),
                  size: Size.infinite,
                );
              },
            ),

          // 2. Static Noise Overlay
          if (!widget.hideNoise)
            IgnorePointer(
              child: CustomPaint(
                painter: NoisePainter(opacity: 0.03, density: 0.6),
                size: Size.infinite,
              ),
            ),

          // 3. Main Content
          SafeArea(
            top: widget.appBar == null,
            bottom: widget.bottomNavigationBar == null,
            child: widget.body,
          ),

          // 4. App Bar (Fixed on top)
          if (widget.appBar != null)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(bottom: false, child: widget.appBar!),
            ),
        ],
      ),
      bottomNavigationBar: widget.bottomNavigationBar,
      floatingActionButton: widget.floatingActionButton,
    );
  }
}
