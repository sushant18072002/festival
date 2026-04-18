class ImageModel {
  final String id;
  final String url;
  final String thumbnail;
  final String caption;
  final String shareText;
  final String mediaType;
  final String? credits;
  final String language;
  final double aspectRatio;
  final List<String> categories;
  final List<String> tags;
  final List<String> dominantColors;
  final int downloadsCount;
  final int likesCount;
  final int sharesCount;

  // Overlay / linking fields
  final bool isStandalone;
  final String? standaloneCategory;
  final bool hasOverlay;
  final String? greetingId;
  final OverlayConfig? greetingConfig;
  final String? quoteId;
  final OverlayConfig? quoteConfig;
  final bool isS3Uploaded;
  final bool isPremium; // Local-only flag for rewarded-ad gating
  final bool showWatermark;

  ImageModel({
    required this.id,
    required this.url,
    required this.thumbnail,
    this.caption = '',
    this.shareText = '',
    this.mediaType = 'image',
    this.credits,
    this.language = 'neutral',
    this.aspectRatio = 1.0,
    this.categories = const [],
    this.tags = const [],
    this.dominantColors = const [],
    this.isStandalone = false,
    this.standaloneCategory,
    this.hasOverlay = false,
    this.greetingId,
    this.greetingConfig,
    this.quoteId,
    this.quoteConfig,
    this.isS3Uploaded = false,
    this.isPremium = false,
    this.showWatermark = true, // Default to true for safety
    this.downloadsCount = 0,
    this.likesCount = 0,
    this.sharesCount = 0,
  });

  /// Display-friendly label: caption first, then shareText, never empty.
  String get displayLabel => caption.isNotEmpty ? caption : shareText;

  factory ImageModel.fromJson(Map<String, dynamic> json) {
    return ImageModel(
      id: json['id'] ?? '',
      url: json['url'] ?? '',
      thumbnail: json['thumbnail'] ?? '',
      caption: json['caption'] ?? json['title'] ?? '',
      shareText: json['share_text'] ?? '',
      mediaType: json['media_type'] ?? 'image',
      credits: json['credits'],
      language: json['language'] ?? 'neutral',
      aspectRatio: (json['aspect_ratio'] ?? 1.0).toDouble(),
      categories: List<String>.from(json['categories'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      dominantColors: List<String>.from(json['dominant_colors'] ?? []),
      isStandalone: json['is_standalone'] ?? false,
      standaloneCategory: json['standalone_category'],
      hasOverlay: json['has_overlay'] ?? false,
      greetingId: json['greeting_id'],
      greetingConfig: json['greeting_config'] != null
          ? OverlayConfig.fromJson(json['greeting_config'])
          : null,
      quoteId: json['quote_id'],
      quoteConfig: json['quote_config'] != null
          ? OverlayConfig.fromJson(json['quote_config'])
          : null,
      isS3Uploaded: json['is_s3_uploaded'] ?? false,
      isPremium: json['is_premium'] ?? false,
      showWatermark: json['show_watermark'] ?? true, // maps from backend
      downloadsCount: json['downloads_count'] ?? 0,
      likesCount: json['likes_count'] ?? 0,
      sharesCount: json['shares_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'thumbnail': thumbnail,
      'caption': caption,
      'share_text': shareText,
      'media_type': mediaType,
      if (credits != null) 'credits': credits,
      'language': language,
      'aspect_ratio': aspectRatio,
      'categories': categories,
      'tags': tags,
      'dominant_colors': dominantColors,
      'is_standalone': isStandalone,
      'standalone_category': standaloneCategory,
      'has_overlay': hasOverlay,
      'greeting_id': greetingId,
      'greeting_config': greetingConfig?.toJson(),
      'quote_id': quoteId,
      'quote_config': quoteConfig?.toJson(),
      'is_s3_uploaded': isS3Uploaded,
      'show_watermark': showWatermark,
      'downloads_count': downloadsCount,
      'likes_count': likesCount,
      'shares_count': sharesCount,
    };
  }
}

class OverlayConfig {
  final num padding;
  final num maxWidth;
  final num marginTop;
  final num marginBottom;
  final num marginLeft;
  final num marginRight;
  final num fontSize;
  final String fontFamily;
  final num fontWeight;
  final String fontStyle;
  final String textAlign;
  final num letterSpacing;
  final num lineHeight;
  final bool shadow;
  final bool glassBg;
  final double glassOpacity;
  final num glassBlur;
  final String animation;
  final String color;
  final String position;

  OverlayConfig({
    this.padding = 0,
    this.maxWidth = 100,
    this.marginTop = 0,
    this.marginBottom = 0,
    this.marginLeft = 0,
    this.marginRight = 0,
    this.fontSize = 24,
    this.fontFamily = 'DM Serif Display',
    this.fontWeight = 400,
    this.fontStyle = 'normal',
    this.textAlign = 'center',
    this.letterSpacing = 0,
    this.lineHeight = 1.2,
    this.shadow = false,
    this.glassBg = false,
    this.glassOpacity = 0.25,
    this.glassBlur = 8,
    this.animation = 'none',
    this.color = '#FFFFFF',
    this.position = 'center',
  });

  factory OverlayConfig.fromJson(Map<String, dynamic> json) {
    return OverlayConfig(
      padding: json['padding'] ?? 0,
      maxWidth: json['max_width'] ?? 100,
      marginTop: json['margin_top'] ?? 0,
      marginBottom: json['margin_bottom'] ?? 0,
      marginLeft: json['margin_left'] ?? 0,
      marginRight: json['margin_right'] ?? 0,
      fontSize: json['font_size'] ?? 24,
      fontFamily: json['font_family'] ?? 'DM Serif Display',
      fontWeight: json['font_weight'] ?? 400,
      fontStyle: json['font_style'] ?? 'normal',
      textAlign: json['text_align'] ?? 'center',
      letterSpacing: json['letter_spacing'] ?? 0,
      lineHeight: json['line_height'] ?? 1.2,
      shadow: json['shadow'] ?? false,
      glassBg: json['glass_bg'] ?? false,
      glassOpacity: (json['glass_opacity'] ?? 0.25).toDouble(),
      glassBlur: json['glass_blur'] ?? 8,
      animation: json['animation'] ?? 'none',
      color: json['color'] ?? '#FFFFFF',
      position: json['position'] ?? 'center',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'padding': padding,
      'max_width': maxWidth,
      'margin_top': marginTop,
      'margin_bottom': marginBottom,
      'margin_left': marginLeft,
      'margin_right': marginRight,
      'font_size': fontSize,
      'font_family': fontFamily,
      'font_weight': fontWeight,
      'font_style': fontStyle,
      'text_align': textAlign,
      'letter_spacing': letterSpacing,
      'line_height': lineHeight,
      'shadow': shadow,
      'glass_bg': glassBg,
      'glass_opacity': glassOpacity,
      'glass_blur': glassBlur,
      'animation': animation,
      'color': color,
      'position': position,
    };
  }
}
