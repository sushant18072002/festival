import 'dart:io';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Smart image widget with offline-first caching and graceful Lottie error handling
class SmartImage extends StatefulWidget {
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
  State<SmartImage> createState() => _SmartImageState();
}

class _SmartImageState extends State<SmartImage> {
  File? _localFile;
  String? _fallbackAssetPath;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initImage();
  }

  @override
  void didUpdateWidget(covariant SmartImage oldWidget) {
    if (oldWidget.url != widget.url) {
      _initImage();
    }
    super.didUpdateWidget(oldWidget);
  }

  Future<void> _initImage() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _hasError = false;
      _localFile = null;
      _fallbackAssetPath = null;
    });

    if (widget.url.isEmpty) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
        });
      }
      return;
    }

    // Remote mode + Offline Cache
    try {
      String resolvedUrl = widget.url;
      final cdnBase = dotenv.env['CDN_BASE_URL'] ?? '';
      if (!resolvedUrl.startsWith('http') && cdnBase.isNotEmpty) {
        resolvedUrl = cdnBase.endsWith('/')
            ? '$cdnBase${resolvedUrl.startsWith('/') ? resolvedUrl.substring(1) : resolvedUrl}'
            : '$cdnBase/${resolvedUrl.startsWith('/') ? resolvedUrl.substring(1) : resolvedUrl}';
      }
      final uri = Uri.parse(resolvedUrl);

      // Use MD5 hash of the FULL URL as cache key — prevents collision when
      // different events share the same filename (e.g. multiple _1.webp files).
      final cacheKey = md5.convert(utf8.encode(resolvedUrl)).toString();
      final ext = uri.pathSegments.isNotEmpty
          ? uri.pathSegments.last.split('.').last
          : 'webp';

      final docDir = await getApplicationDocumentsDirectory();
      final imageDir = Directory('${docDir.path}/utsav_images');
      if (!await imageDir.exists()) {
        await imageDir.create(recursive: true);
      }

      final localPath = '${imageDir.path}/$cacheKey.$ext';
      final file = File(localPath);

      if (await file.exists()) {
        // Cache Hit!
        if (mounted) {
          setState(() {
            _localFile = file;
            _isLoading = false;
          });
        }
      } else {
        // Fetch from network
        final response = await http.get(uri);
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
          if (mounted) {
            setState(() {
              _localFile = file;
              _isLoading = false;
            });
          }
        } else {
          // Fallback to error Lottie if 404/500
          if (mounted) {
            setState(() {
              _hasError = true;
              _isLoading = false;
            });
          }
        }
      }
    } catch (e) {
      // Network Exception -> Offline -> Show Lottie
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildShimmer();
    }

    if (_hasError) {
      return _buildError();
    }

    if (_fallbackAssetPath != null) {
      return Image.asset(
        _fallbackAssetPath!,
        fit: widget.fit,
        width: widget.width,
        height: widget.height,
        cacheWidth: widget.memCacheWidth,
        cacheHeight: widget.memCacheHeight,
        semanticLabel: widget.semanticLabel ?? 'Image',
        errorBuilder: (context, error, stackTrace) => _buildError(),
      ).animate().fade(duration: 300.ms);
    }

    if (_localFile != null) {
      return Image.file(
        _localFile!,
        fit: widget.fit,
        width: widget.width,
        height: widget.height,
        cacheWidth: widget.memCacheWidth,
        cacheHeight: widget.memCacheHeight,
        semanticLabel: widget.semanticLabel ?? 'Image',
        errorBuilder: (context, error, stackTrace) => _buildError(),
      ).animate().fade(duration: 300.ms);
    }

    return _buildError();
  }

  /// Shimmer loading placeholder with animated gradient
  Widget _buildShimmer() {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: AppRadius.cardRadius,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Base color
          Container(color: AppColors.surfaceLight),
          // Premium Background (Faint)
          Image.asset(
            'assets/images/utsav_placeholder.png',
            fit: BoxFit.cover,
            opacity: const AlwaysStoppedAnimation(0.1),
          ),

          // Shimmer gradient animation
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
          // Centered icon
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

  /// Error state with Premium Placeholder
  Widget _buildError() {
    return Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        borderRadius: AppRadius.cardRadius,
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Premium Background
          Image.asset(
            'assets/images/utsav_placeholder.png',
            fit: BoxFit.cover,
            opacity: const AlwaysStoppedAnimation(0.4),
          ),

          // Subtle Overlay Info
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
