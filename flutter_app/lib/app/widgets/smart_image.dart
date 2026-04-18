import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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
  final Color? dominantColor;
  final bool isVideo;

  const SmartImage(
    this.url, {
    super.key,
    this.fit,
    this.width,
    this.height,
    this.memCacheWidth,
    this.memCacheHeight,
    this.semanticLabel,
    this.dominantColor,
    this.isVideo = false,
  });

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) return _buildError();

    String resolvedUrl = url;
    final cdnBase = (dotenv.env['CDN_BASE_URL'] ?? '').trim();
    
    if (!resolvedUrl.startsWith('http') && cdnBase.isNotEmpty) {
      // Sanitize input key: strip leading slash
      String cleanKey = resolvedUrl.startsWith('/') ? resolvedUrl.substring(1) : resolvedUrl;
      
      // Resilient Check: If the key already includes the environment path (e.g. 'Utsav/stage/')
      // and the cdnBase also includes it, we must strip it from the key to avoid duplication.
      final Uri baseUri = Uri.parse(cdnBase);
      String basePath = baseUri.path;
      if (basePath.startsWith('/')) basePath = basePath.substring(1);
      if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);

      if (basePath.isNotEmpty && cleanKey.startsWith(basePath)) {
        cleanKey = cleanKey.substring(basePath.length);
        if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);
      }

      resolvedUrl = cdnBase.endsWith('/') ? '$cdnBase$cleanKey' : '$cdnBase/$cleanKey';
    }

    final isGif = resolvedUrl.toLowerCase().endsWith('.gif');
    final isMp4 = resolvedUrl.toLowerCase().endsWith('.mp4');
    
    // Future-proof: If it's an MP4, we should ideally render a VideoPlayer.
    // For now, we show the placeholder with a explicit video icon if it's forced by isMp4.
    final effectivelyVideo = isVideo || isMp4;

    if (effectivelyVideo && !resolvedUrl.endsWith('.jpg') && !resolvedUrl.endsWith('.png') && !resolvedUrl.endsWith('.webp')) {
         return Stack(
          fit: StackFit.expand,
          children: [
            _buildShimmer(), // Base placeholder
             Center(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    LucideIcons.circlePlay,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
              ),
          ],
        );
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
      imageBuilder: (context, imageProvider) {
        return Stack(
          fit: StackFit.expand,
          children: [
            Image(
              image: imageProvider,
              fit: fit ?? BoxFit.cover,
              width: width,
              height: height,
            ),
            if (effectivelyVideo || isGif)
              Center(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isGif ? LucideIcons.clapperboard : LucideIcons.play,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildShimmer() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: dominantColor ?? AppColors.surfaceLight,
        borderRadius: AppRadius.cardRadius,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(color: dominantColor ?? AppColors.surfaceLight),
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
              LucideIcons.image,
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
                  'assets/lottie/loading_mandala.json',
                  width: 50,
                  height: 50,
                  fit: BoxFit.contain,
                  repeat: false,
                  errorBuilder: (context, error, stack) => Icon(
                    LucideIcons.partyPopper,
                    size: 32,
                    color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
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
