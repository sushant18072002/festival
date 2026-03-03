import 'package:get/get.dart';
import '../../data/models/event_model.dart';
import '../../data/providers/data_repository.dart';

class EventDetailsController extends GetxController {
  final DataRepository _repo = Get.find<DataRepository>();

  final event = Rxn<EventModel>();
  final isLoading = false.obs;
  final errorMessage = ''.obs;
  final relatedEvents = <EventModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    ever(event, (EventModel? e) {
      if (e != null) _calculateRelatedEvents(e);
    });
    _loadEvent();
  }

  void _loadEvent() {
    final args = Get.arguments;

    if (args is EventModel) {
      event.value = args;
    } else if (args is Map && args.containsKey('slug')) {
      final slug = args['slug'];
      _fetchBySlug(slug);
    } else if (args is String) {
      // Direct slug string
      _fetchBySlug(args);
    } else {
      errorMessage.value = 'No event data found';
    }
  }

  void _fetchBySlug(String slug) async {
    isLoading.value = true;
    try {
      // 1. Fast path: check already-loaded in-memory list
      final cached = _repo.allEvents.firstWhereOrNull((e) => e.slug == slug);
      if (cached != null && cached.description.isNotEmpty) {
        event.value = cached;
        return;
      }

      // 2. Slow path: async lookup from asset catalog (covers cold-start deep links)
      final found = await _repo.getEventBySlug(slug);
      if (found != null) {
        event.value = found;
      } else {
        errorMessage.value = 'Event not found';
      }
    } catch (e) {
      errorMessage.value = 'Error loading event detail';
    } finally {
      isLoading.value = false;
    }
  }

  void _calculateRelatedEvents(EventModel current) {
    if (current.vibes.isEmpty &&
        current.tags.isEmpty &&
        current.category == null)
      return;

    final all = _repo.allEvents.where((e) => e.id != current.id).toList();
    all.sort((a, b) {
      int getScore(EventModel e) {
        int s = 0;
        for (var v in e.vibes) {
          if (current.vibes.any((cv) => cv.code == v.code)) s += 2;
        }
        for (var t in e.tags) {
          if (current.tags.any((ct) => ct.code == t.code)) s += 1;
        }
        if (e.category?.code == current.category?.code) s += 3;
        return s;
      }

      return getScore(b).compareTo(getScore(a));
    });

    relatedEvents.value = all.take(5).toList();
  }
}
