import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

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
      Get.snackbar(
        'Journal Saved',
        'Your gratitude for ${widget.eventTitle} is saved safely.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.withValues(alpha: 0.8),
        colorText: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceLight.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        image: const DecorationImage(
          image: AssetImage('assets/images/noise.png'),
          opacity: 0.05,
          fit: BoxFit.cover,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.menu_book_rounded, color: Colors.orangeAccent),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Gratitude Journal',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: Colors.white,
                  ),
                ),
              ),
              if (!_isEditing && _savedText.isNotEmpty)
                IconButton(
                  icon: const Icon(
                    Icons.edit_rounded,
                    color: Colors.white54,
                    size: 20,
                  ),
                  onPressed: () {
                    HapticFeedback.selectionClick();
                    setState(() => _isEditing = true);
                  },
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'What are you thankful for this ${widget.eventTitle}?',
            style: AppTextStyles.bodySmall.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: AppSpacing.md),
          if (_isEditing) ...[
            TextField(
              controller: _controller,
              maxLines: 4,
              maxLength: 200,
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.white,
                height: 1.5,
              ),
              decoration: InputDecoration(
                hintText: 'Write a private note of gratitude...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white38,
                ),
                filled: true,
                fillColor: Colors.black.withValues(alpha: 0.2),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
                onPressed: _saveEntry,
                child: const Text('Save Note'),
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _savedText,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                  height: 1.5,
                ),
              ),
            ).animate().fade(),
          ],
        ],
      ),
    );
  }
}
