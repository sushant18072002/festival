import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../data/providers/data_repository.dart';
import '../../data/models/gamification_config_model.dart';
import '../../data/services/asset_service.dart';

class ProfileController extends GetxController {
  final _storage = GetStorage();

  final karmaPoints = 0.obs;
  final currentStreak = 0.obs;
  final selectedAvatar = 'assets/icon/avatar_tier1_1.png'.obs;
  final userName = ''.obs;

  // Added for v2 Profile Stats
  final festivalsExplored = 0.obs;
  final imagesDownloaded = 0.obs;
  final imagesShared = 0.obs;

  final gamificationConfig = Rx<GamificationConfigModel?>(null);

  @override
  void onInit() {
    super.onInit();
    karmaPoints.value = _storage.read<int>('karma_points') ?? 0;
    selectedAvatar.value =
        _storage.read<String>('selected_avatar') ??
        'assets/icon/avatar_tier1_1.png';
    userName.value = _storage.read<String>('user_name') ?? '';

    // Real values — default to 0, incremented from action sites
    festivalsExplored.value = _storage.read<int>('festivals_explored') ?? 0;
    imagesDownloaded.value = _storage.read<int>('images_downloaded') ?? 0;
    imagesShared.value = _storage.read<int>('images_shared') ?? 0;

    _checkStreak();
    _trackOpenTime();

    final repo = Get.find<DataRepository>();
    repo.getGamificationConfig(repo.currentLang.value).then((config) {
      if (config != null) gamificationConfig.value = config;
    });
  }

  void _checkStreak() {
    final now = DateTime.now();
    final todayStr =
        "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
    final lastOpen = _storage.read<String>('last_open_date');
    var streak = _storage.read<int>('current_streak') ?? 0;

    if (lastOpen != todayStr) {
      if (lastOpen != null) {
        final lastDate = DateTime.parse(lastOpen);
        final today = DateTime.parse(todayStr);
        final diff = today.difference(lastDate).inDays;

        if (diff == 1) {
          streak += 1; // Kept the streak alive
        } else {
          streak = 1; // Streak broken
        }
      } else {
        streak = 1; // First open ever
      }

      _storage.write('last_open_date', todayStr);
      _storage.write('current_streak', streak);
    }

    currentStreak.value = streak;
  }

  void addKarma(int points, [String? reason]) {
    final oldRank = rankTitle;
    karmaPoints.value += points;
    _storage.write('karma_points', karmaPoints.value);

    // Detect Level Up (Rank Transition)
    if (rankTitle != oldRank) {
      AssetService.to.playSFX(GlobalAsset.levelUp);
    }
  }

  // ── Stat Increment Methods ──────────────────────────────────────────────────

  void incrementFestivalViewed() {
    festivalsExplored.value++;
    _storage.write('festivals_explored', festivalsExplored.value);
  }

  void incrementDownload() {
    imagesDownloaded.value++;
    _storage.write('images_downloaded', imagesDownloaded.value);
  }

  void incrementShare() {
    imagesShared.value++;
    _storage.write('images_shared', imagesShared.value);
  }

  // ── Open Time Tracking ─────────────────────────────────────────────────────

  void _trackOpenTime() {
    final hour = DateTime.now().hour;
    if (hour >= 23 || hour < 1) {
      _storage.write('opened_late', true);
    }
    if (hour >= 4 && hour < 6) {
      _storage.write('opened_early', true);
    }
  }

  void setAvatar(String path) {
    selectedAvatar.value = path;
    _storage.write('selected_avatar', path);
  }

  // ── Gamification Computed Properties (Reactive to Config) ───────────────────

  Map<String, List<String>> get avatarGroups {
    final conf = gamificationConfig.value;
    if (conf == null || conf.avatarTiers.isEmpty) {
      return {
        '🌱 Seedling (Starter)|0': List.generate(
          5,
          (i) => 'assets/icon/avatar_tier1_${i + 1}.png',
        ),
        '🕯️ Diya Lighter|30': List.generate(
          5,
          (i) => 'assets/icon/avatar_tier2_${i + 1}.png',
        ),
        '🌸 Festive Guide|250': List.generate(
          5,
          (i) => 'assets/icon/avatar_tier3_${i + 1}.png',
        ),
        '🌳 Vibe Seeker|1000': List.generate(
          5,
          (i) => 'assets/icon/avatar_tier4_${i + 1}.png',
        ),
        '✨ Utsav Master|5000': List.generate(
          5,
          (i) => 'assets/icon/avatar_tier5_${i + 1}.png',
        ),
      };
    }

    final map = <String, List<String>>{};
    for (var tier in conf.avatarTiers) {
      final title = '${tier.name}|${tier.baseKarma}';
      map[title] = tier.paths;
    }
    return map;
  }

  String get rankTitle {
    // Fallback logic
    final karma = karmaPoints.value;
    if (karma >= 25000) return '💎 Utsav Legend';
    if (karma >= 13000) return '🔥 Eternal Flame';
    if (karma >= 8000) return '🌟 Celestial Guide';
    if (karma >= 5000) return '👑 Festival Monarch';
    if (karma >= 3000) return '🦚 Peacock Master';
    if (karma >= 1750) return '🏛️ Culture Scholar';
    if (karma >= 1000) return '🔱 Heritage Guardian';
    if (karma >= 500) return '🌸 Tradition Keeper';
    if (karma >= 250) return '🪔 Festival Enthusiast';
    if (karma >= 100) return '🎨 Rangoli Maker';
    if (karma >= 30) return '🕯️ Diya Lighter';
    return '🌱 Curious Seedling';
  }

  double get percentageToNextRank {
    final karma = karmaPoints.value;
    int currentTierBase = 0;
    int nextTierBase = 30;

    if (karma >= 25000) {
      return 1.0;
    } else if (karma >= 13000) {
      currentTierBase = 13000;
      nextTierBase = 25000;
    } else if (karma >= 8000) {
      currentTierBase = 8000;
      nextTierBase = 13000;
    } else if (karma >= 5000) {
      currentTierBase = 5000;
      nextTierBase = 8000;
    } else if (karma >= 3000) {
      currentTierBase = 3000;
      nextTierBase = 5000;
    } else if (karma >= 1750) {
      currentTierBase = 1750;
      nextTierBase = 3000;
    } else if (karma >= 1000) {
      currentTierBase = 1000;
      nextTierBase = 1750;
    } else if (karma >= 500) {
      currentTierBase = 500;
      nextTierBase = 1000;
    } else if (karma >= 250) {
      currentTierBase = 250;
      nextTierBase = 500;
    } else if (karma >= 100) {
      currentTierBase = 100;
      nextTierBase = 250;
    } else if (karma >= 30) {
      currentTierBase = 30;
      nextTierBase = 100;
    }

    return (karma - currentTierBase) / (nextTierBase - currentTierBase);
  }

  int get karmaToNextRank {
    final karma = karmaPoints.value;
    if (karma >= 25000) return 0;
    if (karma >= 13000) return 25000 - karma;
    if (karma >= 8000) return 13000 - karma;
    if (karma >= 5000) return 8000 - karma;
    if (karma >= 3000) return 5000 - karma;
    if (karma >= 1750) return 3000 - karma;
    if (karma >= 1000) return 1750 - karma;
    if (karma >= 500) return 1000 - karma;
    if (karma >= 250) return 500 - karma;
    if (karma >= 100) return 250 - karma;
    if (karma >= 30) return 100 - karma;
    return 30 - karma;
  }

  List<String> get earnedBadges {
    final badges = <String>['Beginner Seeker'];
    if (karmaPoints.value >= 50) badges.add('Festival Explorer');
    if (karmaPoints.value >= 150) badges.add('Vibe Master');
    if (karmaPoints.value >= 500) badges.add('Cultural Guru');
    // Social activity badges
    if (imagesShared.value >= 10) badges.add('Social Butterfly');
    // Time-based badges
    if (_storage.read<bool>('opened_late') == true) badges.add('Night Owl');
    if (_storage.read<bool>('opened_early') == true) badges.add('Early Bird');
    return badges;
  }

  List<Map<String, dynamic>> get allTrophies {
    final conf = gamificationConfig.value;
    final earned = earnedBadges;

    if (conf == null || conf.trophies.isEmpty) {
      return [
        {
          'name': 'Beginner Seeker',
          'icon': '🌱',
          'desc': 'Joined Utsav',
          'earned': earned.contains('Beginner Seeker'),
        },
        {
          'name': 'Festival Explorer',
          'icon': '🗺️',
          'desc': 'Explore 5 festivals',
          'earned': earned.contains('Festival Explorer'),
        },
        {
          'name': 'Vibe Master',
          'icon': '✨',
          'desc': 'Discover 10 vibes',
          'earned': earned.contains('Vibe Master'),
        },
        {
          'name': 'Cultural Guru',
          'icon': '📚',
          'desc': 'Reach 500 Karma',
          'earned': earned.contains('Cultural Guru'),
        },
        {
          'name': 'Social Butterfly',
          'icon': '🦋',
          'desc': 'Share 10 images',
          'earned': earned.contains('Social Butterfly'),
        },
        {
          'name': 'Unbreakable',
          'icon': '🔥',
          'desc': '30-day streak',
          'earned': earned.contains('Unbreakable'),
        },
        {
          'name': 'Night Owl',
          'icon': '🦉',
          'desc': 'Explore at midnight',
          'earned': earned.contains('Night Owl'),
        },
        {
          'name': 'Early Bird',
          'icon': '🌅',
          'desc': 'Explore at dawn',
          'earned': earned.contains('Early Bird'),
        },
      ];
    }

    return conf.trophies.map((t) {
      bool isEarned = false;
      switch (t.unlockRuleType.toLowerCase()) {
        case 'karma':
          isEarned = karmaPoints.value >= t.unlockThreshold;
          break;
        case 'share':
          isEarned = imagesShared.value >= t.unlockThreshold;
          break;
        case 'explore':
          isEarned = festivalsExplored.value >= t.unlockThreshold;
          break;
        case 'streak':
          isEarned = currentStreak.value >= t.unlockThreshold;
          break;
        case 'download':
          isEarned = imagesDownloaded.value >= t.unlockThreshold;
          break;
        case 'time':
          if (t.name.toLowerCase().contains('owl')) {
            isEarned = _storage.read<bool>('opened_late') == true;
          }
          if (t.name.toLowerCase().contains('bird')) {
            isEarned = _storage.read<bool>('opened_early') == true;
          }
          break;
        default:
          isEarned = earned.contains(t.name);
      }
      return {
        'name': t.name,
        'icon': t.icon,
        'desc': t.description,
        'earned': isEarned,
      };
    }).toList();
  }
}
