import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import '../../profile/profile_controller.dart';
import '../../../data/services/analytics_service.dart';
import '../../../data/providers/data_repository.dart';
import '../../../data/models/trivia_model.dart';

class TriviaCard extends StatefulWidget {
  const TriviaCard({super.key});

  @override
  State<TriviaCard> createState() => _TriviaCardState();
}

class _TriviaCardState extends State<TriviaCard> {
  late Future<TriviaModel?> _triviaFuture;
  TriviaModel? _trivia;
  final _storage = GetStorage();

  int? selectedIndex;
  bool isAnswered = false;

  @override
  void initState() {
    super.initState();
    final repo = Get.find<DataRepository>();
    _triviaFuture = repo.getTrivia(repo.currentLang.value).then((trivias) {
      if (trivias == null || trivias.isEmpty) return null;
      return trivias.first;
    });
  }

  void _handleAnswer(int index) {
    if (isAnswered || _trivia == null) return;

    HapticFeedback.mediumImpact();
    setState(() {
      selectedIndex = index;
      isAnswered = true;
    });

    final bool isCorrect = index == _trivia!.correctAnswerIndex;
    final int reward = _trivia!.karmaReward > 0 ? _trivia!.karmaReward : 10;

    // Check if already answered today
    final alreadyAnswered =
        _storage.read<bool>('trivia_answered_${_trivia!.id}') ?? false;

    if (isCorrect) {
      if (!alreadyAnswered && Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().addKarma(reward, 'Trivia Completed');
        _storage.write('trivia_answered_${_trivia!.id}', true);
      }
      Get.snackbar(
        'Correct! 🎉',
        alreadyAnswered
            ? 'You already answered this trivia correctly.'
            : '+$reward Karma earned. Keep learning!',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.primary,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
    } else {
      Get.snackbar(
        'Almost!',
        'The correct answer is ${_trivia!.options[_trivia!.correctAnswerIndex]}. Keep learning!',
        snackPosition: SnackPosition.TOP,
        backgroundColor: Colors.black87,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
    }

    AnalyticsService.instance.logTriviaAnswered(isCorrect);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: GlassContainer(
        borderRadius: BorderRadius.circular(24),
        padding: const EdgeInsets.all(AppSpacing.lg),
        color: AppColors.surfaceGlass,
        child: FutureBuilder<TriviaModel?>(
          future: _triviaFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              );
            }
            if (!snapshot.hasData || snapshot.data == null) {
              return Center(
                child: Text(
                  'No trivia available today.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white70,
                  ),
                ),
              );
            }

            _trivia = snapshot.data;
            final reward = _trivia!.karmaReward > 0 ? _trivia!.karmaReward : 10;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.school_rounded,
                      color: Colors.blueAccent,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Daily Cultural Trivia',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: Colors.blueAccent,
                      ),
                    ),
                    const Spacer(),
                    if (isAnswered)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: selectedIndex == _trivia!.correctAnswerIndex
                              ? Colors.green.withValues(alpha: 0.2)
                              : Colors.red.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          selectedIndex == _trivia!.correctAnswerIndex
                              ? '+$reward Karma'
                              : 'Try Tomorrow',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: selectedIndex == _trivia!.correctAnswerIndex
                                ? Colors.green
                                : Colors.redAccent,
                          ),
                        ),
                      ).animate().fade().scale(),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  _trivia!.question,
                  style: AppTextStyles.titleLarge.copyWith(
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                ...List.generate(_trivia!.options.length, (index) {
                  return _buildOptionTile(index);
                }),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildOptionTile(int index) {
    if (_trivia == null) return const SizedBox.shrink();

    bool isSelected = selectedIndex == index;
    bool isCorrect = index == _trivia!.correctAnswerIndex;

    Color? backgroundColor;
    Color borderColor = Colors.white.withValues(alpha: 0.1);
    Color textColor = Colors.white70;

    if (isAnswered) {
      if (isCorrect) {
        backgroundColor = Colors.green.withValues(alpha: 0.2);
        borderColor = Colors.green;
        textColor = Colors.white;
      } else if (isSelected && !isCorrect) {
        backgroundColor = Colors.red.withValues(alpha: 0.2);
        borderColor = Colors.redAccent;
        textColor = Colors.white;
      }
    } else if (isSelected) {
      backgroundColor = Colors.white.withValues(alpha: 0.1);
      borderColor = Colors.white;
      textColor = Colors.white;
    }

    return GestureDetector(
      onTap: () => _handleAnswer(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: backgroundColor ?? Colors.black.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                _trivia!.options[index],
                style: AppTextStyles.bodyLarge.copyWith(color: textColor),
              ),
            ),
            if (isAnswered && isCorrect)
              const Icon(
                Icons.check_circle_rounded,
                color: Colors.green,
                size: 20,
              ).animate().scale(delay: 200.ms),
            if (isAnswered && isSelected && !isCorrect)
              const Icon(
                Icons.cancel_rounded,
                color: Colors.redAccent,
                size: 20,
              ).animate().scale(delay: 200.ms),
          ],
        ),
      ),
    );
  }
}
