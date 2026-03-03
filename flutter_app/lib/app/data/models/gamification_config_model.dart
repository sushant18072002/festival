class GamificationConfigModel {
  final int version;
  final List<AvatarTier> avatarTiers;
  final List<TrophyConfig> trophies;

  GamificationConfigModel({
    required this.version,
    this.avatarTiers = const [],
    this.trophies = const [],
  });

  factory GamificationConfigModel.fromJson(Map<String, dynamic> json) {
    return GamificationConfigModel(
      version: json['version'] ?? 1,
      avatarTiers:
          (json['avatarTiers'] as List?)
              ?.map((t) => AvatarTier.fromJson(t))
              .toList() ??
          [],
      trophies:
          (json['trophies'] as List?)
              ?.map((t) => TrophyConfig.fromJson(t))
              .toList() ??
          [],
    );
  }
}

class AvatarTier {
  final String name;
  final int baseKarma;
  final List<String> paths;

  AvatarTier({
    required this.name,
    required this.baseKarma,
    this.paths = const [],
  });

  factory AvatarTier.fromJson(Map<String, dynamic> json) {
    return AvatarTier(
      name: json['name'] ?? '',
      baseKarma: json['baseKarma'] ?? json['base_karma'] ?? 0,
      paths: List<String>.from(json['paths'] ?? []),
    );
  }
}

class TrophyConfig {
  final String name;
  final String description;
  final String icon;
  final String unlockRuleType;
  final int unlockThreshold;

  TrophyConfig({
    required this.name,
    required this.description,
    required this.icon,
    required this.unlockRuleType,
    required this.unlockThreshold,
  });

  factory TrophyConfig.fromJson(Map<String, dynamic> json) {
    return TrophyConfig(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '',
      unlockRuleType:
          json['unlockRuleType'] ?? json['unlock_rule_type'] ?? 'karma',
      unlockThreshold:
          json['unlockThreshold'] ?? json['unlock_threshold'] ?? 100,
    );
  }
}
