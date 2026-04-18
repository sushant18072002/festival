import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';

class PrivacyPolicyView extends StatelessWidget {
  const PrivacyPolicyView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      appBar: AppBar(
        title: Text(
          'Privacy Policy',
          style: AppTextStyles.headlineMedium(
            context,
          ).copyWith(color: AppColors.textAdaptive(context)),
        ),
        backgroundColor: Colors.transparent,
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.lg,
          AppSpacing.lg,
          100,
        ),
        children: [
          const SizedBox(height: 40),
          _buildHeader(context),
          const SizedBox(height: AppSpacing.xl),
          ..._sections(context).map((s) => s),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.glassBorder(context)),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primaryAdaptive(
                    context,
                  ).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.shieldCheck,
                  color: AppColors.primaryAdaptive(context),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Your Privacy Matters',
                  style: AppTextStyles.headlineMedium(context).copyWith(
                    color: AppColors.textAdaptive(context),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Last updated: March 2025',
            style: AppTextStyles.labelSmall(context).copyWith(
              color: AppColors.primaryAdaptive(context),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Utsav – The Spirit of Celebration is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.',
            style: AppTextStyles.bodyMedium(context).copyWith(
              color: AppColors.textAdaptiveSecondary(context),
              height: 1.6,
            ),
          ),
        ],
      ),
    ).animate().fade().slideY(begin: 0.1);
  }

  List<Widget> _sections(BuildContext context) {
    final data = [
      (
        LucideIcons.info,
        'Information We Collect',
        [
          'Festival preferences and selected regions you configure locally on your device.',
          'Anonymous usage analytics to improve app performance (no personally identifiable information).',
          'Device language and timezone settings to serve relevant festival dates.',
          'Profile data you voluntarily enter (name, avatar selection) — stored locally only.',
        ],
      ),
      (
        LucideIcons.lock,
        'How We Use Your Information',
        [
          'To personalise your festival feed based on selected regions and preferences.',
          'To deliver timely notifications for upcoming festivals you follow.',
          'To calculate your Karma score and streak — all computed locally on your device.',
          'We do NOT sell, rent, or share your personal data with third parties.',
        ],
      ),
      (
        LucideIcons.database,
        'Data Storage',
        [
          'All preference data is stored locally on your device using secure local storage.',
          'We do not maintain any remote database of individual users.',
          'You can clear all local data at any time from Settings → Clear App Data.',
        ],
      ),
      (
        LucideIcons.bell,
        'Push Notifications',
        [
          'We may send optional festival reminders if you grant notification permission.',
          'You can disable notifications at any time in your device Settings or within the app.',
          'Notification tokens are not associated with any personal identity.',
        ],
      ),
      (
        LucideIcons.baby,
        "Children's Privacy",
        [
          'Utsav is suitable for all ages and does not knowingly collect personal data from children under 13.',
          'The app contains no advertising, social features, or external links to unsafe content.',
        ],
      ),
      (
        LucideIcons.refreshCw,
        'Changes to This Policy',
        [
          'We may update this Privacy Policy periodically.',
          'Continued use of the app after changes constitutes acceptance of the updated policy.',
          'Significant changes will be communicated via an in-app notice.',
        ],
      ),
      (
        LucideIcons.mail,
        'Contact Us',
        [
          'If you have any questions about this Privacy Policy, please contact us.',
          'Email: support@utsavapp.in',
        ],
      ),
    ];

    return data.asMap().entries.map((entry) {
      final i = entry.key;
      final (icon, title, points) = entry.value;
      return _PolicySection(
        icon: icon,
        title: title,
        points: points,
        delay: i * 80,
      );
    }).toList();
  }
}

class _PolicySection extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<String> points;
  final int delay;

  const _PolicySection({
    required this.icon,
    required this.title,
    required this.points,
    required this.delay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.glassBorder(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primaryAdaptive(context), size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.titleMedium(context).copyWith(
                    color: AppColors.textAdaptive(context),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...points.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: AppColors.primaryAdaptive(context),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      p,
                      style: AppTextStyles.bodyMedium(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                        height: 1.55,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate(delay: Duration(milliseconds: delay)).fade().slideY(begin: 0.08);
  }
}
