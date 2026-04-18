import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../widgets/neo_scaffold.dart';

class TermsOfServiceView extends StatelessWidget {
  const TermsOfServiceView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      appBar: AppBar(
        title: Text(
          'Terms of Service',
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
          ..._sections(context),
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
                  color: AppColors.accentAdaptive(
                    context,
                  ).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.scale,
                  color: AppColors.accentAdaptive(context),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Terms of Service',
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
            'Effective: March 2025',
            style: AppTextStyles.labelSmall(context).copyWith(
              color: AppColors.accentAdaptive(context),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'By downloading or using Utsav – The Spirit of Celebration, you agree to be bound by these Terms of Service. Please read them carefully.',
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
        LucideIcons.circleCheck,
        'Acceptance of Terms',
        [
          'By accessing or using the Utsav app, you agree to comply with and be bound by these Terms.',
          'If you disagree with any part of these terms, please do not use the app.',
          'We reserve the right to update these Terms at any time without prior notice.',
        ],
      ),
      (
        LucideIcons.partyPopper,
        'Use of the App',
        [
          'Utsav is a festival discovery and celebration guide app for informational and cultural purposes.',
          'You agree to use the app only for lawful, personal, non-commercial purposes.',
          'You must not reproduce, duplicate, copy, sell, or exploit any part of the app without written permission.',
        ],
      ),
      (
        LucideIcons.user,
        'User Conduct',
        [
          'You are solely responsible for your use of the app and any content you generate.',
          'Gratitude journal entries are stored privately on your device and are your sole responsibility.',
          'You agree not to misuse the app in any way that could damage, disable, or impair the service.',
        ],
      ),
      (
        LucideIcons.star,
        'Karma & Gamification',
        [
          'The Karma system, streaks, and badges within the app are virtual recognition features with no monetary value.',
          'We reserve the right to modify, reset, or discontinue these features at any time.',
          'Virtual rewards cannot be redeemed, transferred, or exchanged for real goods or services.',
        ],
      ),
      (
        LucideIcons.image,
        'Content & Intellectual Property',
        [
          'All festival content, imagery, quotes, mantras, and textual information are provided for cultural and informational use.',
          'The Utsav brand name, logo, and app design are the intellectual property of the developers.',
          'Festival images and content are sourced from public domain or licensed cultural archives.',
        ],
      ),
      (
        LucideIcons.ban,
        'Disclaimer of Warranties',
        [
          'The app is provided "as is" without warranty of any kind, express or implied.',
          'We do not warrant that festival dates, descriptions, or ritual information are always accurate or current.',
          'Festival dates may vary by region or religious school of thought — always verify with your local community.',
        ],
      ),
      (
        LucideIcons.scale,
        'Limitation of Liability',
        [
          'To the maximum extent permitted by law, Utsav shall not be liable for any indirect, incidental, or consequential damages.',
          'Our total liability, if any, is limited to the amount you paid for the app (which is free).',
        ],
      ),
      (
        LucideIcons.mail,
        'Contact',
        [
          'Questions about these Terms? Contact us at support@utsavapp.in',
          'We aim to respond to all enquiries within 5 business days.',
        ],
      ),
    ];

    return data.asMap().entries.map((entry) {
      final i = entry.key;
      final (icon, title, points) = entry.value;
      return _TermsSection(
        icon: icon,
        title: title,
        points: points,
        delay: i * 80,
      );
    }).toList();
  }
}

class _TermsSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<String> points;
  final int delay;

  const _TermsSection({
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
              Icon(icon, color: AppColors.accentAdaptive(context), size: 20),
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
                      color: AppColors.accentAdaptive(context),
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
