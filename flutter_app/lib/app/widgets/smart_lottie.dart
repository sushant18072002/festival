import 'dart:io';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:get/get.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../data/providers/data_repository.dart';

class SmartLottie extends StatefulWidget {
  final String url; // Could be full CDN url or filename
  final String fallbackAsset; // e.g. 'assets/lottie/holi.json'
  final double? width;
  final double? height;
  final BoxFit fit;
  final bool repeat;

  const SmartLottie({
    super.key,
    required this.url,
    this.fallbackAsset = 'assets/lottie/loading_mandala.json',
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.repeat = true,
  });

  /// Pre-fetches and caches a list of Lottie URLs/keys to the local device.
  static Future<void> preCache(List<String> urls) async {
    final baseUrl = dotenv.env['CDN_BASE_URL'] ?? '';
    final docDir = await getApplicationDocumentsDirectory();
    final lottieDir = Directory('${docDir.path}/utsav_lotties');
    if (!await lottieDir.exists()) await lottieDir.create(recursive: true);

    for (final url in urls) {
      if (url.isEmpty || url.startsWith('assets/')) continue;

      // Smart URL Resolution
      String finalKey = url;
      if (!finalKey.startsWith('http') && !finalKey.contains('/')) {
        finalKey = 'lotties/$finalKey';
      }

      final finalUrl = (finalKey.startsWith('http') || baseUrl.isEmpty)
          ? finalKey
          : '$baseUrl/${finalKey.startsWith('/') ? finalKey.substring(1) : finalKey}';

      try {
        final uri = Uri.parse(finalUrl);
        final filename = uri.pathSegments.isNotEmpty
            ? uri.pathSegments.last
            : 'lottie_${url.hashCode}.json';

        final file = File('${lottieDir.path}/$filename');
        if (!await file.exists()) {
          final resp = await http.get(uri);
          if (resp.statusCode == 200) {
            await file.writeAsBytes(resp.bodyBytes);
          }
        }
      } catch (e) {
        debugPrint('[SmartLottie] Pre-cache failed for $url: $e');
      }
    }
  }

  @override
  State<SmartLottie> createState() => _SmartLottieState();
}

class _SmartLottieState extends State<SmartLottie> {
  File? _localFile;
  bool _isLoading = true;
  bool _hasError = false;
  String? _assetPath;
  bool _useAssetMode = false;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  Future<void> _loadImage() async {
    final repo = Get.find<DataRepository>();

    // 1. Basic check: if it's already an asset path, just use it
    if (widget.url.startsWith('assets/')) {
      _assetPath = widget.url;
      _useAssetMode = true;
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
      return;
    }

    // 2. Offline / Local Mode
    if (!repo.useRemote.value) {
      try {
        final uri = Uri.parse(widget.url);
        final filename = uri.pathSegments.isNotEmpty
            ? uri.pathSegments.last
            : widget.url;
        _assetPath = 'assets/lottie/$filename';
        _useAssetMode = true;
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        return;
      } catch (e) {
        if (mounted) {
          setState(() {
            _hasError = true;
            _isLoading = false;
          });
        }
        return;
      }
    }

    // 3. Remote mode + Offline Cache
    try {
      final String baseUrl = dotenv.env['CDN_BASE_URL'] ?? '';
      
      // Smart URL Resolution
      String finalKey = widget.url;
      if (!finalKey.startsWith('http') && !finalKey.contains('/')) {
        finalKey = 'lotties/$finalKey';
      }

      String cleanKey = finalKey.startsWith('/') ? finalKey.substring(1) : finalKey;
      
      // Resilient Check: Avoid double-root segments (e.g., Utsav/stage/Utsav/stage/...)
      final Uri baseUri = Uri.parse(baseUrl);
      String basePath = baseUri.path;
      if (basePath.startsWith('/')) basePath = basePath.substring(1);
      if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);

      if (basePath.isNotEmpty && cleanKey.startsWith(basePath)) {
        cleanKey = cleanKey.substring(basePath.length);
        if (cleanKey.startsWith('/')) cleanKey = cleanKey.substring(1);
      }

      final String finalUrl = (cleanKey.startsWith('http') || baseUrl.isEmpty)
          ? cleanKey
          : (baseUrl.endsWith('/') ? '$baseUrl$cleanKey' : '$baseUrl/$cleanKey');
      
      debugPrint('[SmartLottie] Attempting Load: $finalUrl');
      
      final uri = Uri.parse(finalUrl);
      final filename = uri.pathSegments.isNotEmpty
          ? uri.pathSegments.last
          : 'lottie_${widget.url.hashCode}.json';

      final docDir = await getApplicationDocumentsDirectory();
      final lottieDir = Directory('${docDir.path}/utsav_lotties');
      if (!await lottieDir.exists()) {
        await lottieDir.create(recursive: true);
      }

      final localPath = '${lottieDir.path}/$filename';
      final file = File(localPath);

      if (await file.exists()) {
        // Cache Hit!
        if (mounted) {
          setState(() {
            _localFile = file;
            _isLoading = false;
          });
        }
      } else {
        // Fetch from network
        final response = await http.get(uri);
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
          if (mounted) {
            setState(() {
              _localFile = file;
              _isLoading = false;
            });
          }
        } else {
          // Fallback if 404/500
          if (mounted) {
            setState(() {
              _hasError = true;
              _isLoading = false;
            });
          }
        }
      }
    } catch (e) {
      // Network Exception -> Offline -> Show fallback
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return SizedBox(
        width: widget.width,
        height: widget.height,
        child: const Center(
          child: CircularProgressIndicator(
            strokeWidth: 1, // Thinner for subtler look
            color: Colors.white10, // Nearly invisible background loader
          ),
        ),
      );
    }

    if (_hasError) {
      return const SizedBox.shrink(); // Hide the error icon as requested
    }

    if (_useAssetMode && _assetPath != null) {
      return Lottie.asset(
        _assetPath!,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        repeat: widget.repeat,
        errorBuilder: (context, error, stack) => const SizedBox.shrink(),
      );
    }

    if (_localFile != null) {
      return Lottie.file(
        _localFile!,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        repeat: widget.repeat,
        errorBuilder: (context, error, stack) => const SizedBox.shrink(),
      );
    }

    return const SizedBox();
  }
}
