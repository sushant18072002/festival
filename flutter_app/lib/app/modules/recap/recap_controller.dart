import 'package:get/get.dart';
import '../profile/profile_controller.dart';

class RecapController extends GetxController {
  final ProfileController _profileController = Get.find<ProfileController>();

  final currentSlideIndex = 0.obs;

  int get totalCheckins => _profileController.festivalsExplored.value;
  int get totalKarma => _profileController.karmaPoints.value;
  int get topStreak => _profileController.currentStreak.value;

  void nextSlide() {
    if (currentSlideIndex.value < 3) {
      currentSlideIndex.value++;
    } else {
      Get.back(); // End of recap
    }
  }

  void previousSlide() {
    if (currentSlideIndex.value > 0) {
      currentSlideIndex.value--;
    }
  }
}
