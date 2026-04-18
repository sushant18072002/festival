import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'dart:math' as math;
import '../../data/models/image_model.dart';
import '../../data/models/event_model.dart';
import '../../data/models/quote_model.dart';
import '../../data/models/mantra_model.dart';
import '../../data/models/quiz_model.dart';
import '../../data/models/trivia_model.dart';
import '../../data/models/taxonomy_model.dart';
import '../../data/providers/data_repository.dart';
import '../../routes/app_pages.dart';
import '../profile/profile_controller.dart';

class ExploreController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();

  final allImages = <ImageModel>[].obs;
  final filteredImages = <ImageModel>[].obs;

  final allEvents = <EventModel>[].obs;
  final filteredEvents = <EventModel>[].obs;

  final allQuotes = <QuoteModel>[].obs;
  final filteredQuotes = <QuoteModel>[].obs;

  final allMantras = <MantraModel>[].obs;
  final filteredMantras = <MantraModel>[].obs;

  final allQuizzes = <QuizModel>[].obs;
  final allTrivia = <TriviaModel>[].obs;

  final taxonomy = Rxn<Taxonomy>();

  final currentTab = 0.obs; // 0 = Visuals, 1 = Festivals, 2 = Wisdom, 3 = Play
  final searchQuery = ''.obs;

  // Phase 15 Filters
  final selectedCategory = ''.obs;
  final selectedVibe = ''.obs;
  final selectedFestival = ''.obs;
  final selectedSeason = ''.obs;
  final sortOption = 'newest'.obs; // newest, popular, liked, shared

  final isGridView = true.obs;
  void toggleViewMode() => isGridView.value = !isGridView.value;

  final isLoading = true.obs;
  final hasError = false.obs;

  final TextEditingController searchController = TextEditingController();

  @override
  void onInit() {
    super.onInit();

    // Initial fetch attempt
    Future.delayed(const Duration(milliseconds: 300), () {
      fetchData();
    });

    // Reactive streams: Automatically sync Explore when DataRepository finishes loading or updates in background without UI blocking spinners
    ever<List<EventModel>>(_repository.allEvents, (data) {
      if (data.isNotEmpty) {
        allEvents.value = data;
        filterItems();
      }
    });

    ever<List<ImageModel>>(_repository.allImages, (data) {
      if (data.isNotEmpty) {
        allImages.value = data;
        filterItems();
      }
    });

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
    final lang = _repository.currentLang.value;
    try {
      // Fetch Taxonomy for filters (using fast cache if available)
      if (_repository.currentTaxonomy != null) {
        taxonomy.value = _repository.currentTaxonomy;
      } else {
        final tax = await _repository.getTaxonomy(lang);
        if (tax != null) {
          taxonomy.value = tax;
        }
      }

      // Explicitly load Wisdom data (lazy loaded in repository)
      await Future.wait([
        _repository.getQuotes(lang),
        _repository.getMantras(lang),
      ]);

      // Load all available Resources
      allImages.value = _repository.gallery;
      allEvents.value = _repository.allEvents;
      allQuotes.value = _repository.allQuotes;
      allMantras.value = _repository.allMantras;

      // Load Quiz & Trivia for Play tab
      final quizzes = await _repository.getQuizzes(lang);
      if (quizzes != null) allQuizzes.value = quizzes;
      final trivia = await _repository.getTrivia(lang);
      if (trivia != null) allTrivia.value = trivia;

      filteredImages.value = allImages.toList();
      filteredEvents.value = allEvents.toList();
      filteredQuotes.value = allQuotes.toList();
      filteredMantras.value = allMantras.toList();

      // Trigger sorting and categorizing
      filterItems();

      // If everything failed to load entirely, flag an error
      if (allImages.isEmpty &&
          allEvents.isEmpty &&
          allQuotes.isEmpty &&
          allMantras.isEmpty) {
        hasError.value = true;
      }
    } catch (e) {
      debugPrint('Error fetching explore data: $e');
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
        final catMatch = img.categories.any(
          (c) => c.toLowerCase().contains(query),
        );
        final tagMatch = img.tags.any((t) => t.toLowerCase().contains(query));
        return titleMatch || catMatch || tagMatch;
      }).toList();
    }

    // 2. Tags/Vibes Filter
    if (selectedVibe.isNotEmpty) {
      items = items
          .where((img) => img.tags.contains(selectedVibe.value))
          .toList();
    }

    // 3. Category Filter
    if (selectedCategory.isNotEmpty) {
      final selectedCatLower = selectedCategory.value.toLowerCase();

      // Find all event IDs/slugs that match this category
      final eventsInCat = allEvents
          .where((e) => e.category?.code.toLowerCase() == selectedCatLower)
          .toList();

      // Gather all image IDs that belong to those events
      final validImageIds = eventsInCat.expand((e) => e.images).toSet();

      items = items.where((img) {
        if (img.categories.any((c) => c.toLowerCase() == selectedCatLower)) {
          return true;
        }
        if (img.tags.any((v) => v.toLowerCase() == selectedCatLower)) {
          return true;
        }
        if (img.standaloneCategory?.toLowerCase() == selectedCatLower) {
          return true;
        }
        // Images that belong to an event of this category
        if (validImageIds.contains(img.id)) {
          return true;
        }
        return false;
      }).toList();
    }

    // 4. Festival Filter — find the event and check its images list
    if (selectedFestival.isNotEmpty) {
      final targetEvent = allEvents.firstWhereOrNull(
        (e) =>
            e.slug == selectedFestival.value || e.id == selectedFestival.value,
      );

      final eventImageIds = targetEvent?.images.toSet() ?? {};

      items = items
          .where(
            (img) =>
                eventImageIds.contains(img.id) ||
                img.standaloneCategory ==
                    selectedFestival.value, // Fallback for pure standalone
          )
          .toList();
    }

    // 5. Sort Images — using real backend stats
    switch (sortOption.value) {
      case 'popular':
        items.sort((a, b) => b.downloadsCount.compareTo(a.downloadsCount));
        break;
      case 'liked':
        items.sort((a, b) => b.likesCount.compareTo(a.likesCount));
        break;
      case 'shared':
        items.sort((a, b) => b.sharesCount.compareTo(a.sharesCount));
        break;
      // 'newest' preserves natural catalog order (no sort needed)
    }

    // Apply Time-of-Day Boost ONLY if no active explicit filters
    if (searchQuery.isEmpty &&
        selectedVibe.isEmpty &&
        selectedCategory.isEmpty &&
        selectedFestival.isEmpty &&
        sortOption.value == 'newest') {
      _applyTimeOfDayBoost(items);
    }
    filteredImages.value = items;

    // Filter Events
    var eventList = allEvents.toList();
    if (searchQuery.isNotEmpty) {
      final query = searchQuery.value.toLowerCase();
      eventList = eventList.where((e) {
        return (e.title.toLowerCase().contains(query)) ||
            (e.description.toLowerCase().contains(query));
      }).toList();
    }
    if (selectedCategory.isNotEmpty) {
      final selectedCatLower = selectedCategory.value.toLowerCase();
      eventList = eventList
          .where((e) => e.category?.code.toLowerCase() == selectedCatLower)
          .toList();
    }

    // Filter Quotes & Mantras
    var quoteList = allQuotes.toList();
    var mantraList = allMantras.toList();

    if (searchQuery.isNotEmpty) {
      final query = searchQuery.value.toLowerCase();
      quoteList = quoteList.where((q) {
        return q.text.toLowerCase().contains(query) ||
            q.author.toLowerCase().contains(query);
      }).toList();
      mantraList = mantraList.where((m) {
        return m.text.toLowerCase().contains(query) ||
            m.meaning.toLowerCase().contains(query);
      }).toList();
    }

    if (selectedCategory.isNotEmpty) {
      final selectedCatLower = selectedCategory.value.toLowerCase();

      quoteList = quoteList.where((q) {
        if (q.category?.code.toLowerCase() == selectedCatLower) {
          return true;
        }
        if (q.vibes.any((v) => v.code.toLowerCase() == selectedCatLower)) {
          return true;
        }
        return false;
      }).toList();

      mantraList = mantraList.where((m) {
        if (m.category?.code.toLowerCase() == selectedCatLower) {
          return true;
        }
        if (m.vibes.any((v) => v.code.toLowerCase() == selectedCatLower)) {
          return true;
        }
        return false;
      }).toList();
    }

    filteredEvents.value = eventList;
    filteredQuotes.value = quoteList;
    filteredMantras.value = mantraList;
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
        // Use tags field (vibes removed, tags contains the same semantic data)
        bool aMatches = a.tags.any(
          (v) => targetVibes.contains(v.toLowerCase()),
        );
        bool bMatches = b.tags.any(
          (v) => targetVibes.contains(v.toLowerCase()),
        );

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
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
      Get.toNamed(Routes.imageDetails, arguments: randomImage);
    }
  }

  void navigateToDetails(ImageModel item) {
    Get.toNamed(Routes.imageDetails, arguments: item);
  }
}
