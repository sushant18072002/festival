import 'package:get/get.dart';
import 'favorites_controller.dart';

class FavoritesBinding extends Bindings {
  @override
  void dependencies() {
    // FavoritesController is usually a permanent singleton registered in global.dart,
    // but we guard with isRegistered to be safe.
    if (!Get.isRegistered<FavoritesController>()) {
      Get.lazyPut<FavoritesController>(() => FavoritesController());
    }
  }
}
