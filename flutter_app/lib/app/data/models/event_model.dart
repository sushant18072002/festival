import 'package:get/get.dart';
import '../providers/data_repository.dart';

import 'taxonomy_model.dart';
import 'image_model.dart';
import 'mantra_model.dart';

TaxonomyItem? _resolveTaxonomy(dynamic e, String type) {
  if (e == null) return null;

  TaxonomyItem item;
  if (e is String) {
    item = TaxonomyItem(code: e, name: e.toUpperCase());
  } else {
    item = TaxonomyItem.fromJson(e);
  }

  if (Get.isRegistered<DataRepository>()) {
    final tax = Get.find<DataRepository>().currentTaxonomy;
    if (tax != null) {
      List<TaxonomyItem> list = [];
      if (type == 'category')
        list = tax.categories;
      else if (type == 'tag')
        list = tax.tags;
      else if (type == 'vibe')
        list = tax.vibes;

      final match = list.firstWhereOrNull((t) => t.code == item.code);
      if (match != null) {
        return TaxonomyItem(
          code: item.code,
          name: match.name.isNotEmpty ? match.name : item.name,
          icon: match.icon ?? item.icon,
          color: match.color ?? item.color,
        );
      }
    }
  }
  return item;
}

class EventModel {
  final String id;
  final String slug;
  final String title;
  final String description;
  final DateTime? date;

  /// Pre-computed nearest future occurrence date (from backend catalog).
  final DateTime? nextDate;
  final List<TaxonomyItem> vibes;
  final TaxonomyItem? category;
  final ImageModel? image;
  final String? thumbnail;
  final String? wikiLink;
  final LottieOverlayModel? lottieOverlay;
  final List<ImageModel> gallery;
  final String location;

  final int priority;
  final List<TaxonomyItem> tags;
  final List<HistoryFact> facts;
  final List<EventDate> dates;

  // ── Rich Event Fields ──────────────────────────────────────────────────────
  final EventMuhurat? muhurat;
  final List<RitualStep> ritualSteps;
  final AmbientAudio? ambientAudio;
  final List<FestivalRecipe> recipes;
  final DressGuide? dressGuide;
  final NotificationTemplates? notifications;
  final List<PlaylistLink> playlistLinks;
  final List<MantraModel> mantras;
  final List<String> quotes;
  final List<String> greetings;
  final List<String> images;

  /// Nearest upcoming occurrence: uses pre-computed nextDate or searches dates list.
  DateTime? get nextOccurrence {
    if (nextDate != null) return nextDate;
    final now = DateTime.now();
    final future =
        dates
            .where((d) => d.date != null && d.date!.isAfter(now))
            .map((d) => d.date!)
            .toList()
          ..sort();
    return future.isEmpty ? null : future.first;
  }

  EventModel({
    required this.id,
    required this.slug,
    required this.title,
    this.location = 'Festival Grounds',
    this.description = '',
    this.date,
    this.nextDate,
    this.vibes = const [],
    this.category,
    this.image,
    this.thumbnail,
    this.wikiLink,
    this.lottieOverlay,
    this.gallery = const [],
    this.priority = 0,
    this.tags = const [],
    this.facts = const [],
    this.dates = const [],
    this.muhurat,
    this.ritualSteps = const [],
    this.ambientAudio,
    this.recipes = const [],
    this.dressGuide,
    this.notifications,
    this.playlistLinks = const [],
    this.mantras = const [],
    this.quotes = const [],
    this.greetings = const [],
    this.images = const [],
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] ?? '',
      slug: json['slug'] ?? '',
      title: json['title'] ?? '',
      location: json['location'] ?? 'Festival Grounds',
      description: json['description'] ?? '',
      date: json['date'] != null ? DateTime.tryParse(json['date']) : null,
      nextDate: json['next_date'] != null
          ? DateTime.tryParse(json['next_date']['date'] ?? '')
          : null,
      vibes:
          (json['vibes'] as List?)
              ?.map((e) => _resolveTaxonomy(e, 'vibe')!)
              .toList() ??
          [],
      category: json['category'] != null
          ? _resolveTaxonomy(json['category'], 'category')
          : null,
      image: json['image'] != null ? ImageModel.fromJson(json['image']) : null,
      thumbnail: json['thumbnail'], // Map thumbnail
      wikiLink: json['wiki_link'],
      lottieOverlay: json['lottie_overlay'] != null
          ? LottieOverlayModel.fromJson(json['lottie_overlay'])
          : null,
      gallery:
          (json['gallery'] as List?)
              ?.map((e) => ImageModel.fromJson(e))
              .toList() ??
          [],
      priority: json['priority'] ?? 0,
      tags:
          (json['tags'] as List?)
              ?.map((e) => _resolveTaxonomy(e, 'tag')!)
              .toList() ??
          [],
      facts:
          (json['facts'] as List?)
              ?.map((e) => HistoryFact.fromJson(e))
              .toList() ??
          [],
      dates:
          (json['dates'] as List?)
              ?.map((e) => EventDate.fromJson(e))
              .toList() ??
          [],
      muhurat: json['muhurat'] != null
          ? EventMuhurat.fromJson(json['muhurat'])
          : null,
      ritualSteps:
          (json['ritual_steps'] as List?)
              ?.map((e) => RitualStep.fromJson(e))
              .toList() ??
          [],
      ambientAudio: json['ambient_audio'] != null
          ? AmbientAudio.fromJson(json['ambient_audio'])
          : null,
      recipes:
          (json['recipes'] as List?)
              ?.map((e) => FestivalRecipe.fromJson(e))
              .toList() ??
          [],
      dressGuide: json['dress_guide'] != null
          ? DressGuide.fromJson(json['dress_guide'])
          : null,
      notifications: json['notifications'] != null
          ? NotificationTemplates.fromJson(json['notifications'])
          : null,
      playlistLinks:
          (json['playlist_links'] as List?)
              ?.map((e) => PlaylistLink.fromJson(e))
              .toList() ??
          [],
      mantras:
          (json['mantras'] as List?)
              ?.map((e) => MantraModel.fromJson(e))
              .toList() ??
          [],
      quotes:
          (json['quotes'] as List?)?.map((e) => e.toString()).toList() ?? [],
      greetings:
          (json['greetings'] as List?)?.map((e) => e.toString()).toList() ?? [],
      images:
          (json['images'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'location': location,
      'description': description,
      'date': date?.toIso8601String(),
      if (nextDate != null) 'next_date': {'date': nextDate!.toIso8601String()},
      'vibes': vibes.map((e) => e.toJson()).toList(),
      'category': category?.toJson(),
      'image': image?.toJson(),
      'thumbnail': thumbnail,
      'wiki_link': wikiLink,
      if (lottieOverlay != null) 'lottie_overlay': lottieOverlay!.toJson(),
      'gallery': gallery.map((e) => e.toJson()).toList(),
      'priority': priority,
      'tags': tags.map((e) => e.toJson()).toList(),
      'facts': facts.map((e) => e.toJson()).toList(),
      'dates': dates.map((e) => e.toJson()).toList(),
      if (muhurat != null) 'muhurat': muhurat!.toJson(),
      'ritual_steps': ritualSteps.map((e) => e.toJson()).toList(),
      if (ambientAudio != null) 'ambient_audio': ambientAudio!.toJson(),
      'recipes': recipes.map((e) => e.toJson()).toList(),
      if (dressGuide != null) 'dress_guide': dressGuide!.toJson(),
      if (notifications != null) 'notifications': notifications!.toJson(),
      'playlist_links': playlistLinks.map((e) => e.toJson()).toList(),
      'mantras': mantras.map((e) => e.toJson()).toList(),
      'quotes': quotes,
      'greetings': greetings,
      'images': images,
    };
  }
}

class EventDate {
  final int year;
  final DateTime? date;

  EventDate({required this.year, this.date});

  factory EventDate.fromJson(Map<String, dynamic> json) {
    return EventDate(
      year: json['year'] ?? 0,
      date: json['date'] != null ? DateTime.tryParse(json['date']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {'year': year, 'date': date?.toIso8601String()};
  }
}

class HistoryFact {
  final int year;
  final String fact;
  final String source;

  HistoryFact({required this.year, required this.fact, required this.source});

  factory HistoryFact.fromJson(Map<String, dynamic> json) {
    return HistoryFact(
      year: json['year'] ?? 0,
      fact: json['fact'] ?? '',
      source: json['source'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'year': year, 'fact': fact, 'source': source};
  }
}

class HistoryItem {
  final String id;
  final String slug;
  final String title;
  final List<HistoryFact> facts;

  HistoryItem({
    required this.id,
    required this.slug,
    required this.title,
    required this.facts,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      id: json['id'] ?? '',
      slug: json['slug'] ?? '',
      title: json['title'] ?? '',
      facts:
          (json['facts'] as List?)
              ?.map((e) => HistoryFact.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'facts': facts.map((e) => e.toJson()).toList(),
    };
  }
}

class LottieOverlayModel {
  final String id;
  final String title;
  final String filename;
  final String s3Key;

  LottieOverlayModel({
    required this.id,
    required this.title,
    required this.filename,
    required this.s3Key,
  });

  factory LottieOverlayModel.fromJson(Map<String, dynamic> json) {
    return LottieOverlayModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      filename: json['filename'] ?? '',
      s3Key: json['s3_key'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'title': title, 'filename': filename, 's3_key': s3Key};
  }
}

// ── Rich Event Sub-Models ─────────────────────────────────────────────────────

class EventMuhurat {
  final String pujaTime;
  final String type;
  final String description;

  EventMuhurat({this.pujaTime = '', this.type = '', this.description = ''});

  factory EventMuhurat.fromJson(Map<String, dynamic> json) => EventMuhurat(
    pujaTime: json['puja_time'] ?? '',
    type: json['type'] ?? '',
    description: json['description'] ?? '',
  );

  Map<String, dynamic> toJson() => {
    'puja_time': pujaTime,
    'type': type,
    'description': description,
  };
}

class RitualStep {
  final int order;
  final String title;
  final String description;
  final String timing;
  final List<String> itemsNeeded;

  RitualStep({
    required this.order,
    required this.title,
    this.description = '',
    this.timing = '',
    this.itemsNeeded = const [],
  });

  factory RitualStep.fromJson(Map<String, dynamic> json) => RitualStep(
    order: json['order'] ?? 0,
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    timing: json['timing'] ?? '',
    itemsNeeded: List<String>.from(json['items_needed'] ?? []),
  );

  Map<String, dynamic> toJson() => {
    'order': order,
    'title': title,
    'description': description,
    'timing': timing,
    'items_needed': itemsNeeded,
  };
}

class AmbientAudio {
  final String id;
  final String slug;
  final String filename;
  final String s3Key;
  final int durationSeconds;
  final String title;
  final bool isLoopable;
  final int fadeInMs;
  final int fadeOutMs;
  final double defaultVolume;
  final String mood;

  AmbientAudio({
    this.id = '',
    this.slug = '',
    this.filename = '',
    this.s3Key = '',
    this.durationSeconds = 0,
    this.title = '',
    this.isLoopable = false,
    this.fadeInMs = 0,
    this.fadeOutMs = 0,
    this.defaultVolume = 1.0,
    this.mood = '',
  });

  factory AmbientAudio.fromJson(Map<String, dynamic> json) => AmbientAudio(
    id: json['id'] ?? '',
    slug: json['slug'] ?? '',
    filename: json['filename'] ?? '',
    s3Key: json['s3_key'] ?? '',
    durationSeconds: json['duration_seconds'] ?? 0,
    title: json['title'] ?? '',
    isLoopable: json['is_loopable'] ?? false,
    fadeInMs: json['fade_in_ms'] ?? 0,
    fadeOutMs: json['fade_out_ms'] ?? 0,
    defaultVolume: (json['default_volume'] ?? 1.0).toDouble(),
    mood: json['mood'] ?? '',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'slug': slug,
    'filename': filename,
    's3_key': s3Key,
    'duration_seconds': durationSeconds,
    'title': title,
    'is_loopable': isLoopable,
    'fade_in_ms': fadeInMs,
    'fade_out_ms': fadeOutMs,
    'default_volume': defaultVolume,
    'mood': mood,
  };
}

class FestivalRecipe {
  final String name;
  final String description;
  final List<String> ingredients;
  final List<String> steps;

  FestivalRecipe({
    required this.name,
    this.description = '',
    this.ingredients = const [],
    this.steps = const [],
  });

  factory FestivalRecipe.fromJson(Map<String, dynamic> json) => FestivalRecipe(
    name: json['name'] ?? '',
    description: json['description'] ?? '',
    ingredients: List<String>.from(json['ingredients'] ?? []),
    steps: List<String>.from(json['steps'] ?? []),
  );

  Map<String, dynamic> toJson() => {
    'name': name,
    'description': description,
    'ingredients': ingredients,
    'steps': steps,
  };
}

class DressGuide {
  final String description;
  final List<String> colors;

  DressGuide({this.description = '', this.colors = const []});

  factory DressGuide.fromJson(Map<String, dynamic> json) => DressGuide(
    description: json['description'] ?? '',
    colors: List<String>.from(json['colors'] ?? []),
  );

  Map<String, dynamic> toJson() => {
    'description': description,
    'colors': colors,
  };
}

class PlaylistLink {
  final String platform;
  final String url;
  final String title;

  PlaylistLink({
    required this.platform,
    required this.url,
    required this.title,
  });

  factory PlaylistLink.fromJson(Map<String, dynamic> json) => PlaylistLink(
    platform: json['platform'] ?? '',
    url: json['url'] ?? '',
    title: json['title'] ?? '',
  );

  Map<String, dynamic> toJson() => {
    'platform': platform,
    'url': url,
    'title': title,
  };
}

class NotificationTemplates {
  final String discovery;
  final String countdown;
  final String eve;
  final String dayOf;

  NotificationTemplates({
    this.discovery = '',
    this.countdown = '',
    this.eve = '',
    this.dayOf = '',
  });

  factory NotificationTemplates.fromJson(Map<String, dynamic> json) {
    return NotificationTemplates(
      discovery: json['discovery'] ?? '',
      countdown: json['countdown'] ?? '',
      eve: json['eve'] ?? '',
      dayOf: json['day_of'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'discovery': discovery,
      'countdown': countdown,
      'eve': eve,
      'day_of': dayOf,
    };
  }
}
