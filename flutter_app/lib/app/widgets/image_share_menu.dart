import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:appinio_social_share/appinio_social_share.dart';
import '../data/models/image_model.dart';
import '../data/services/widget_to_image_service.dart';
import 'dynamic_overlay.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class ImageShareMenu extends StatelessWidget {
  final ImageModel image;
  final bool includeOverlay;

  const ImageShareMenu({super.key, required this.image, this.includeOverlay = true});

  /// Static helper to quickly show the bottom sheet menu
  static void show(BuildContext context, ImageModel image, {bool includeOverlay = true}) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => ImageShareMenu(image: image, includeOverlay: includeOverlay),
    );
  }

  Future<void> _shareTo(BuildContext context, String? platform) async {
    Get.back(); // close the bottom sheet

    // Show a loading snackbar or dialog since capturing takes ~500ms
    Get.dialog(
      Center(
        child: CircularProgressIndicator(color: AppColors.primaryAdaptive(context)),
      ),
      barrierDismissible: false,
    );

    try {
      // 1. Render the widget we want to capture
      final captureWidget = Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: AspectRatio(
            aspectRatio: image.aspectRatio > 0 ? image.aspectRatio : 0.7,
            child: DynamicOverlayWidget(
              image: image,
              showOverlay: includeOverlay,
              useThumbnail: false, // Force HD
              showWatermark: image.showWatermark,
            ),
          ),
        ),
      );

      // 2. Capture to File
      final File? imageFile = await WidgetToImageService.captureWidget(
        context: context,
        widget: captureWidget,
        size: const Size(1080, 1920), // Standard story resolution
        delay: const Duration(milliseconds: 600), // Wait for Network image to load
      );

      // Dismiss loading
      if (Get.isDialogOpen ?? false) Get.back();

      if (imageFile == null || !await imageFile.exists()) {
        throw Exception('Failed to capture image or file does not exist');
      }

      debugPrint('[ImageShareMenu] Captured image: ${imageFile.path} (${await imageFile.length()} bytes)');

      // 3. Construct share intent
      final String defaultText = image.shareText.isNotEmpty
          ? image.shareText
          : "Discover more festival greetings at Utsav App! ✨";

      final socialShare = AppinioSocialShare();

      debugPrint('[ImageShareMenu] Sharing to platform: $platform');

      if (platform == 'whatsapp') {
        if (Platform.isAndroid) {
          final result = await socialShare.android.shareToWhatsapp(defaultText, imageFile.path);
          debugPrint('[ImageShareMenu] WhatsApp share result: $result');
        } else {
          final result = await socialShare.iOS.shareImageToWhatsApp(imageFile.path);
          debugPrint('[ImageShareMenu] WhatsApp share result: $result');
        }
      } else if (platform == 'instagram') {
        if (Platform.isAndroid) {
          final result = await socialShare.android.shareToInstagramStory(imageFile.path);
          debugPrint('[ImageShareMenu] Instagram share result: $result');
        } else {
          final result = await socialShare.iOS.shareToInstagramStory(imageFile.path);
          debugPrint('[ImageShareMenu] Instagram share result: $result');
        }
      } else {
        // Universal share dialog
        debugPrint('[ImageShareMenu] Opening universal share sheet');
        await SharePlus.instance.share(ShareParams(text: defaultText));
      }
    } catch (e, stack) {
      if (Get.isDialogOpen ?? false) Get.back();
      debugPrint('[ImageShareMenu] Error sharing: $e');
      debugPrint('[ImageShareMenu] StackTrace: $stack');
      Get.snackbar(
        'Share Failed',
        'Could not prepare image for sharing. Error: $e',
        backgroundColor: AppColors.error,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceGlass(context).withValues(alpha: 0.9),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: AppColors.glassBorder(context), width: 1.5),
      ),
      padding: const EdgeInsets.only(top: 12, bottom: 40, left: 24, right: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 24),

          Text(
            'Share Masterpiece',
            style: AppTextStyles.headlineSmall(context).copyWith(
              color: AppColors.textAdaptive(context),
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            includeOverlay ? 'Sharing HD Image with Quotes & Greetings' : 'Sharing original HD Image',
            style: AppTextStyles.bodyMedium(context).copyWith(
              color: AppColors.textAdaptiveSecondary(context),
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 32),

          // Row of large buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildShareOption(
                context,
                icon: const _WhatsAppIcon(),
                label: 'WhatsApp',
                color: const Color(0xFF25D366),
                onTap: () => _shareTo(context, 'whatsapp'),
              ).animate().fade().slideY(begin: 0.2, delay: 100.ms),

              _buildShareOption(
                context,
                icon: const _InstagramIcon(),
                label: 'Instagram',
                color: const Color(0xFFE1306C),
                onTap: () => _shareTo(context, 'instagram'),
              ).animate().fade().slideY(begin: 0.2, delay: 200.ms),

              _buildShareOption(
                context,
                icon: Icon(LucideIcons.share2, color: AppColors.primaryAdaptive(context), size: 28),
                label: 'More',
                color: AppColors.primaryAdaptive(context),
                onTap: () => _shareTo(context, null),
              ).animate().fade().slideY(begin: 0.2, delay: 300.ms),
            ],
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildShareOption(
    BuildContext context, {
    required Widget icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        onTap();
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: isDark ? color.withValues(alpha: 0.15) : color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(color: color.withValues(alpha: 0.3), width: 2),
            ),
            alignment: Alignment.center,
            child: icon,
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: AppTextStyles.labelMedium(context).copyWith(
              color: AppColors.textAdaptive(context),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _WhatsAppIcon extends StatelessWidget {
  const _WhatsAppIcon();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: const BoxDecoration(
        color: Color(0xFF25D366),
        shape: BoxShape.circle,
      ),
      child: const Icon(
        LucideIcons.messageSquare,
        color: Colors.white,
        size: 18,
      ),
    );
  }
}

class _InstagramIcon extends StatelessWidget {
  const _InstagramIcon();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFD5949), Color(0xFFD6249F), Color(0xFF285AEB)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(
        LucideIcons.camera,
        color: Colors.white,
        size: 18,
      ),
    );
  }
}
