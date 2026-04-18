import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../data/models/image_model.dart';
import '../data/models/greeting_model.dart';
import '../data/models/quote_model.dart';
import '../data/providers/data_repository.dart';
import 'smart_image.dart';

/// The reference full-detail-page width we design overlays for.
/// All sizes are authored for a ~375pt context (typical phone width).
const double _kReferenceWidth = 375.0;

/// Minimum scale so text never becomes completely invisible.
const double _kMinScale = 0.45;

/// Maximum scale (full size).
const double _kMaxScale = 1.0;

class DynamicOverlayWidget extends StatelessWidget {
  final ImageModel image;
  final BoxFit fit;
  final double? width;
  final double? height;
  final int? memCacheWidth;
  final int? memCacheHeight;
  final bool showOverlay;
  final bool useThumbnail;
  final Color? dominantColor;
  final bool isVideo;
  final bool showWatermark;

  const DynamicOverlayWidget({
    super.key,
    required this.image,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.memCacheWidth,
    this.memCacheHeight,
    this.showOverlay = true,
    this.useThumbnail = false,
    this.dominantColor,
    this.isVideo = false,
    this.showWatermark = false,
  });

  // ─── Color helpers ────────────────────────────────────────────────────────

  Color _parseColor(String? hexColor) {
    if (hexColor == null || hexColor.isEmpty) return Colors.white;
    hexColor = hexColor.toUpperCase().replaceAll('#', '');
    if (hexColor.length == 6) hexColor = 'FF$hexColor';
    return Color(int.tryParse(hexColor, radix: 16) ?? 0xFFFFFFFF);
  }

  Alignment _parsePosition(String? position) {
    switch (position) {
      case 'top':
        return Alignment.topCenter;
      case 'center':
        return Alignment.center;
      case 'bottom':
        return Alignment.bottomCenter;
      case 'top-left':
        return Alignment.topLeft;
      case 'top-right':
        return Alignment.topRight;
      case 'bottom-left':
        return Alignment.bottomLeft;
      case 'bottom-right':
        return Alignment.bottomRight;
      default:
        return Alignment.bottomCenter;
    }
  }

  TextAlign _parseTextAlign(String? align, Alignment position) {
    if (align == 'left') return TextAlign.left;
    if (align == 'right') return TextAlign.right;
    if (align == 'center') return TextAlign.center;
    if (position.x < 0) return TextAlign.left;
    if (position.x > 0) return TextAlign.right;
    return TextAlign.center;
  }

  // ─── Smart Text Node ──────────────────────────────────────────────────────

  /// Builds a single text overlay node that _adapts_ based on `renderWidth`.
  /// When `renderWidth` is small (grid card), everything scales down
  /// proportionally to keep text readable without overflowing.
  Widget _buildTextNode(
    String text,
    OverlayConfig? config,
    double renderWidth,
  ) {
    if (config == null || text.isEmpty) return const SizedBox.shrink();

    // Compute adaptive scale — clamp between min and max.
    final double scale =
        (renderWidth / _kReferenceWidth).clamp(_kMinScale, _kMaxScale);

    // ── Layout values scaled ──────────────────────────────────────────────
    final positionStr = config.position;
    // Scale padding and margins proportionally
    final paddingVal = config.padding.toDouble() * scale;
    final maxWidthPct = config.maxWidth.toDouble(); // keep relative, not scaled
    final marginTop = config.marginTop.toDouble() * scale;
    final marginBottom = config.marginBottom.toDouble() * scale;
    final marginLeft = config.marginLeft.toDouble() * scale;
    final marginRight = config.marginRight.toDouble() * scale;

    // ── Typography scaled ─────────────────────────────────────────────────
    final double fontSize = (config.fontSize.toDouble() * scale).clamp(10.0, 36.0);
    final fontFamily = config.fontFamily;
    final fontWeightNum = config.fontWeight.toInt();
    final fontStyleStr = config.fontStyle;
    final textAlignStr = config.textAlign;
    final letterSpacingPct = config.letterSpacing.toDouble();
    final lineHeightDec = config.lineHeight.toDouble();

    // When very small, cap the line height to prevent ugly gaps
    final double lineHeightFactor = (lineHeightDec / 10.0).clamp(1.1, 1.5);

    // ── Visuals ────────────────────────────────────────────────────────────
    final color = _parseColor(config.color);
    final hasShadow = config.shadow;
    final hasGlassBg = config.glassBg;
    final glassOpacity = config.glassOpacity;
    final glassBlur = config.glassBlur.toDouble();

    final baseAlignment = _parsePosition(positionStr);

    final fontWeights = {
      300: FontWeight.w300,
      400: FontWeight.w400,
      500: FontWeight.w500,
      600: FontWeight.w600,
      700: FontWeight.w700,
      800: FontWeight.w800,
    };

    // ── Text Widget ────────────────────────────────────────────────────────
    Widget textWidget = Text(
      text,
      textAlign: _parseTextAlign(textAlignStr, baseAlignment),
      maxLines: scale < 0.7 ? 2 : null, // Limit lines in tiny cards
      overflow: scale < 0.7 ? TextOverflow.ellipsis : TextOverflow.visible,
      style: TextStyle(
        fontFamily: fontFamily.replaceAll(' ', ''),
        fontSize: fontSize,
        color: color,
        fontWeight: fontWeights[fontWeightNum] ?? FontWeight.w400,
        fontStyle: fontStyleStr == 'italic' ? FontStyle.italic : FontStyle.normal,
        height: lineHeightFactor,
        letterSpacing: fontSize * (letterSpacingPct / 100.0),
        shadows: hasShadow
            ? [
                Shadow(
                  color: Colors.black.withValues(alpha: 0.85),
                  offset: const Offset(0, 1),
                  blurRadius: 6,
                ),
                Shadow(
                  color: Colors.black.withValues(alpha: 0.4),
                  offset: const Offset(0, 0),
                  blurRadius: 14,
                ),
              ]
            : [
                // Always add a subtle shadow for readability even if config doesn't request
                Shadow(
                  color: Colors.black.withValues(alpha: 0.6),
                  offset: const Offset(0, 1),
                  blurRadius: 4,
                ),
              ],
      ),
    );

    // ── Background (Glass or plain padding) ────────────────────────────────
    if (hasGlassBg) {
      textWidget = ClipRRect(
        borderRadius: BorderRadius.circular(12 * scale),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: glassBlur, sigmaY: glassBlur),
          child: Container(
            padding: EdgeInsets.all(paddingVal),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: glassOpacity),
              borderRadius: BorderRadius.circular(12 * scale),
            ),
            child: textWidget,
          ),
        ),
      );
    } else {
      textWidget = Padding(
        padding: EdgeInsets.all(paddingVal),
        child: textWidget,
      );
    }

    // ── Margins with inset defaults (scaled) ──────────────────────────────
    final finalMargin = EdgeInsets.only(
      top: (positionStr == 'top' ||
              positionStr.contains('top') ||
              positionStr == 'center')
          ? ((16.0 * scale) + marginTop)
          : marginTop,
      bottom: positionStr.contains('bottom')
          ? ((20.0 * scale) + marginBottom)
          : marginBottom,
      left: (10.0 * scale) + marginLeft,
      right: (10.0 * scale) + marginRight,
    );

    return Align(
      alignment: baseAlignment,
      child: Padding(
        padding: finalMargin,
        child: FractionallySizedBox(
          widthFactor: (maxWidthPct / 100).clamp(0.5, 1.0),
          child: textWidget,
        ),
      ),
    );
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final repo = Get.find<DataRepository>();

    GreetingModel? greeting;
    if (image.greetingId != null && image.greetingId!.isNotEmpty) {
      greeting = repo.allGreetings
          .firstWhereOrNull((g) => g.id == image.greetingId);
    }

    QuoteModel? quote;
    if (image.quoteId != null && image.quoteId!.isNotEmpty) {
      quote = repo.allQuotes.firstWhereOrNull((q) => q.id == image.quoteId);
    }

    return SizedBox(
      width: width,
      height: height,
      // LayoutBuilder gives us the actual render size at paint time.
      child: LayoutBuilder(
        builder: (context, constraints) {
          // Use the actual rendered width to compute the adaptive scale factor.
          final double renderWidth =
              constraints.maxWidth.isInfinite ? _kReferenceWidth : constraints.maxWidth;

          return Stack(
            fit: StackFit.expand,
            children: [
              // ── Base Image ──────────────────────────────────────────────
              SmartImage(
                useThumbnail && image.thumbnail.isNotEmpty
                    ? image.thumbnail
                    : image.url,
                fit: fit,
                width: width,
                height: height,
                memCacheWidth: memCacheWidth,
                memCacheHeight: memCacheHeight,
                dominantColor: dominantColor,
                isVideo: isVideo,
              ),

              // ── Overlay Texts ───────────────────────────────────────────
              if (showOverlay && image.hasOverlay) ...[
                if (greeting != null)
                  _buildTextNode(greeting.text, image.greetingConfig, renderWidth),
                if (quote != null)
                  _buildTextNode(quote.text, image.quoteConfig, renderWidth),
              ],

              // ── Watermark ────────────────────────────────────────────────
              if (showWatermark && image.showWatermark)
                Positioned(
                  bottom: renderWidth * 0.05,
                  right: renderWidth * 0.05,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: renderWidth * 0.03,
                      vertical: renderWidth * 0.015,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(renderWidth * 0.02),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.landmark,
                          color: Colors.white.withValues(alpha: 0.8),
                          size: renderWidth * 0.04,
                        ),
                        SizedBox(width: renderWidth * 0.015),
                        Text(
                          'Utsav App',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: renderWidth * 0.035,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
