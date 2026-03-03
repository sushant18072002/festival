class TriviaModel {
  final String id;
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final int karmaReward;
  final List<String> tags;

  TriviaModel({
    required this.id,
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    this.karmaReward = 10,
    this.tags = const [],
  });

  factory TriviaModel.fromJson(Map<String, dynamic> json) {
    return TriviaModel(
      id: json['_id'] ?? json['id'] ?? '',
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswerIndex:
          json['correctAnswerIndex'] ?? json['correct_answer_index'] ?? 0,
      karmaReward: json['karmaReward'] ?? json['karma_reward'] ?? 10,
      tags: List<String>.from(json['tags'] ?? []),
    );
  }
}
