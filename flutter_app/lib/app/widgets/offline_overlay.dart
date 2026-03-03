import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:ui';
import 'dart:typed_data';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

// A widget to wrap the app or specific screens to handle offline state
class OfflineOverlay extends StatelessWidget {
  final Widget child;
  final bool isOffline;

  const OfflineOverlay({
    super.key,
    required this.child,
    this.isOffline = false, // driven by controller in real app
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // The main content
        child,

        // The Offline Overlay
        if (isOffline)
          Positioned.fill(
            child: IgnorePointer(
              ignoring:
                  false, // Block interaction? Or just warn? Let's block for now or visible warning.
              // Let's make it a bottom sheet warning that doesn't block everything,
              // OR a full screen desaturation.
              // "Desaturated Flickering Neon" effect.
              child: Stack(
                children: [
                  // 1. Saturation Filter (Grayscale the app)
                  ColorFiltered(
                    colorFilter: const ColorFilter.mode(
                      Colors.grey,
                      BlendMode.saturation,
                    ),
                    child: Container(
                      color: Colors.black.withValues(alpha: 0.0),
                    ), // Dummy for filter? No, ColorFiltered needs to wrap the child to affect it.
                    // Ah, to filter the *underlying* app, we need to wrap the whole app in ColorFiltered.
                    // Since this is an overlay ON TOP, we can't easily desaturate what's behind without BackdropFilter (which blurs, doesn't desaturate easily).
                    // BackdropFilter *can* do Matrix4 filter for saturation!
                  ),

                  // BackDrop with Saturation Matrix
                  BackdropFilter(
                    filter: ImageFilter.matrix(
                      // Grayscale matrix
                      Float64List.fromList(<double>[
                        0.2126,
                        0.7152,
                        0.0722,
                        0,
                        0,
                        0.2126,
                        0.7152,
                        0.0722,
                        0,
                        0,
                        0.2126,
                        0.7152,
                        0.0722,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                      ]),
                    ),
                    child: Container(color: Colors.transparent),
                  ),

                  // 2. Flickering Neon Warning
                  Align(
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                              Icons.wifi_off_rounded,
                              size: 64,
                              color: AppColors.error,
                            )
                            .animate(onPlay: (c) => c.repeat())
                            .fadeIn(duration: 1000.ms)
                            .then()
                            .fadeOut(duration: 1000.ms), // Flicker
                        const SizedBox(height: 16),
                        Text(
                              "CONNECTION LOST",
                              style: AppTextStyles.headlineMedium.copyWith(
                                color: AppColors.error,
                              ),
                            )
                            .animate(onPlay: (c) => c.repeat())
                            .tint(
                              color: Colors.white,
                              duration: 200.ms,
                            ) // Electrical flicker
                            .then()
                            .tint(color: AppColors.error, duration: 200.ms)
                            .tint(color: AppColors.error, duration: 200.ms)
                            .then(delay: 800.ms),

                        const SizedBox(height: 8),
                        Text(
                          "The signal is fading...",
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Colors.white54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
