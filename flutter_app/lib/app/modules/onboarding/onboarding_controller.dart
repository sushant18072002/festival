import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../routes/app_pages.dart';
import '../../data/services/notification_service.dart';
import '../profile/profile_controller.dart';

class OnboardingController extends GetxController {
  final pageController = PageController();
  final currentPage = 0.obs;
  final _storage = GetStorage();

  @override
  void onClose() {
    pageController.dispose();
    super.onClose();
  }

  void onPageChanged(int index) {
    currentPage.value = index;
  }

  void nextPage() {
    if (currentPage.value < 3) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void skip() {
    pageController.animateToPage(
      3,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  void completeOnboarding() {
    _storage.write('is_first_launch', false);

    // Grant initial karma for starting the app journey
    if (Get.isRegistered<ProfileController>()) {
      Get.find<ProfileController>().addKarma(50, 'Welcome to Utsav');
    }

    // Request notification permission after onboarding — this is the right UX moment
    NotificationService.instance.requestPermission();

    Get.offAllNamed(Routes.dashboard);
  }
}
