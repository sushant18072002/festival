import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';

class EventWikiButton extends StatelessWidget {
  final EventModel event;

  const EventWikiButton({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    final hasWiki = event.wikiLink != null && event.wikiLink!.trim().isNotEmpty;
    if (!hasWiki) return const SizedBox.shrink();
    
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                side: BorderSide(
                  color: isDark ? Colors.white30 : Colors.black12,
                ),
                foregroundColor: AppColors.textAdaptive(context),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                backgroundColor: isDark
                    ? Colors.white.withValues(alpha: 0.03)
                    : Colors.black.withValues(alpha: 0.02),
              ),
              icon: const Icon(LucideIcons.bookOpen, size: 18),
              label: const Text(
                'READ FULL HISTORY',
                style: TextStyle(
                  letterSpacing: 1.0,
                  fontWeight: FontWeight.w700,
                ),
              ),
              onPressed: () {
                HapticFeedback.selectionClick();
                launchUrl(
                  Uri.parse(event.wikiLink!),
                  mode: LaunchMode.externalApplication,
                );
              },
            ),
          ),
        ],
      ).animate().fade(delay: 100.ms).slideY(begin: 0.2),
    );
  }
}
