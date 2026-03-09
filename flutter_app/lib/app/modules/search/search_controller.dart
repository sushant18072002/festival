import 'package:get/get.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter/material.dart' show TextEditingController;
import '../../data/providers/data_repository.dart';

class SearchController extends GetxController {
  final DataRepository _repo = Get.find<DataRepository>();

  final searchQuery = ''.obs;
  final searchResults = <dynamic>[].obs;
  final isSearching = false.obs;

  // Voice Search
  final textController = TextEditingController();
  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  final isListening = false.obs;
  final speechEnabled = false.obs;

  @override
  void onInit() {
    super.onInit();
    _initSpeech();
    _initTts();
    // Debounce: only search after user pauses typing for 350ms
    debounce(
      searchQuery,
      _performSearch,
      time: const Duration(milliseconds: 350),
    );
  }

  void _initSpeech() async {
    speechEnabled.value = await _speechToText.initialize();
  }

  void _initTts() async {
    await _flutterTts.setLanguage("en-IN");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setPitch(1.1);
  }

  void startListening() async {
    if (speechEnabled.value) {
      isListening.value = true;
      await _speechToText.listen(
        onResult: (result) {
          textController.text = result.recognizedWords;
          onSearchChanged(result.recognizedWords);
          if (result.finalResult) {
            isListening.value = false;
          }
        },
      );
    } else {
      Get.snackbar(
        'Microphone Disabled',
        'Please grant microphone permissions.',
      );
    }
  }

  void stopListening() async {
    isListening.value = false;
    await _speechToText.stop();
  }

  @override
  void onClose() {
    textController.dispose();
    super.onClose();
  }

  void onSearchChanged(String query) {
    searchQuery.value = query.trim();
    if (query.trim().isEmpty) {
      searchResults.clear();
      isSearching.value = false;
    } else {
      isSearching.value = true;
    }
  }

  void _performSearch(String query) {
    if (query.isEmpty) {
      searchResults.clear();
      isSearching.value = false;
      return;
    }

    final q = query.toLowerCase();

    final matchedEvents = _repo.allEvents.where((e) {
      return e.title.toLowerCase().contains(q) ||
          e.description.toLowerCase().contains(q) ||
          e.location.toLowerCase().contains(q) ||
          e.tags.any((t) => t.name.toLowerCase().contains(q)) ||
          e.vibes.any((v) => v.name.toLowerCase().contains(q)) ||
          (e.category?.name.toLowerCase().contains(q) ?? false);
    }).toList();

    final matchedImages = _repo.allImages.where((i) {
      return i.displayLabel.toLowerCase().contains(q) ||
          i.caption.toLowerCase().contains(q);
    }).toList();

    // Events first, then images, cap at 30 total for performance
    searchResults.value = [
      ...matchedEvents.take(20),
      ...matchedImages.take(10),
    ];

    isSearching.value = false;

    // Oracle feedback
    if (searchResults.isNotEmpty) {
      _flutterTts.speak("Found ${searchResults.length} matches.");
    } else {
      _flutterTts.speak("No matches found for that vibe.");
    }
  }
}
