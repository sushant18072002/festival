import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

enum ToastType { success, error, info, warning }

class AppSnackbars {
  static void show({
    required String title,
    required String message,
    ToastType type = ToastType.info,
  }) {
    final color = _getColor(type);
    final icon = _getIcon(type);

    Get.snackbar(
      title,
      message,
      titleText: Text(
        title,
        style: AppTextStyles.labelLarge(Get.context!).copyWith(color: Colors.white),
      ),
      messageText: Text(
        message,
        style: AppTextStyles.bodySmall(Get.context!).copyWith(color: Colors.white70),
      ),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 24,
      backgroundColor: Colors.black.withValues(
        alpha: 0.6,
      ), // Semi-transparent black
      // We can't easily add BackdropFilter to Get.snackbar standard,
      // but we can simulate the look with high transparency and blur if supported,
      // or just rely on the dark glass look.
      // To add blur, we would need a custom snackbar widget, which Get supports via `userInputForm` or `messageText` wrapper?
      // Actually, let's stick to a clean dark overlay with neon glow.
      borderColor: color.withValues(alpha: 0.5),
      borderWidth: 1,
      icon: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.2),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      shouldIconPulse: true,
      barBlur: 20, // This enables the glass effect!
      overlayBlur: 0.1, // Slight blur behind? No, might distract.
      isDismissible: true,
      duration: const Duration(seconds: 3),
      animationDuration: const Duration(milliseconds: 400),
      colorText: Colors.white,
      mainButton: TextButton(
        onPressed: () => Get.back(),
        child: const Icon(LucideIcons.x, size: 16, color: Colors.white38),
      ),
      boxShadows: [
        BoxShadow(
          color: color.withValues(alpha: 0.1),
          blurRadius: 20,
          spreadRadius: -5,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  static Color _getColor(ToastType type) {
    switch (type) {
      case ToastType.success:
        return AppColors.success;
      case ToastType.error:
        return AppColors.error;
      case ToastType.warning:
        return Colors.orangeAccent;
      case ToastType.info:
        return AppColors.primary;
    }
  }

  static IconData _getIcon(ToastType type) {
    switch (type) {
      case ToastType.success:
        return LucideIcons.circleCheck;
      case ToastType.error:
        return LucideIcons.circleAlert;
      case ToastType.warning:
        return LucideIcons.triangleAlert;
      case ToastType.info:
        return LucideIcons.info;
    }
  }
}
