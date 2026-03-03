import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'dart:math' as math;
import '../../data/models/image_model.dart';
import '../../data/models/taxonomy_model.dart';
import '../../data/providers/data_repository.dart';
import '../../routes/app_pages.dart';
import '../profile/profile_controller.dart';

class GalleryController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();

  final allImages = <ImageModel>[].obs;
  final filteredImages = <ImageModel>[].obs;
  final taxonomy = Rxn<Taxonomy>();

  final currentTab = 0.obs; // 0 = Explore, 1 = Collections
  final searchQuery = ''.obs;

  // Phase 15 Filters
  final selectedCategory = ''.obs;
  final selectedVibe = ''.obs;
  final selectedFestival = ''.obs;
  final selectedSeason = ''.obs;
  final sortOption = 'newest'.obs; // newest, popular, liked, shared

  final isLoading = true.obs;
  final hasError = false.obs;

  final TextEditingController searchController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    fetchData();

    // Debounce search
    debounce(
      searchQuery,
      (_) => filterItems(),
      time: const Duration(milliseconds: 300),
    );
  }

  Future<void> fetchData() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      // Fetch Taxonomy for filters
      final tax = await _repository.getTaxonomy('en');
      if (tax != null) {
        taxonomy.value = tax;
      }

      // Load Images
      allImages.value = _repository.gallery;

      if (allImages.isEmpty) {
        hasError.value = true;
      } else {
        filteredImages.value = allImages.toList();
        // Initial Filter
        filterItems();
      }
    } catch (e) {
      debugPrint('Error fetching gallery data: $e');
      hasError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  void filterItems() {
    var items = allImages.toList();

    // 1. Text Search
    if (searchQuery.isNotEmpty) {
      final query = searchQuery.value.toLowerCase();
      items = items.where((img) {
        final titleMatch = img.displayLabel.toLowerCase().contains(query);
        final festivalMatch =
            img.eventId?.toLowerCase().contains(query) ?? false;
        final tagsMatch = img.vibes.any((t) => t.toLowerCase().contains(query));
        return titleMatch || festivalMatch || tagsMatch;
      }).toList();
    }

    // 2. Vibes Filter
    if (selectedVibe.isNotEmpty) {
      items = items
          .where((img) => img.vibes.contains(selectedVibe.value))
          .toList();
    }

    // 3. Category Filter
    if (selectedCategory.isNotEmpty) {
      // Not strongly tied to images yet in DB, but checking tags as fallback
      items = items
          .where((img) => img.vibes.contains(selectedCategory.value))
          .toList();
    }

    // 4. Festival Filter
    if (selectedFestival.isNotEmpty) {
      items = items
          .where((img) => img.eventId == selectedFestival.value)
          .toList();
    }

    // 5. Apply Smart Sort
    if (sortOption.value == 'newest') {
      items.sort(
        (a, b) => (b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0))
            .compareTo(a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0)),
      );
    } else if (sortOption.value == 'popular') {
      // Popular = High Downloads
      items.sort((a, b) => b.downloads.compareTo(a.downloads));
    } else if (sortOption.value == 'liked') {
      items.sort((a, b) => b.likes.compareTo(a.likes));
    } else if (sortOption.value == 'shared') {
      items.sort((a, b) => b.shares.compareTo(a.shares));
    }

    // Apply Time-of-Day Boost ONLY if no active explicit filters
    if (searchQuery.isEmpty &&
        selectedVibe.isEmpty &&
        selectedFestival.isEmpty &&
        sortOption.value == 'newest') {
      _applyTimeOfDayBoost(items);
    }

    filteredImages.value = items;
  }

  void _applyTimeOfDayBoost(List<ImageModel> items) {
    final hour = DateTime.now().hour;
    List<String> targetVibes = [];

    if (hour >= 5 && hour < 12) {
      targetVibes = ['spiritual', 'peaceful', 'morning', 'puja', 'serene'];
    } else if (hour >= 18 && hour <= 23) {
      targetVibes = [
        'high-energy',
        'party',
        'night',
        'lights',
        'aarti',
        'concert',
      ];
    }

    if (targetVibes.isNotEmpty) {
      items.sort((a, b) {
        bool aMatches = a.vibes.any(
          (v) => targetVibes.contains(v.toLowerCase()),
        );
        bool bMatches = b.vibes.any(
          (v) => targetVibes.contains(v.toLowerCase()),
        );

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0; // Keep original order if both match or both don't
      });
    }
  }

  void clearFilters() {
    searchController.clear();
    searchQuery.value = '';
    selectedCategory.value = '';
    selectedVibe.value = '';
    selectedFestival.value = '';
    sortOption.value = 'newest';
    filterItems();
  }

  Future<void> surpriseMe() async {
    HapticFeedback.heavyImpact();
    // Add Karma
    if (Get.isRegistered<ProfileController>()) {
      Get.find<ProfileController>().addKarma(3, 'Feeling Lucky');
    }

    if (allImages.isNotEmpty) {
      final random = math.Random();
      final randomImage = allImages[random.nextInt(allImages.length)];
      Get.toNamed(Routes.IMAGE_DETAILS, arguments: randomImage);
    }
  }

  void navigateToDetails(ImageModel item) {
    Get.toNamed(Routes.IMAGE_DETAILS, arguments: item);
  }
}
