class ImageModel {
  final String id;
  final String url;
  final String thumbnail;
  final String caption; // Display text for gallery (e.g. "Lighting the Diya")
  final String shareText; // Share text (e.g. "#Utsav #5")
  final String mediaType;
  final int downloads;
  final int likes;
  final int shares;
  final DateTime? createdAt;
  final String? eventId;
  final List<String> vibes;
  final double aspectRatio;
  final String? credits;

  // New backend fields
  final bool isStandalone;
  final String? standaloneCategory;
  final bool hasOverlay;
  final String? greetingId;
  final Map<String, dynamic>? greetingConfig;
  final String? quoteId;
  final Map<String, dynamic>? quoteConfig;
  final List<String> dominantColors;
  final bool isS3Uploaded;
  final bool isPremium; // Indicates if image requires rewarded ad

  ImageModel({
    required this.id,
    required this.url,
    required this.thumbnail,
    this.caption = '',
    this.shareText = '',
    this.mediaType = 'image',
    this.downloads = 0,
    this.likes = 0,
    this.shares = 0,
    this.createdAt,
    this.eventId,
    this.vibes = const [],
    this.aspectRatio = 1.0,
    this.credits,
    this.isStandalone = false,
    this.standaloneCategory,
    this.hasOverlay = false,
    this.greetingId,
    this.greetingConfig,
    this.quoteId,
    this.quoteConfig,
    this.dominantColors = const [],
    this.isS3Uploaded = false,
    this.isPremium = false,
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
      downloads: json['downloads'] ?? 0,
      likes: json['likes'] ?? 0,
      shares: json['shares'] ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : DateTime.now(),
      eventId: json['event_id'],
      vibes: List<String>.from(json['vibes'] ?? []),
      aspectRatio: (json['aspect_ratio'] ?? 1.0).toDouble(),
      credits: json['credits'],
      isStandalone: json['is_standalone'] ?? false,
      standaloneCategory: json['standalone_category'],
      hasOverlay: json['has_overlay'] ?? false,
      greetingId: json['greeting_id'],
      greetingConfig: json['greeting_config'] as Map<String, dynamic>?,
      quoteId: json['quote_id'],
      quoteConfig: json['quote_config'] as Map<String, dynamic>?,
      dominantColors: List<String>.from(json['dominant_colors'] ?? []),
      isS3Uploaded: json['is_s3_uploaded'] ?? false,
      isPremium:
          json['is_premium'] ??
          false, // Assign random or backend provided value in DataRepository
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
      'downloads': downloads,
      'likes': likes,
      'shares': shares,
      'created_at': createdAt?.toIso8601String(),
      'event_id': eventId,
      'vibes': vibes,
      'aspect_ratio': aspectRatio,
      if (credits != null) 'credits': credits,
      'is_standalone': isStandalone,
      'standalone_category': standaloneCategory,
      'has_overlay': hasOverlay,
      'greeting_id': greetingId,
      'greeting_config': greetingConfig,
      'quote_id': quoteId,
      'quote_config': quoteConfig,
      'dominant_colors': dominantColors,
      'is_s3_uploaded': isS3Uploaded,
    };
  }
}
