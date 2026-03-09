import 'package:get/get.dart';
import '../modules/home/home_binding.dart';
import '../modules/home/home_view.dart';
import '../modules/calendar/calendar_binding.dart';
import '../modules/calendar/calendar_view.dart';
import '../modules/explore/explore_binding.dart';
import '../modules/explore/explore_view.dart';
import '../modules/dashboard/dashboard_view.dart';
import '../modules/initial/initial_load_view.dart';
import '../modules/event_details/event_details_view.dart';
import '../modules/event_details/event_details_binding.dart';
import '../modules/image_details/image_details_view.dart';
import '../modules/favorites/favorites_view.dart';
import '../modules/settings/settings_view.dart';
import '../modules/settings/settings_binding.dart';
import '../modules/search/search_binding.dart';
import '../modules/search/search_view.dart';
import '../modules/profile/profile_view.dart';
import '../modules/profile/profile_binding.dart';
import '../modules/recap/recap_view.dart';
import '../modules/recap/recap_binding.dart';
import '../modules/onboarding/onboarding_view.dart';
import '../modules/onboarding/onboarding_binding.dart';
import '../theme/app_animations.dart';

part 'app_routes.dart';

class AppPages {
  AppPages._();

  static const INITIAL = Routes.INITIAL_LOAD;

  /// Default page transition for the app
  static const _defaultTransition = Transition.fadeIn;
  static const _defaultDuration = Duration(milliseconds: 300);
  static final _defaultCurve = AppAnimations.smooth;

  static final routes = [
    // ─────────────────────────────────────────────────────────────────────────
    // Main Tabs (accessed via Dashboard)
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
      transition: _defaultTransition,
      transitionDuration: _defaultDuration,
      curve: _defaultCurve,
    ),
    GetPage(
      name: _Paths.CALENDAR,
      page: () => const CalendarView(),
      binding: CalendarBinding(),
      transition: _defaultTransition,
      transitionDuration: _defaultDuration,
      curve: _defaultCurve,
    ),
    GetPage(
      name: _Paths.EXPLORE,
      page: () => const ExploreView(),
      binding: ExploreBinding(),
      transition: _defaultTransition,
      transitionDuration: _defaultDuration,
      curve: _defaultCurve,
    ),

    // ─────────────────────────────────────────────────────────────────────────
    // Dashboard (Root)
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.DASHBOARD,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 400),
    ),

    // ─────────────────────────────────────────────────────────────────────────
    // Initial Load / Splash
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.INITIAL_LOAD,
      page: () => const InitialLoadView(),
      transition: Transition.fade,
    ),

    // ─────────────────────────────────────────────────────────────────────────
    // Detail Screens (with premium transitions)
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.EVENT_DETAILS,
      page: () => const EventDetailsView(),
      binding: EventDetailsBinding(),
      transition: Transition.cupertino, // Slide from right with parallax
      transitionDuration: const Duration(milliseconds: 350),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.IMAGE_DETAILS,
      page: () => const ImageDetailsView(),
      transition: Transition.zoom, // Zoom in for full-screen image
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.quick,
    ),
    GetPage(
      name: _Paths.FAVORITES,
      page: () => const FavoritesView(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.PROFILE,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
      transition: Transition.downToUp,
      transitionDuration: const Duration(milliseconds: 400),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.SETTINGS,
      page: () => const SettingsView(),
      binding: SettingsBinding(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.SEARCH,
      page: () => const SearchOracleView(),
      binding: SearchBinding(),
      transition: Transition.fadeIn, // Fade in for overlay effect
      opaque:
          false, // Important for overlay if we want to see behind (though I used backdrop filter, better to be opaque usually if full screen, but 'false' allows hero + transparency if scaffold is transparent)
      transitionDuration: const Duration(milliseconds: 500),
    ),
    GetPage(
      name: _Paths.RECAP,
      page: () => const RecapView(),
      binding: RecapBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 600),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.ONBOARDING,
      page: () => const OnboardingView(),
      binding: OnboardingBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 500),
      curve: AppAnimations.smooth,
    ),
  ];
}
