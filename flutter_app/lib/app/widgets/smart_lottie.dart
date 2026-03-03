import 'dart:io';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'package:get/get.dart';

import '../data/providers/data_repository.dart';
import '../theme/app_colors.dart';

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
    this.fallbackAsset = 'assets/lottie/holi_splash.json',
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.repeat = true,
  });

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
      final uri = Uri.parse(widget.url);
      final filename = uri.pathSegments.isNotEmpty
          ? uri.pathSegments.last
          : 'lottie_${widget.url.hashCode}.json'; // Ensure json extension if possible

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
            strokeWidth: 2,
            color: Colors.white38,
          ),
        ),
      );
    }

    if (_hasError) {
      return Lottie.asset(
        widget.fallbackAsset,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        repeat: widget.repeat,
        errorBuilder: (context, error, stack) => Icon(
          Icons.broken_image_rounded,
          size: 32,
          color: AppColors.error.withValues(alpha: 0.5),
        ),
      );
    }

    if (_useAssetMode && _assetPath != null) {
      return Lottie.asset(
        _assetPath!,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        repeat: widget.repeat,
        errorBuilder: (context, error, stack) {
          return Lottie.asset(
            widget.fallbackAsset,
            width: widget.width,
            height: widget.height,
          );
        },
      );
    }

    if (_localFile != null) {
      return Lottie.file(
        _localFile!,
        width: widget.width,
        height: widget.height,
        fit: widget.fit,
        repeat: widget.repeat,
        errorBuilder: (context, error, stack) {
          return Lottie.asset(
            widget.fallbackAsset,
            width: widget.width,
            height: widget.height,
          );
        },
      );
    }

    return const SizedBox();
  }
}
