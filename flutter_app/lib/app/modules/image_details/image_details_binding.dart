import 'package:get/get.dart';
import '../favorites/favorites_controller.dart';

class ImageDetailsBinding extends Bindings {
  @override
  void dependencies() {
    // ImageDetailsView is a StatefulWidget — no separate controller.
    // We ensure FavoritesController is ready for the like/unlike button.
    if (!Get.isRegistered<FavoritesController>()) {
      Get.lazyPut<FavoritesController>(() => FavoritesController());
    }
  }
}
