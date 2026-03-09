import 'package:get/get.dart';
import 'dashboard_controller.dart';
import '../home/home_controller.dart';
import '../calendar/calendar_controller.dart';
import '../explore/explore_controller.dart';
import '../quotes/quotes_controller.dart';
import '../settings/settings_controller.dart';
import '../profile/profile_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<CalendarController>(() => CalendarController());
    Get.lazyPut<ExploreController>(() => ExploreController());
    Get.lazyPut<QuotesController>(() => QuotesController());
    Get.lazyPut<SettingsController>(() => SettingsController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
