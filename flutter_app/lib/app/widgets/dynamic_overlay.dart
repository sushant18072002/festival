import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../data/models/image_model.dart';
import '../data/models/greeting_model.dart';
import '../data/models/quote_model.dart';
import '../data/providers/data_repository.dart';
import 'smart_image.dart';
import 'glass_container.dart';

class DynamicOverlayWidget extends StatelessWidget {
  final ImageModel image;
  final BoxFit fit;
  final double? width;
  final double? height;
  final int? memCacheWidth;
  final int? memCacheHeight;
  final bool showOverlay; // Allows toggling overlays
  final bool useThumbnail; // Determines if thumbnail or full url is used

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
  });

  Color _parseColor(String? hexColor) {
    if (hexColor == null || hexColor.isEmpty) return Colors.white;
    hexColor = hexColor.toUpperCase().replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
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

  Widget _buildTextNode(String text, Map<String, dynamic>? config) {
    if (config == null || text.isEmpty) return const SizedBox.shrink();

    // Layout
    final positionStr = config['position'] as String? ?? 'bottom';
    final paddingVal = (config['padding'] as num?)?.toDouble() ?? 14.0;
    final maxWidthPct = (config['max_width'] as num?)?.toDouble() ?? 80.0;
    final marginTop = (config['margin_top'] as num?)?.toDouble() ?? 0.0;
    final marginBottom = (config['margin_bottom'] as num?)?.toDouble() ?? 0.0;
    final marginLeft = (config['margin_left'] as num?)?.toDouble() ?? 0.0;
    final marginRight = (config['margin_right'] as num?)?.toDouble() ?? 0.0;

    // Typography
    final fontSize = (config['font_size'] as num?)?.toDouble() ?? 24.0;
    final fontFamily = config['font_family'] as String? ?? 'DM Serif Display';
    final fontWeightNum = config['font_weight'] as int? ?? 400;
    final fontStyleStr = config['font_style'] as String? ?? 'normal';
    final textAlignStr = config['text_align'] as String?;
    final letterSpacingPct =
        (config['letter_spacing'] as num?)?.toDouble() ?? 0.0;
    final lineHeightDec = (config['line_height'] as num?)?.toDouble() ?? 14.0;

    // Visuals
    final color = _parseColor(config['color'] as String?);
    final hasShadow = config['shadow'] != false;
    final hasGlassBg = config['glass_bg'] == true;
    final glassOpacity = (config['glass_opacity'] as num?)?.toDouble() ?? 0.25;
    final glassBlur = (config['glass_blur'] as num?)?.toDouble() ?? 8.0;

    final baseAlignment = _parsePosition(positionStr);

    final fontWeights = {
      300: FontWeight.w300,
      400: FontWeight.w400,
      500: FontWeight.w500,
      600: FontWeight.w600,
      700: FontWeight.w700,
      800: FontWeight.w800,
    };

    Widget textWidget = Text(
      text,
      textAlign: _parseTextAlign(textAlignStr, baseAlignment),
      style: TextStyle(
        fontFamily: fontFamily.replaceAll(
          ' ',
          '',
        ), // Assuming fonts declared locally without spaces
        fontSize: fontSize,
        color: color,
        fontWeight: fontWeights[fontWeightNum] ?? FontWeight.w400,
        fontStyle: fontStyleStr == 'italic'
            ? FontStyle.italic
            : FontStyle.normal,
        height: lineHeightDec / 10.0,
        letterSpacing: fontSize * (letterSpacingPct / 100.0), // em derived
        shadows: hasShadow
            ? [
                Shadow(
                  color: Colors.black.withValues(alpha: 0.8),
                  offset: const Offset(0, 2),
                  blurRadius: 8,
                ),
                Shadow(
                  color: Colors.black.withValues(alpha: 0.4),
                  offset: const Offset(0, 0),
                  blurRadius: 16,
                ),
              ]
            : null,
      ),
    );

    if (hasGlassBg) {
      // NOTE: We assume GlassContainer exists and supports these properties or we fallback
      textWidget = GlassContainer(
        padding: EdgeInsets.all(paddingVal),
        borderRadius: BorderRadius.circular(16),
        color: Colors
            .black, // GlassContainer applies its own opacity calculation internally
        opacity: glassOpacity,
        blur: glassBlur,
        child: textWidget,
      );
    } else {
      textWidget = Padding(
        padding: EdgeInsets.all(paddingVal),
        child: textWidget,
      );
    }

    // Convert fixed margins + web's base css inset ratios (approx) into flutter edge insets.
    // In React: top: 5% (16px), bottom 8% (24px), left/right 4% (12px)
    final finalMargin = EdgeInsets.only(
      top:
          (positionStr == 'top' ||
              positionStr.contains('top') ||
              positionStr == 'center')
          ? (16.0 + marginTop)
          : marginTop,
      bottom: positionStr.contains('bottom')
          ? (24.0 + marginBottom)
          : marginBottom,
      left: 12.0 + marginLeft,
      right: 12.0 + marginRight,
    );

    return Align(
      alignment: baseAlignment,
      child: Padding(
        padding: finalMargin,
        child: FractionallySizedBox(
          widthFactor: (maxWidthPct / 100).clamp(0.0, 1.0),
          child: textWidget,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final repo = Get.find<DataRepository>();

    GreetingModel? greeting;
    if (image.greetingId != null && image.greetingId!.isNotEmpty) {
      greeting = repo.allGreetings.firstWhereOrNull(
        (g) => g.id == image.greetingId,
      );
    }

    QuoteModel? quote;
    if (image.quoteId != null && image.quoteId!.isNotEmpty) {
      quote = repo.allQuotes.firstWhereOrNull((q) => q.id == image.quoteId);
    }

    return SizedBox(
      width: width,
      height: height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          SmartImage(
            useThumbnail && image.thumbnail.isNotEmpty
                ? image.thumbnail
                : image.url,
            fit: fit,
            width: width,
            height: height,
            memCacheWidth: memCacheWidth,
            memCacheHeight: memCacheHeight,
          ),

          if (showOverlay && image.hasOverlay) ...[
            if (greeting != null)
              _buildTextNode(greeting.text, image.greetingConfig),

            if (quote != null) _buildTextNode(quote.text, image.quoteConfig),
          ],
        ],
      ),
    );
  }
}
