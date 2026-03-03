class QuizModel {
  final String id;
  final String title;
  final String slug;
  final String description;
  final int karmaReward;
  final bool isActive;
  final List<QuizQuestion> questions;
  final List<QuizResultNode> results;

  QuizModel({
    required this.id,
    required this.title,
    required this.slug,
    this.description = '',
    this.karmaReward = 0,
    this.isActive = true,
    this.questions = const [],
    this.results = const [],
  });

  factory QuizModel.fromJson(Map<String, dynamic> json) {
    return QuizModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'] ?? '',
      karmaReward: json['karmaReward'] ?? json['karma_reward'] ?? 0,
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      questions:
          (json['questions'] as List?)
              ?.map((q) => QuizQuestion.fromJson(q))
              .toList() ??
          [],
      results:
          (json['results'] as List?)
              ?.map((r) => QuizResultNode.fromJson(r))
              .toList() ??
          [],
    );
  }
}

class QuizQuestion {
  final String question;
  final String emoji;
  final List<QuizOption> options;

  QuizQuestion({
    required this.question,
    this.emoji = '',
    this.options = const [],
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      question: json['question'] ?? '',
      emoji: json['emoji'] ?? '',
      options:
          (json['options'] as List?)
              ?.map((o) => QuizOption.fromJson(o))
              .toList() ??
          [],
    );
  }
}

class QuizOption {
  final String label;
  final Map<String, int> scores;

  QuizOption({required this.label, this.scores = const {}});

  factory QuizOption.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> rawScores = json['scores'] ?? {};
    return QuizOption(
      label: json['label'] ?? '',
      scores: rawScores.map(
        (key, value) => MapEntry(
          key,
          value is int ? value : int.tryParse(value.toString()) ?? 0,
        ),
      ),
    );
  }
}

class QuizResultNode {
  final String code;
  final String name;
  final String description;
  final String emoji;
  final String primaryColor;
  final String secondaryColor;
  final String personality;

  QuizResultNode({
    required this.code,
    required this.name,
    this.description = '',
    this.emoji = '',
    this.primaryColor = '0xFF673AB7',
    this.secondaryColor = '0xFF9C27B0',
    this.personality = '',
  });

  factory QuizResultNode.fromJson(Map<String, dynamic> json) {
    return QuizResultNode(
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      emoji: json['emoji'] ?? '',
      primaryColor:
          json['primaryColor'] ?? json['primary_color'] ?? '0xFF673AB7',
      secondaryColor:
          json['secondaryColor'] ?? json['secondary_color'] ?? '0xFF9C27B0',
      personality: json['personality'] ?? '',
    );
  }
}
