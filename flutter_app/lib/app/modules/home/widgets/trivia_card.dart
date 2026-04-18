import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import '../../profile/profile_controller.dart';
import '../../../data/services/analytics_service.dart';
import '../../../data/models/trivia_model.dart';
import '../../../data/providers/data_repository.dart';
import '../../../data/services/asset_service.dart';
import '../home_controller.dart';

class TriviaCard extends StatefulWidget {
  final bool isSecondary;
  final TriviaModel? trivia;
  const TriviaCard({super.key, this.isSecondary = false, this.trivia});

  @override
  State<TriviaCard> createState() => _TriviaCardState();
}

class _TriviaCardState extends State<TriviaCard> {
  late Future<TriviaModel?> _triviaFuture;
  TriviaModel? _trivia;
  final _storage = GetStorage();

  int? selectedIndex;
  bool isAnswered = false;
  bool _isPlaying = false; // whether expanded quiz mode is showing
  bool _isDark = true; // set during build, used by helper methods

  @override
  void initState() {
    super.initState();
    if (widget.trivia != null) {
      _triviaFuture = Future.value(widget.trivia);
    } else {
      final repo = Get.find<DataRepository>();
      _triviaFuture = repo.getTrivia(repo.currentLang.value).then((trivias) {
        if (trivias == null || trivias.isEmpty) return null;
        return trivias.first;
      });
    }
  }

  void _handleAnswer(int index) {
    if (isAnswered || _trivia == null) return;

    Get.find<HomeController>().recordActivity('trivia');
    HapticFeedback.mediumImpact();
    setState(() {
      selectedIndex = index;
      isAnswered = true;
    });

    final bool isCorrect = index == _trivia!.correctAnswerIndex;
    final int reward = _trivia!.karmaReward > 0 ? _trivia!.karmaReward : 10;

    final alreadyAnswered =
        _storage.read<bool>('trivia_answered_${_trivia!.id}') ?? false;

    if (isCorrect) {
      AssetService.to.playSFX(GlobalAsset.success);
      if (!alreadyAnswered && Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().addKarma(reward, 'Trivia Completed');
        _storage.write('trivia_answered_${_trivia!.id}', true);
      }
      Get.snackbar(
        'trivia_correct'.tr,
        alreadyAnswered
            ? 'trivia_already_answered'.tr
            : '+$reward ${"karma_earned".tr}',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.primaryAdaptive(context),
        colorText: (Theme.of(context).brightness == Brightness.dark) ? Colors.black : Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
    } else {
      AssetService.to.playSFX(GlobalAsset.error);
      Get.snackbar(
        'trivia_wrong'.tr,
        '${'correct_answer_is'.tr} ${_trivia!.options[_trivia!.correctAnswerIndex]}',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.surfaceGlass(context),
        colorText: AppColors.textAdaptive(context),
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
    }

    AnalyticsService.instance.logTriviaAnswered(isCorrect);
  }

  @override
  Widget build(BuildContext context) {
    _isDark = Theme.of(context).brightness == Brightness.dark;
    final isDark = _isDark;
    final adaptivePrimary = AppColors.primaryAdaptive(context);
    final cardBg = isDark ? AppColors.surfaceGlass(context) : const Color(0xFFF3EFFC);
    
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: GlassContainer(
        borderRadius: BorderRadius.circular(24),
        color: cardBg,
        child: FutureBuilder<TriviaModel?>(
          future: _triviaFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Center(
                  child: CircularProgressIndicator(color: adaptivePrimary),
                ),
              );
            }
            if (!snapshot.hasData || snapshot.data == null) {
              return const SizedBox.shrink();
            }

            _trivia = snapshot.data;
            final reward = _trivia!.karmaReward > 0 ? _trivia!.karmaReward : 10;

            return Opacity(
              opacity: widget.isSecondary ? 0.8 : 1.0,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
              child: Stack(
                children: [
                  // Background decorative lightbulb
                  Positioned(
                    top: -10,
                    right: -10,
                    child:
                        Icon(
                              LucideIcons.lightbulb,
                              size: 90,
                              color: adaptivePrimary.withValues(alpha: isDark ? 0.05 : 0.08),
                            )
                            .animate(onPlay: (c) => c.repeat(reverse: true))
                            .rotate(
                              duration: const Duration(seconds: 8),
                              begin: -0.05,
                              end: 0.05,
                            ),
                  ),
                  // Content
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header row
                        Row(
                          children: [
                            Icon(
                              LucideIcons.brain,
                              color: adaptivePrimary,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'daily_trivia'.tr,
                              style: AppTextStyles.titleMedium(context).copyWith(
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF1A0B2E),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Spacer(),
                            // Karma badge or CULTURE QUIZ label
                            if (isAnswered)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      selectedIndex ==
                                          _trivia!.correctAnswerIndex
                                      ? AppColors.success.withValues(alpha: 0.2)
                                      : AppColors.error.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  selectedIndex == _trivia!.correctAnswerIndex
                                      ? '+$reward ${"karma".tr}'
                                      : 'try_tomorrow'.tr,
                                  style: AppTextStyles.labelSmall(context).copyWith(
                                    color:
                                        selectedIndex ==
                                            _trivia!.correctAnswerIndex
                                        ? AppColors.success
                                        : AppColors.error,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ).animate().fade().scale()
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: adaptivePrimary.withValues(
                                    alpha: 0.1,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: adaptivePrimary.withValues(
                                      alpha: 0.3,
                                    ),
                                  ),
                                ),
                                child: Text(
                                  'culture_quiz'.tr,
                                  style: AppTextStyles.labelSmall(context).copyWith(
                                    color: adaptivePrimary,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),
                        // Question text
                        Text(
                          _trivia!.question,
                          style: AppTextStyles.bodyLarge(context).copyWith(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.85)
                                : const Color(0xFF251042),
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.lg),
                        // Expanded answer options OR single Play Now button
                        if (_isPlaying) ...[
                          ...List.generate(_trivia!.options.length, (index) {
                            return _buildOptionTile(index);
                          }),
                        ] else ...[
                          // "Play Now" button
                          GestureDetector(
                            onTap: () {
                              AssetService.to.playSFX(GlobalAsset.tick);
                              setState(() => _isPlaying = true);
                            },
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: adaptivePrimary.withValues(
                                  alpha: 0.08,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: adaptivePrimary.withValues(
                                    alpha: isDark ? 0.35 : 0.6,
                                  ),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'play_now'.tr,
                                    style: AppTextStyles.labelLarge(context).copyWith(
                                      color: adaptivePrimary,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Icon(
                                    LucideIcons.arrowRight,
                                    color: adaptivePrimary,
                                    size: 16,
                                  ),
                                ],
                              ),
                            ),
                          ).animate().fade(duration: 500.ms),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
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
    Color borderColor = _isDark
        ? Colors.white.withValues(alpha: 0.1)
        : const Color(0xFF7C3AED).withValues(alpha: 0.15);
    Color textColor = _isDark ? Colors.white70 : const Color(0xFF3D1F5C);

    if (isAnswered) {
      if (isCorrect) {
        backgroundColor = AppColors.success.withValues(alpha: 0.15);
        borderColor = AppColors.success;
        textColor = _isDark ? Colors.white : const Color(0xFF1A0B2E);
      } else if (isSelected && !isCorrect) {
        backgroundColor = AppColors.error.withValues(alpha: 0.15);
        borderColor = AppColors.error;
        textColor = _isDark ? Colors.white : const Color(0xFF1A0B2E);
      }
    } else if (isSelected) {
      backgroundColor = _isDark
          ? Colors.white.withValues(alpha: 0.1)
          : const Color(0xFF7C3AED).withValues(alpha: 0.1);
      borderColor = _isDark ? Colors.white : const Color(0xFF7C3AED);
      textColor = _isDark ? Colors.white : const Color(0xFF1A0B2E);
    }

    return GestureDetector(
      onTap: () => _handleAnswer(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color:
              backgroundColor ??
              (_isDark
                  ? Colors.black.withValues(alpha: 0.2)
                  : Colors.white.withValues(alpha: 0.8)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                _trivia!.options[index],
                style: AppTextStyles.bodyMedium(context).copyWith(color: textColor),
              ),
            ),
            if (isAnswered && isCorrect)
              const Icon(
                LucideIcons.circleCheck,
                color: AppColors.success,
                size: 18,
              ).animate().scale(delay: 200.ms),
            if (isAnswered && isSelected && !isCorrect)
              Icon(
                LucideIcons.circleX,
                color: AppColors.error,
                size: 18,
              ).animate().scale(delay: 200.ms),
          ],
        ),
      ),
    );
  }
}
