import 'package:get/get.dart';
import 'package:flutter/services.dart';
import '../../data/models/quote_model.dart';
import '../../data/providers/data_repository.dart';

class QuotesController extends GetxController {
  final _repo = Get.find<DataRepository>();

  final quotesList = <QuoteModel>[].obs;
  final isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    fetchQuotes();
  }

  void fetchQuotes() async {
    isLoading.value = true;

    // Simulate slight loading delay for effect
    await Future.delayed(const Duration(milliseconds: 600));

    // For now, load all available quotes from the repository.
    // Given the small size of text quotes, fetching all from cache is fine.
    // In a real app we might paginate or implement 'pull to refresh' from network.
    quotesList.assignAll(_repo.allQuotes);

    isLoading.value = false;
  }

  void shareQuote(QuoteModel quote) {
    HapticFeedback.selectionClick();
    // Simulate share delay
    Get.snackbar(
      'Sharing',
      'Preparing quote to share...',
      snackPosition: SnackPosition.BOTTOM,
      animationDuration: const Duration(milliseconds: 300),
    );
    // Real implementation would use SharePlus with Appinio Social Share
    // or generate an image of the quote dynamically.
  }

  void refreshQuotes() {
    HapticFeedback.lightImpact();
    // Shuffle or fetch fresh data
    final shuffled = List<QuoteModel>.from(_repo.allQuotes)..shuffle();
    quotesList.assignAll(shuffled);
  }
}
