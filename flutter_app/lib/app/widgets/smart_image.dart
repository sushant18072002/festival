import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Smart image widget with cached_network_image
class SmartImage extends StatelessWidget {
  final String url;
  final BoxFit? fit;
  final double? width;
  final double? height;
  final int? memCacheWidth;
  final int? memCacheHeight;
  final String? semanticLabel;

  const SmartImage(
    this.url, {
    super.key,
    this.fit,
    this.width,
    this.height,
    this.memCacheWidth,
    this.memCacheHeight,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) return _buildError();

    String resolvedUrl = url;
    final cdnBase = dotenv.env['CDN_BASE_URL'] ?? '';
    if (!resolvedUrl.startsWith('http') && cdnBase.isNotEmpty) {
      resolvedUrl = cdnBase.endsWith('/')
          ? '$cdnBase${resolvedUrl.startsWith('/') ? resolvedUrl.substring(1) : resolvedUrl}'
          : '$cdnBase/${resolvedUrl.startsWith('/') ? resolvedUrl.substring(1) : resolvedUrl}';
    }

    return CachedNetworkImage(
      imageUrl: resolvedUrl,
      fit: fit ?? BoxFit.cover,
      width: width,
      height: height,
      memCacheWidth: memCacheWidth,
      memCacheHeight: memCacheHeight,
      placeholder: (context, url) => _buildShimmer(),
      errorWidget: (context, url, error) => _buildError(),
      fadeInDuration: const Duration(milliseconds: 300),
    );
  }

  Widget _buildShimmer() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: AppRadius.cardRadius,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(color: AppColors.surfaceLight),
          Image.asset(
            'assets/images/utsav_placeholder.png',
            fit: BoxFit.cover,
            opacity: const AlwaysStoppedAnimation(0.1),
          ),
          Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.surfaceLight.withValues(alpha: 0.1),
                      AppColors.backgroundLight.withValues(alpha: 0.5),
                      AppColors.surfaceLight.withValues(alpha: 0.1),
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              )
              .animate(onPlay: (c) => c.repeat())
              .shimmer(
                duration: const Duration(milliseconds: 1500),
                color: Colors.white24,
              ),
          Center(
            child: Icon(
              Icons.image_outlined,
              size: 32,
              color: AppColors.textMuted.withValues(alpha: 0.3),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: AppRadius.cardRadius,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/utsav_placeholder.png',
            fit: BoxFit.cover,
            opacity: const AlwaysStoppedAnimation(0.4),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Lottie.asset(
                  'assets/lottie/holi.json',
                  width: 50,
                  height: 50,
                  fit: BoxFit.contain,
                  repeat: false,
                  errorBuilder: (context, error, stack) => Icon(
                    Icons.celebration_outlined,
                    size: 32,
                    color: AppColors.primary.withValues(alpha: 0.5),
                  ),
                ),
                AppSpacing.verticalXs,
                Text(
                  'Awaiting Celebration...',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: AppColors.textMuted.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fade(duration: 500.ms);
  }
}
