import 'package:flutter/material.dart';

/// Animation System for Utsav Festival App
/// Defines curves, durations, and common animation configurations
class AppAnimations {
  // ═══════════════════════════════════════════════════════════════════════════
  // DURATION CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════

  /// 100ms — Instant feedback (micro-interactions)
  static const Duration instant = Duration(milliseconds: 100);

  /// 200ms — Fast transitions (button press, tab switch)
  static const Duration fast = Duration(milliseconds: 200);

  /// 300ms — Normal transitions (page enter, card expand)
  static const Duration normal = Duration(milliseconds: 300);

  /// 400ms — Medium transitions (modal open)
  static const Duration medium = Duration(milliseconds: 400);

  /// 500ms — Slow transitions (complex animations)
  static const Duration slow = Duration(milliseconds: 500);

  /// 50ms — Stagger delay between list items
  static const Duration stagger = Duration(milliseconds: 50);

  /// 800ms — Long animations (splash, onboarding)
  static const Duration long = Duration(milliseconds: 800);

  /// 1000ms — Very long (hero transitions)
  static const Duration veryLong = Duration(milliseconds: 1000);

  // ═══════════════════════════════════════════════════════════════════════════
  // CURVES
  // ═══════════════════════════════════════════════════════════════════════════

  /// Smooth transition — general purpose
  static const Curve smooth = Curves.easeInOutCubic;

  /// Quick out — content appearing
  static const Curve quick = Curves.easeOutQuart;

  /// Bounce — playful feedback (hearts, favorites)
  static const Curve bounce = Curves.elasticOut;

  /// Gentle — subtle movements
  static const Curve gentle = Curves.easeInOut;

  /// Decelerate — content sliding in
  static const Curve decelerate = Curves.decelerate;

  /// Overshoot — attention-grabbing
  static const Curve overshoot = Curves.easeOutBack;

  // ═══════════════════════════════════════════════════════════════════════════
  // TAP/PRESS ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Scale factor for card press (slightly smaller)
  static const double tapScale = 0.96;

  /// Scale factor for button press
  static const double buttonTapScale = 0.95;

  /// Duration for tap feedback
  static const Duration tapDuration = fast;

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE OFFSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Slide up from bottom (page enter)
  static const Offset slideFromBottom = Offset(0, 0.1);

  /// Slide from right (list item enter)
  static const Offset slideFromRight = Offset(0.1, 0);

  /// Slide from left
  static const Offset slideFromLeft = Offset(-0.1, 0);

  /// Small slide up (content reveal)
  static const Offset slideUpSmall = Offset(0, 0.05);

  // ═══════════════════════════════════════════════════════════════════════════
  // FADE CONFIGURATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Standard fade in
  static const double fadeStart = 0.0;
  static const double fadeEnd = 1.0;

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRING PHYSICS (for more natural feel)
  // ═══════════════════════════════════════════════════════════════════════════

  static const SpringDescription gentleSpring = SpringDescription(
    mass: 1,
    stiffness: 100,
    damping: 15,
  );

  static const SpringDescription bouncySpring = SpringDescription(
    mass: 1,
    stiffness: 200,
    damping: 10,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE TRANSITION BUILDER
  // ═══════════════════════════════════════════════════════════════════════════

  /// Creates a fade + slide up page transition
  static Widget fadeSlideTransition({
    required Animation<double> animation,
    required Widget child,
  }) {
    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: slideUpSmall,
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: quick)),
        child: child,
      ),
    );
  }

  /// Creates a scale + fade transition (for dialogs/modals)
  static Widget scaleTransition({
    required Animation<double> animation,
    required Widget child,
  }) {
    return ScaleTransition(
      scale: Tween<double>(
        begin: 0.9,
        end: 1.0,
      ).animate(CurvedAnimation(parent: animation, curve: quick)),
      child: FadeTransition(opacity: animation, child: child),
    );
  }
}

/// Extension for easy delay calculations in staggered animations
extension StaggeredDelay on int {
  /// Returns stagger delay based on index
  /// Usage: 2.staggerDelay (returns 100ms for index 2)
  Duration get staggerDelay =>
      Duration(milliseconds: this * AppAnimations.stagger.inMilliseconds);
}

/// Mixin for widgets that need tap animation behavior
mixin TapAnimationMixin<T extends StatefulWidget> on State<T> {
  double _scale = 1.0;

  double get currentScale => _scale;

  void onTapDown(TapDownDetails details) {
    setState(() => _scale = AppAnimations.tapScale);
  }

  void onTapUp(TapUpDetails details) {
    setState(() => _scale = 1.0);
  }

  void onTapCancel() {
    setState(() => _scale = 1.0);
  }

  Widget buildAnimatedScale({required Widget child}) {
    return AnimatedScale(
      scale: _scale,
      duration: AppAnimations.tapDuration,
      curve: AppAnimations.quick,
      child: child,
    );
  }
}
