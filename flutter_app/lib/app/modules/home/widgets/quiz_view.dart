import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/neo_scaffold.dart';
import '../../../widgets/glass_container.dart';
import '../../profile/profile_controller.dart';
import '../../../../app/data/providers/data_repository.dart';
import '../../../../app/data/models/quiz_model.dart';
import '../../../../app/data/services/asset_service.dart';
import '../../../../app/widgets/smart_lottie.dart';

class QuizView extends StatefulWidget {
  const QuizView({super.key});

  @override
  State<QuizView> createState() => _QuizViewState();
}

class _QuizViewState extends State<QuizView> {
  final _storage = GetStorage();
  int _currentIndex = 0;
  final Map<String, int> _festivalScores = {};
  bool _isFinished = false;
  QuizResultNode? _result;
  late Future<QuizModel?> _quizFuture;
  QuizModel? _quiz;

  @override
  void initState() {
    super.initState();
    final repo = Get.find<DataRepository>();
    
    // Preference: Passed argument -> Remote fetch -> first active
    if (Get.arguments is QuizModel) {
      _quizFuture = Future.value(Get.arguments);
    } else {
      _quizFuture = repo.getQuizzes(repo.currentLang.value).then((quizzes) {
        if (quizzes == null || quizzes.isEmpty) return null;
        return quizzes.firstWhere((q) => q.isActive, orElse: () => quizzes.first);
      });
    }
  }

  void _handleOptionTap(QuizOption option) {
    HapticFeedback.lightImpact();

    // Accumulate weighted scores
    option.scores.forEach((festival, points) {
      _festivalScores[festival] = (_festivalScores[festival] ?? 0) + points;
    });

    setState(() {
      if (_quiz != null && _currentIndex < _quiz!.questions.length - 1) {
        _currentIndex++;
      } else {
        _isFinished = true;
        _result = _computeResult();
        _grantKarma();
      }
    });
  }

  QuizResultNode? _computeResult() {
    if (_quiz == null || _quiz!.results.isEmpty) return null;
    if (_festivalScores.isEmpty) return _quiz!.results.first;

    // Find the festival with the highest accumulated score
    final winner = _festivalScores.entries.reduce(
      (a, b) => a.value >= b.value ? a : b,
    );

    return _quiz!.results.firstWhere(
      (r) => r.code == winner.key,
      orElse: () => _quiz!.results.first,
    );
  }

  void _grantKarma() {
    if (_quiz == null) return;
    final int reward = _quiz!.karmaReward > 0 ? _quiz!.karmaReward : 25;

    // Check if earned for this specific quiz
    final alreadyEarned =
        _storage.read<bool>('quiz_karma_${_quiz!.id}') ?? false;

    if (!alreadyEarned && Get.isRegistered<ProfileController>()) {
      final profile = Get.find<ProfileController>();
      profile.addKarma(reward, '${_quiz!.title} Completed');
      _storage.write('quiz_karma_${_quiz!.id}', true);
      
      // Play system success feedback
      AssetService.to.playSFX(GlobalAsset.success);
    }
  }

  void _shareResult() {
    if (_result == null || _quiz == null) return;
    SharePlus.instance.share(
      ShareParams(
        text: 'I just discovered my festival personality on Utsav! '
            'I am ${_result!.emoji} ${_result!.name} — "${_result!.personality}"! '
            'Which festival are you? Take the "${_quiz!.title}" quiz now! 🎊',
        subject: 'My Festival Personality — Utsav App',
      ),
    );
  }

  Color _parseColor(String colorString, Color fallback) {
    try {
      if (colorString.startsWith('0x')) {
        return Color(int.parse(colorString));
      } else if (colorString.startsWith('#')) {
        return Color(
          int.parse(colorString.substring(1), radix: 16) + 0xFF000000,
        );
      }
    } catch (_) {}
    return fallback;
  }

  @override
  Widget build(BuildContext context) {
    final onSurface = Theme.of(context).colorScheme.onSurface;
    return NeoScaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(LucideIcons.x, color: onSurface.withValues(alpha: 0.6)),
          onPressed: () => Get.back(),
        ),
        title: _isFinished
            ? null
            : Text(
                _quiz?.title ?? 'Loading Quiz...',
                style: AppTextStyles.titleMedium(context).copyWith(
                  color: onSurface.withValues(alpha: 0.7),
                ),
              ),
      ),
      body: SafeArea(
        child: FutureBuilder<QuizModel?>(
          future: _quizFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              );
            }
            if (!snapshot.hasData || snapshot.data == null) {
              return Center(
                child: Text(
                  'Quiz unavailable at the moment.',
                  style: AppTextStyles.titleMedium(context).copyWith(
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
              );
            }

            _quiz = snapshot.data;

            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 400),
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0.05, 0),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              ),
              child: _isFinished ? _buildResultCard() : _buildQuizQuestion(),
            );
          },
        ),
      ),
    );
  }

  // ── Question Screen ─────────────────────────────────────────────────────────

  Widget _buildQuizQuestion() {
    final q = _quiz!.questions[_currentIndex];
    return Column(
      key: ValueKey('question_$_currentIndex'),
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Progress bar
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.xl,
            0,
            AppSpacing.xl,
            0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Question ${_currentIndex + 1} of ${_quiz!.questions.length}',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.accent,
                    ),
                  ),
                  Text(
                    '${((_currentIndex / _quiz!.questions.length) * 100).toInt()}%',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: AppColors.textAdaptiveSecondary(context),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: _currentIndex / _quiz!.questions.length,
                  backgroundColor: AppColors.glassBorder(context).withValues(alpha: 0.15),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    AppColors.primaryAdaptive(context),
                  ),
                  minHeight: 4,
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Question text
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
          child: Column(
            children: [
              if (q.emoji.isNotEmpty)
                Text(q.emoji, style: const TextStyle(fontSize: 48))
                    .animate(key: ValueKey('emoji$_currentIndex'))
                    .scale(curve: Curves.easeOutBack, duration: 500.ms),
              const SizedBox(height: AppSpacing.md),
              Text(
                    q.question,
                    style: AppTextStyles.headlineMedium(context).copyWith(
                      color: AppColors.textAdaptive(context),
                      height: 1.3,
                    ),
                    textAlign: TextAlign.center,
                  )
                  .animate(key: ValueKey('q$_currentIndex'))
                  .fade(delay: 100.ms)
                  .slideY(begin: 0.1),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Options
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            physics: const BouncingScrollPhysics(),
            itemCount: q.options.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, index) {
              final option = q.options[index];
              return GestureDetector(
                    onTap: () => _handleOptionTap(option),
                    child: GlassContainer(
                      borderRadius: BorderRadius.circular(16),
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.md,
                      ),
                      color: AppColors.surfaceGlass(context),
                      opacity: Theme.of(context).brightness == Brightness.dark ? 1.0 : 0.9,
                      border: Border.all(
                        color: AppColors.glassBorder(context),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.5),
                              ),
                              color: AppColors.primary.withValues(alpha: 0.08),
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + index),
                                style: AppTextStyles.labelSmall(context).copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Text(
                              option.label.replaceAll('&amp;', '&'),
                              style: AppTextStyles.bodyLarge(context).copyWith(
                                color: AppColors.textAdaptive(context),
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                  .animate(key: ValueKey('opt${_currentIndex}_$index'))
                  .fade(delay: (150 + index * 80).ms)
                  .slideX(begin: 0.15, curve: Curves.easeOut);
            },
          ),
        ),

        const SizedBox(height: AppSpacing.xl),
      ],
    );
  }

  // ── Result Screen ────────────────────────────────────────────────────────────

  Widget _buildResultCard() {
    if (_result == null) return const SizedBox.shrink();

    final r = _result!;
    final primaryColor = _parseColor(r.primaryColor, const Color(0xFFFFB347));

    // Compute match percentage = winner's score / total possible score
    final totalScore = _festivalScores.values.fold(0, (a, b) => a + b);
    final winnerScore = _festivalScores[r.code] ?? totalScore;
    final matchPct = totalScore > 0
        ? ((winnerScore / totalScore) * 100).clamp(40, 99).toInt()
        : 78;

    final alreadyEarned =
        _storage.read<bool>('quiz_karma_${_quiz!.id}') ?? false;
    final int reward = _quiz!.karmaReward > 0 ? _quiz!.karmaReward : 25;

    return SingleChildScrollView(
      key: const ValueKey('result'),
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: AppSpacing.lg),

          // Festival Emoji — hero element with Lottie celebrations
          Stack(
            alignment: Alignment.center,
            children: [
              SmartLottie(
                url: AssetService.to.getLottie(GlobalAsset.success),
                fallbackAsset: 'assets/lottie/celebration_confetti.json',
                width: 300,
                height: 300,
                repeat: false,
              ),
              Text(r.emoji, style: const TextStyle(fontSize: 88))
                  .animate()
                  .scale(curve: Curves.easeOutBack, duration: 800.ms)
                  .shake(delay: 900.ms, duration: 600.ms),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Personality type label
          if (r.personality.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: primaryColor.withValues(alpha: 0.4)),
              ),
              child: Text(
                r.personality.toUpperCase(),
                style: AppTextStyles.labelSmall(context).copyWith(
                  color: primaryColor,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ).animate().fade(delay: 400.ms),

          const SizedBox(height: AppSpacing.md),

          // Festival name
          Text(
            'You are ${r.name}!',
            style: AppTextStyles.displayLarge(context).copyWith(
              color: primaryColor,
              height: 1.1,
            ),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 500.ms).slideY(begin: 0.1),

          if (r.name.toLowerCase() != 'you')
            const SizedBox(height: AppSpacing.lg),

          // Match percentage bar
          GlassContainer(
            borderRadius: BorderRadius.circular(16),
            padding: const EdgeInsets.all(AppSpacing.md),
            color: AppColors.surfaceGlass(context),
            border: Border.all(color: AppColors.glassBorder(context)),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Festival Match',
                      style: AppTextStyles.labelSmall(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                      ),
                    ),
                    Text(
                      '$matchPct%',
                      style: AppTextStyles.titleMedium(context).copyWith(
                        color: primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: matchPct / 100,
                    backgroundColor: AppColors.glassBorder(context),
                    valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ).animate().fade(delay: 700.ms),

          const SizedBox(height: AppSpacing.lg),

          // Description
          Text(
            r.description,
            style: AppTextStyles.bodyLarge(context).copyWith(
              color: AppColors.textAdaptiveSecondary(context),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ).animate().fade(delay: 800.ms),

          const SizedBox(height: AppSpacing.xl),

          // Karma badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.green.withValues(alpha: 0.4)),
            ),
            child: Text(
              alreadyEarned ? '✓ Quiz Completed' : '+$reward Karma Earned! ✨',
              style: AppTextStyles.labelLarge(context).copyWith(
                color: Colors.green,
                fontWeight: FontWeight.bold,
              ),
            ),
          ).animate().scale(delay: 1000.ms, curve: Curves.easeOutBack),

          const SizedBox(height: AppSpacing.xl),

          // Action buttons
          Row(
            children: [
              // Share button
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  icon: const Icon(LucideIcons.share2, size: 18),
                  label: const Text('Share Result'),
                  onPressed: _shareResult,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // Return home button
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.textAdaptiveSecondary(context),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(color: AppColors.glassBorder(context)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: () => Get.back(),
                  child: const Text('Go Home'),
                ),
              ),
            ],
          ).animate().fade(delay: 1200.ms).slideY(begin: 0.1),

          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }
}
