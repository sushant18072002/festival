import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:path_provider/path_provider.dart';
import 'package:appinio_social_share/appinio_social_share.dart';
import 'package:share_plus/share_plus.dart';

import '../data/models/image_model.dart';
import '../data/providers/data_repository.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../theme/app_spacing.dart';
import '../data/services/analytics_service.dart';
import '../modules/profile/profile_controller.dart';
import 'smart_image.dart';
import 'glass_container.dart';

class StoryDesignerSheet extends StatefulWidget {
  final ImageModel image;

  const StoryDesignerSheet({super.key, required this.image});

  static void show(BuildContext context, ImageModel image) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.black,
      builder: (_) => StoryDesignerSheet(image: image),
    );
  }

  @override
  State<StoryDesignerSheet> createState() => _StoryDesignerSheetState();
}

class _StoryDesignerSheetState extends State<StoryDesignerSheet> {
  final GlobalKey _globalKey = GlobalKey();
  final DataRepository _dataRepo = Get.find<DataRepository>();

  bool _isCapturing = false;

  // Customization State
  int _selectedLayout = 0; // 0: Bottom Ribbon, 1: Centered Glass, 2: Top Banner
  int _selectedFont = 0; // 0: Outfit, 1: Playfair, 2: Caveat

  String _customText = '';
  String _senderName = '';

  // Content pools
  final List<String> _textOptions = [];
  int _selectedTextIndex = 0;

  @override
  void initState() {
    super.initState();
    // Populate text options
    _textOptions.add("Wishing you love and light! ✨"); // Default
    if (_dataRepo.allGreetings.isNotEmpty) {
      _textOptions.addAll(_dataRepo.allGreetings.map((g) => g.text));
    }
    if (_dataRepo.allQuotes.isNotEmpty) {
      _textOptions.addAll(_dataRepo.allQuotes.map((q) => q.text));
    }

    // Fallbacks if empty
    if (_textOptions.length == 1) {
      _textOptions.addAll([
        "May this festival bring joy and prosperity to your family.",
        "Celebrate the light within. Have a wonderful day!",
        "Sending you warm wishes on this auspicious occasion.",
      ]);
    }
    _customText = _textOptions[0];
  }

  Future<void> _captureAndShare(String platform) async {
    setState(() => _isCapturing = true);
    await Future.delayed(const Duration(milliseconds: 100));

    try {
      RenderRepaintBoundary boundary =
          _globalKey.currentContext!.findRenderObject()
              as RenderRepaintBoundary;
      ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      ByteData? byteData = await image.toByteData(
        format: ui.ImageByteFormat.png,
      );
      Uint8List pngBytes = byteData!.buffer.asUint8List();

      final tempDir = await getTemporaryDirectory();
      final file = await File(
        '${tempDir.path}/story_${DateTime.now().millisecondsSinceEpoch}.png',
      ).create();
      await file.writeAsBytes(pngBytes);

      AnalyticsService.instance.logShare(widget.image.id, platform);
      if (Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().incrementShare();
      }

      final socialShare = AppinioSocialShare();
      final msg =
          "Look at this amazing festival vibe! ✨\nCheck it out on Utsav.";

      Get.back();

      if (Platform.isAndroid) {
        if (platform == 'instagram') {
          await socialShare.android.shareToInstagramStory(file.path);
        } else if (platform == 'whatsapp') {
          await socialShare.android.shareToWhatsapp(msg, file.path);
        } else {
          await SharePlus.instance.share(ShareParams(text: msg));
        }
      } else {
        if (platform == 'instagram') {
          await socialShare.iOS.shareToInstagramStory(file.path);
        } else if (platform == 'whatsapp') {
          await socialShare.iOS.shareImageToWhatsApp(file.path);
        } else {
          await SharePlus.instance.share(ShareParams(text: msg));
        }
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not generate story canvas: $e');
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  TextStyle _getFontStyle() {
    switch (_selectedFont) {
      case 1:
        return AppTextStyles.titleLarge(context).copyWith(
          fontFamily: 'Playfair Display',
        );
      case 2:
        return AppTextStyles.titleLarge(context).copyWith(
          fontFamily: 'Caveat',
          fontSize: 28,
        );
      default:
        return AppTextStyles.titleLarge(context);
    }
  }

  Widget _buildPreview() {
    return AspectRatio(
      aspectRatio: 9 / 16,
      child: RepaintBoundary(
        key: _globalKey,
        child: Stack(
          fit: StackFit.expand,
          children: [
            SmartImage(widget.image.url, fit: BoxFit.cover),

            // Layout 0: Bottom Ribbon
            if (_selectedLayout == 0) ...[
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.9),
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        _customText,
                        style: _getFontStyle().copyWith(
                          color: Colors.white,
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (_senderName.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          "- $_senderName",
                          style: AppTextStyles.bodyMedium(context).copyWith(
                            color: AppColors.primaryAdaptive(context),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Layout 1: Centered Glass
            if (_selectedLayout == 1) ...[
              Center(
                child: GlassContainer(
                  padding: const EdgeInsets.all(24),
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  borderRadius: AppRadius.cardRadius,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _customText,
                        style: _getFontStyle().copyWith(
                          color: Colors.white,
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (_senderName.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          "From $_senderName",
                          style: AppTextStyles.labelLarge(context).copyWith(
                            color: AppColors.primaryAdaptive(context),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Layout 2: Top Banner
            if (_selectedLayout == 2) ...[
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.9),
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        _customText,
                        style: _getFontStyle().copyWith(
                          color: Colors.white,
                          height: 1.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (_senderName.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          "- $_senderName",
                          style: AppTextStyles.bodyMedium(context).copyWith(
                            color: AppColors.primaryAdaptive(context),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            // Branding
            Positioned(
              top: _selectedLayout == 2 ? null : 24,
              bottom: _selectedLayout == 2 ? 24 : null,
              left: 24,
              child: Row(
                children: [
                  Image.asset(
                    'assets/icon/avatar_tier1_1.png',
                    width: 24,
                    height: 24,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Made with Utsav',
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Card Builder', style: AppTextStyles.titleMedium(context)),
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: Colors.white),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
            ),

            // Preview
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: _isCapturing
                    ? Center(
                        child: CircularProgressIndicator(
                          color: AppColors.primaryAdaptive(context),
                        ),
                      )
                    : ClipRRect(
                        borderRadius: AppRadius.cardRadius,
                        child: _buildPreview(),
                      ),
              ),
            ),

            // Controls
            Container(
              height: 320,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceGlass(context),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Text Selection Row
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(LucideIcons.shuffle, size: 16),
                          label: Text(
                            "Message",
                            style: AppTextStyles.labelMedium(context).copyWith(fontSize: 12),
                          ),
                          onPressed: () {
                            setState(() {
                              _selectedTextIndex =
                                  (_selectedTextIndex + 1) %
                                  _textOptions.length;
                              _customText = _textOptions[_selectedTextIndex];
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          decoration: const InputDecoration(
                            hintText: "From Name",
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (v) => setState(() => _senderName = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Style Toggles
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Layout", style: AppTextStyles.labelMedium(context)),
                      SegmentedButton<int>(
                        segments: const [
                          ButtonSegment(
                            value: 0,
                            icon: Icon(LucideIcons.alignEndVertical),
                          ),
                          ButtonSegment(
                            value: 1,
                            icon: Icon(LucideIcons.alignCenterVertical),
                          ),
                          ButtonSegment(
                            value: 2,
                            icon: Icon(LucideIcons.alignStartVertical),
                          ),
                        ],
                        selected: {_selectedLayout},
                        onSelectionChanged: (set) =>
                            setState(() => _selectedLayout = set.first),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Style", style: AppTextStyles.labelMedium(context)),
                      SegmentedButton<int>(
                        segments: const [
                          ButtonSegment(value: 0, label: Text('Modern')),
                          ButtonSegment(value: 1, label: Text('Elegant')),
                          ButtonSegment(value: 2, label: Text('Festive')),
                        ],
                        selected: {_selectedFont},
                        onSelectionChanged: (set) =>
                            setState(() => _selectedFont = set.first),
                      ),
                    ],
                  ),

                  const Spacer(),

                  // Share Buttons
                  Row(
                    children: [
                      _buildShareBtn(
                        'Instagram',
                        LucideIcons.instagram,
                        'instagram',
                        Colors.purpleAccent,
                      ),
                      const SizedBox(width: 8),
                      _buildShareBtn(
                        'WhatsApp',
                        LucideIcons.messageCircle,
                        'whatsapp',
                        Colors.green,
                      ),
                      const SizedBox(width: 8),
                      _buildShareBtn('More', LucideIcons.share2, 'more', Colors.white),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShareBtn(
    String label,
    IconData icon,
    String platform,
    Color color,
  ) {
    return Expanded(
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: color.withValues(alpha: 0.1),
          foregroundColor: color,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 12),
        ),
        icon: Icon(icon, size: 18),
        label: Text(label, style: AppTextStyles.labelMedium(context).copyWith(fontSize: 12)),
        onPressed: _isCapturing ? null : () => _captureAndShare(platform),
      ),
    );
  }
}
