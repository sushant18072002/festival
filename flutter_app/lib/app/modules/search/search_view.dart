import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:ui';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../widgets/glass_container.dart';
import '../../data/models/event_model.dart';
import '../../data/models/image_model.dart';
import '../../data/providers/data_repository.dart';
import '../../routes/app_pages.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';

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

class SearchOracleView extends GetView<SearchController> {
  const SearchOracleView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Important for overlay effect
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Blur Background (The Veil)
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(color: Colors.black.withValues(alpha: 0.8)),
          ),

          // 2. Content
          SafeArea(
            child: Column(
              children: [
                // Header / Close
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Align(
                    alignment: Alignment.topRight,
                    child: IconButton(
                      onPressed: () => Get.back(),
                      icon: const Icon(
                        Icons.close,
                        color: Colors.white70,
                        size: 32,
                      ),
                    ),
                  ),
                ),

                const Spacer(flex: 1),

                // 3. The Oracle Input
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: Hero(
                          tag: 'search_bar_hero',
                          child: Material(
                            color: Colors.transparent,
                            child: TextField(
                              controller: controller.textController,
                              onChanged: controller.onSearchChanged,
                              autofocus: true,
                              style: AppTextStyles.headlineMedium.copyWith(
                                color: AppColors.primary,
                              ),
                              textAlign: TextAlign.center,
                              cursorColor: AppColors.primary,
                              decoration: InputDecoration(
                                hintText: 'Ask the Oracle...',
                                hintStyle: AppTextStyles.headlineMedium
                                    .copyWith(color: Colors.white24),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Obx(
                        () => GestureDetector(
                          onTap: controller.isListening.value
                              ? controller.stopListening
                              : controller.startListening,
                          behavior: HitTestBehavior.opaque,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: controller.isListening.value
                                  ? AppColors.error.withValues(alpha: 0.2)
                                  : Colors.transparent,
                              boxShadow: controller.isListening.value
                                  ? [
                                      BoxShadow(
                                        color: AppColors.error.withValues(
                                          alpha: 0.5,
                                        ),
                                        blurRadius: 20,
                                        spreadRadius: 5,
                                      ),
                                    ]
                                  : null,
                            ),
                            child:
                                Icon(
                                      controller.isListening.value
                                          ? Icons.mic
                                          : Icons.mic_none,
                                      color: controller.isListening.value
                                          ? AppColors.error
                                          : AppColors.primary,
                                      size: 28,
                                    )
                                    .animate(
                                      target: controller.isListening.value
                                          ? 1
                                          : 0,
                                    )
                                    .scaleXY(end: 1.2, duration: 400.ms)
                                    .shimmer(duration: 1000.ms),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Loading Indicator
                Obx(
                  () => controller.isSearching.value
                      ? Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                          ),
                        )
                      : const SizedBox(height: 16),
                ),

                const Spacer(flex: 1),

                // 4. Results (3D Fly-in)
                Expanded(
                  flex: 4,
                  child: Obx(() {
                    if (controller.searchQuery.isEmpty) {
                      return const SizedBox.shrink();
                    }

                    final results = controller.searchResults;
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final item = results[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _buildResultItem(item, index),
                        );
                      },
                    );
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultItem(dynamic item, int index) {
    // Determine type
    final isEvent = item is EventModel;
    final title = isEvent ? item.title : (item as ImageModel).displayLabel;
    final sub = isEvent ? item.location : 'Gallery Image';
    final image = isEvent
        ? (item.thumbnail ?? item.image?.url ?? '')
        : (item as ImageModel).thumbnail;

    return GlassContainer(
          color: Colors.white.withValues(alpha: 0.05),
          child: ListTile(
            contentPadding: const EdgeInsets.all(8),
            leading: Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: NetworkImage(image),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            title: Text(title, style: AppTextStyles.titleMedium),
            subtitle: Text(
              sub,
              style: AppTextStyles.bodySmall.copyWith(color: Colors.white54),
            ),
            trailing: Icon(
              Icons.arrow_forward_ios,
              color: AppColors.primary.withValues(alpha: 0.5),
              size: 16,
            ),
            onTap: () {
              if (isEvent) {
                Get.toNamed(Routes.EVENT_DETAILS, arguments: item);
              } else {
                Get.toNamed(Routes.IMAGE_DETAILS, arguments: item);
              }
            },
          ),
        )
        .animate(delay: (100 * index).ms)
        .fadeIn(duration: 400.ms)
        .slideY(
          begin: 0.2,
          end: 0,
          curve: Curves.easeOutBack,
        ) // Fly in from bottom
        .shimmer(
          delay: (400 + 100 * index).ms,
          duration: 1000.ms,
        ); // Neon shimmer scan
  }
}

class SearchBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SearchController>(() => SearchController());
  }
}
