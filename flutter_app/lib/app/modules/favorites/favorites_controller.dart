import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../data/providers/data_repository.dart';
import '../../data/models/event_model.dart';
import '../../data/models/image_model.dart';

class FavoritesController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();
  final _storage = GetStorage();

  final likedImageIds = <String>{}.obs;
  final likedEventIds = <String>{}.obs;

  List<EventModel> get favoriteEvents {
    // In a real app, efficient querying would be needed.
    // Here, we filter from all events.
    return _repository.events
        .where((e) => likedEventIds.contains(e.id))
        .toList();
  }

  List<ImageModel> get favoriteImages {
    return _repository.gallery
        .where((i) => likedImageIds.contains(i.id))
        .toList();
  }

  @override
  void onInit() {
    super.onInit();
    // Load persisted favorites
    final storedLikes = _storage.read<List<dynamic>>('liked_images');
    if (storedLikes != null) {
      likedImageIds.addAll(storedLikes.map((e) => e.toString()));
    }

    final storedEventLikes = _storage.read<List<dynamic>>('liked_events');
    if (storedEventLikes != null) {
      likedEventIds.addAll(storedEventLikes.map((e) => e.toString()));
    }

    // Listen to changes and persist
    ever(
      likedImageIds,
      (_) => _storage.write('liked_images', likedImageIds.toList()),
    );
    ever(
      likedEventIds,
      (_) => _storage.write('liked_events', likedEventIds.toList()),
    );
  }

  void toggleLike(String imageId) {
    if (likedImageIds.contains(imageId)) {
      likedImageIds.remove(imageId);
    } else {
      likedImageIds.add(imageId);
    }
    update(); // Force UI update if needed
  }

  void toggleEventLike(String eventId) {
    if (likedEventIds.contains(eventId)) {
      likedEventIds.remove(eventId);
    } else {
      likedEventIds.add(eventId);
    }
    update();
  }

  bool isLiked(String imageId) => likedImageIds.contains(imageId);
  bool isEventLiked(String eventId) => likedEventIds.contains(eventId);
}
