import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

/// AudioCacheManager — Handles background downloading and persistent caching
/// of remote S3 audio assets to resolve streaming/extractor issues.
class AudioCacheManager {
  static final Dio _dio = Dio();

  /// Gets the local path for a cached file.
  /// Returns null if the file does not exist.
  static Future<String?> getLocalPath(String url) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final fileName = _getFileName(url);
      final filePath = p.join(directory.path, 'audio_cache', fileName);
      
      final file = File(filePath);
      if (await file.exists()) {
        return filePath;
      }
    } catch (e) {
      debugPrint('[AudioCache] Error checking local path: $e');
    }
    return null;
  }

  /// Downloads a file to the cache in the background.
  /// Does nothing if the file already exists.
  static Future<String?> downloadToCache(String url) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final cacheDir = Directory(p.join(directory.path, 'audio_cache'));
      
      if (!await cacheDir.exists()) {
        await cacheDir.create(recursive: true);
      }

      final fileName = _getFileName(url);
      final filePath = p.join(cacheDir.path, fileName);
      final file = File(filePath);

      if (await file.exists()) {
        return filePath;
      }

      debugPrint('[AudioCache] Starting background download: $url');
      await _dio.download(url, filePath);
      debugPrint('[AudioCache] Download complete: $filePath');
      
      return filePath;
    } catch (e) {
      debugPrint('[AudioCache] Download failed for $url: $e');
      return null;
    }
  }

  /// Extracts a safe filename from a URL.
  static String _getFileName(String url) {
    // Create a hash or clean the URL to use as a filename
    final uri = Uri.parse(url);
    final baseName = p.basename(uri.path);
    // Ensure we have an extension
    if (!baseName.contains('.')) {
      return '$baseName.aac';
    }
    return baseName;
  }
}
