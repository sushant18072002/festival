import 'package:get/get.dart';
import '../../data/providers/data_repository.dart';

class DashboardController extends GetxController {
  final currentIndex = 0.obs;

  /// Mirrors DataRepository.currentLang so any Obx in DashboardView that
  /// reads this will rebuild when the user switches language.
  RxString get currentLang => Get.find<DataRepository>().currentLang;

  void changePage(int index) {
    currentIndex.value = index;
  }
}
