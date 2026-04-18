import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class AnimatedCountdownChip extends StatefulWidget {
  final DateTime targetDate;
  final bool isLarge;

  const AnimatedCountdownChip({
    super.key,
    required this.targetDate,
    this.isLarge = false,
  });

  @override
  State<AnimatedCountdownChip> createState() => _AnimatedCountdownChipState();
}

class _AnimatedCountdownChipState extends State<AnimatedCountdownChip> {
  late Timer _timer;
  String _timeString = '';
  bool _isToday = false;

  @override
  void initState() {
    super.initState();
    _updateTime();
    // Update every minute is enough for h:m, but let's do every 30s to be safe
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _updateTime());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateTime() {
    final now = DateTime.now();
    final difference = widget.targetDate.difference(now);

    final isSameDay =
        now.year == widget.targetDate.year &&
        now.month == widget.targetDate.month &&
        now.day == widget.targetDate.day;

    if (isSameDay || difference.isNegative) {
      if (mounted) {
        setState(() {
          _isToday = true;
          _timeString = 'HAPPENING TODAY';
        });
      }
      return;
    }

    final days = difference.inDays;
    final hours = difference.inHours % 24;
    final minutes = difference.inMinutes % 60;

    String newTime;
    if (days > 0) {
      newTime = 'IN ${days}d ${hours}h';
    } else if (hours > 0) {
      newTime = 'IN ${hours}h ${minutes}m';
    } else {
      newTime = 'IN ${minutes}m';
    }

    if (mounted && _timeString != newTime) {
      setState(() {
        _isToday = false;
        _timeString = newTime;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget textWidget = Text(
      _timeString,
      style:
          (widget.isLarge
                  ? AppTextStyles.labelMedium(context)
                  : AppTextStyles.labelSmall(context))
              .copyWith(
                color: _isToday ? AppColors.primaryAdaptive(context) : AppColors.accentAdaptive(context),
                letterSpacing: 2.0,
                fontWeight: FontWeight.bold,
              ),
    );

    if (_isToday) {
      textWidget = textWidget
          .animate(onPlay: (controller) => controller.repeat(reverse: true))
          .tint(color: Colors.white, duration: 1000.ms, end: 0.5)
          .shimmer(color: Colors.white, duration: 1000.ms);
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: widget.isLarge ? 12 : 8,
        vertical: widget.isLarge ? 6 : 4,
      ),
      decoration: BoxDecoration(
        color: (_isToday ? AppColors.primaryAdaptive(context) : AppColors.accentAdaptive(context)).withValues(
          alpha: 0.1,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: (_isToday ? AppColors.primaryAdaptive(context) : AppColors.accentAdaptive(context)).withValues(
            alpha: 0.3,
          ),
        ),
        boxShadow: _isToday
            ? [
                BoxShadow(
                  color: AppColors.primaryAdaptive(context).withValues(alpha: 0.2),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _isToday ? LucideIcons.partyPopper : LucideIcons.calendarClock,
            size: widget.isLarge ? 16 : 12,
            color: _isToday ? AppColors.primaryAdaptive(context) : AppColors.accentAdaptive(context),
          ),
          const SizedBox(width: 6),
          textWidget,
        ],
      ),
    );
  }
}
