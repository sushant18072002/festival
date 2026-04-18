import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';

class WidgetToImageService {
  /// Captures a [Widget] as an image [File].
  ///
  /// This works by building the widget off-screen using an [Overlay].
  /// The [context] must be a descendant of a Navigator/Scaffold so that
  /// Overlay.of(context) works.
  /// 
  /// The [size] parameter controls the dimensions of the captured image.
  static Future<File?> captureWidget({
    required BuildContext context,
    required Widget widget,
    Size size = const Size(1080, 1920), // Default to standard Stories size
    Duration delay = const Duration(milliseconds: 500), // Give images time to load
  }) async {
    final GlobalKey repaintKey = GlobalKey();

    // Create a standalone overlay entry to render the widget off-screen
    final overlayEntry = OverlayEntry(
      builder: (context) {
        return Positioned(
          left: -size.width * 2, // Move entirely off-screen
          top: -size.height * 2,
          width: size.width,
          height: size.height,
          child: Material(
            color: Colors.transparent,
            child: RepaintBoundary(
              key: repaintKey,
              child: SizedBox(
                width: size.width,
                height: size.height,
                child: widget,
              ),
            ),
          ),
        );
      },
    );

    try {
      // Insert into the overlay
      Overlay.of(context).insert(overlayEntry);

      // Wait for rendering and image loading
      await Future.delayed(delay);

      // Capture the pixels
      final boundary = repaintKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      
      if (boundary == null) {
        debugPrint('[WidgetToImageService] RepaintBoundary was null.');
        return null;
      }

      // Convert to image -> byte data
      final ui.Image image = await boundary.toImage(pixelRatio: 1.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final Uint8List? pngBytes = byteData?.buffer.asUint8List();

      if (pngBytes == null) {
        debugPrint('[WidgetToImageService] Failed to encode PNG bytes.');
        return null;
      }

      // Save to temp file
      final tempDir = await getTemporaryDirectory();
      final file = File('${tempDir.path}/shared_utsav_image_${DateTime.now().millisecondsSinceEpoch}.png');
      await file.writeAsBytes(pngBytes);
      
      return file;

    } catch (e) {
      debugPrint('[WidgetToImageService] Capture error: $e');
      return null;
    } finally {
      // Clean up the overlay entry
      overlayEntry.remove();
    }
  }
}
