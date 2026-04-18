import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

/// Gratitude Journal — private local note for the user, saved per event+year.
/// Adapts fully to Light and Dark mode.
class GratitudeJournal extends StatefulWidget {
  final String eventId;
  final String eventTitle;

  const GratitudeJournal({
    super.key,
    required this.eventId,
    required this.eventTitle,
  });

  @override
  State<GratitudeJournal> createState() => _GratitudeJournalState();
}

class _GratitudeJournalState extends State<GratitudeJournal> {
  final _storage = GetStorage();
  late TextEditingController _controller;
  late String _storageKey;
  bool _isEditing = false;
  String _savedText = '';

  @override
  void initState() {
    super.initState();
    final year = DateTime.now().year;
    _storageKey = 'gratitude_${widget.eventId}_$year';
    _savedText = _storage.read<String>(_storageKey) ?? '';
    _controller = TextEditingController(text: _savedText);
    _isEditing = _savedText.isEmpty;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _saveEntry() {
    HapticFeedback.lightImpact();
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      _storage.write(_storageKey, text);
      setState(() {
        _savedText = text;
        _isEditing = false;
      });
      final isDark = Theme.of(context).brightness == Brightness.dark;
      Get.snackbar(
        '✨ Saved',
        'Your gratitude for ${widget.eventTitle} is kept safely.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.primaryAdaptive(context),
        colorText: isDark ? Colors.black : Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.glassBorder(context)),
        boxShadow: AppColors.glassShadow(context),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.accentAdaptive(context).withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  LucideIcons.book,
                  color: AppColors.accentAdaptive(context),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'GRATITUDE JOURNAL',
                      style: AppTextStyles.labelSmall(context).copyWith(
                        color: AppColors.accentAdaptive(context),
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                      ),
                    ),
                    Text(
                      'What are you thankful for this ${widget.eventTitle}?',
                      style: AppTextStyles.bodySmall(context).copyWith(
                        color: AppColors.textAdaptiveSecondary(context),
                      ),
                    ),
                  ],
                ),
              ),
              if (!_isEditing && _savedText.isNotEmpty)
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() => _isEditing = true);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceGlass(context),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      LucideIcons.pencil,
                      color: AppColors.textAdaptiveSecondary(context),
                      size: 18,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 20),

          // Input or Display
          if (_isEditing) ...[
            TextField(
              controller: _controller,
              maxLines: 4,
              maxLength: 300,
              style: AppTextStyles.bodyMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                height: 1.6,
              ),
              decoration: InputDecoration(
                hintText: 'Write a private note of gratitude...',
                hintStyle: AppTextStyles.bodyMedium(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(
                    context,
                  ).withValues(alpha: 0.5),
                ),
                filled: true,
                fillColor: AppColors.surfaceGlass(context),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.glassBorder(context)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.glassBorder(context)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.primaryAdaptive(context)),
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryAdaptive(context),
                  foregroundColor: isDark ? Colors.black : Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _saveEntry,
                child: const Text(
                  'SAVE MY NOTE',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceGlass(context),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                _savedText,
                style: AppTextStyles.bodyMedium(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                  fontStyle: FontStyle.italic,
                  height: 1.7,
                ),
              ),
            ).animate().fade(),
          ],
        ],
      ),
    );
  }
}
