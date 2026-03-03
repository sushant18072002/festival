import 'package:get/get.dart';
import 'event_details_controller.dart';

class EventDetailsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<EventDetailsController>(() => EventDetailsController());
  }
}
