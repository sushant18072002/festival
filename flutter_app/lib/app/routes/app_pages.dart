import 'package:get/get.dart';
import '../modules/event_details/event_details_view.dart';
import '../modules/home/home_binding.dart';
import '../modules/home/home_view.dart';
import '../modules/calendar/calendar_binding.dart';
import '../modules/calendar/calendar_view.dart';
import '../modules/explore/explore_binding.dart';
import '../modules/explore/explore_view.dart';
import '../modules/dashboard/dashboard_view.dart';
import '../modules/initial/initial_load_view.dart';
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
import '../modules/quotes/quote_detail_view.dart';
import '../modules/mantras/mantra_details_view.dart';
import '../modules/legal/privacy_policy_view.dart';
import '../modules/legal/terms_of_service_view.dart';
import '../modules/home/widgets/quiz_view.dart';
import '../theme/app_animations.dart';

part 'app_routes.dart';

class AppPages {
  AppPages._();

  // ignore: constant_identifier_names
  static const INITIAL = Routes.initialLoad;

  /// Default page transition for the app
  static const _defaultTransition = Transition.fadeIn;
  static const _defaultDuration = Duration(milliseconds: 300);
  static final _defaultCurve = AppAnimations.smooth;

  static final routes = [
    // ─────────────────────────────────────────────────────────────────────────
    // Main Tabs (accessed via Dashboard)
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.home,
      page: () => const HomeView(),
      binding: HomeBinding(),
      transition: _defaultTransition,
      transitionDuration: _defaultDuration,
      curve: _defaultCurve,
    ),
    GetPage(
      name: _Paths.calendar,
      page: () => const CalendarView(),
      binding: CalendarBinding(),
      transition: _defaultTransition,
      transitionDuration: _defaultDuration,
      curve: _defaultCurve,
    ),
    GetPage(
      name: _Paths.explore,
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
      name: _Paths.dashboard,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 400),
    ),

    // ─────────────────────────────────────────────────────────────────────────
    // Initial Load / Splash
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.initialLoad,
      page: () => const InitialLoadView(),
      transition: Transition.fade,
    ),

    // ─────────────────────────────────────────────────────────────────────────
    // Detail Screens (with premium transitions)
    // ─────────────────────────────────────────────────────────────────────────
    GetPage(
      name: _Paths.eventDetails,
      page: () => const EventDetailsView(),
      binding: EventDetailsBinding(),
      transition: Transition.cupertino, // Slide from right with parallax
      transitionDuration: const Duration(milliseconds: 350),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.imageDetails,
      page: () => const ImageDetailsView(),
      transition: Transition.zoom, // Zoom in for full-screen image
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.quick,
    ),
    GetPage(
      name: _Paths.favorites,
      page: () => const FavoritesView(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.profile,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
      transition: Transition.downToUp,
      transitionDuration: const Duration(milliseconds: 400),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.settings,
      page: () => const SettingsView(),
      binding: SettingsBinding(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.search,
      page: () => const SearchOracleView(),
      binding: SearchBinding(),
      transition: Transition.fadeIn, // Fade in for overlay effect
      opaque:
          false, // Important for overlay if we want to see behind (though I used backdrop filter, better to be opaque usually if full screen, but 'false' allows hero + transparency if scaffold is transparent)
      transitionDuration: const Duration(milliseconds: 500),
    ),
    GetPage(
      name: _Paths.recap,
      page: () => const RecapView(),
      binding: RecapBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 600),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.onboarding,
      page: () => const OnboardingView(),
      binding: OnboardingBinding(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 500),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.quoteDetails,
      page: () => QuoteDetailView(quote: Get.arguments),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 400),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.mantraDetails,
      page: () => MantraDetailsView(mantra: Get.arguments),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 400),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.privacyPolicy,
      page: () => const PrivacyPolicyView(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.termsOfService,
      page: () => const TermsOfServiceView(),
      transition: Transition.cupertino,
      transitionDuration: const Duration(milliseconds: 300),
      curve: AppAnimations.smooth,
    ),
    GetPage(
      name: _Paths.quiz,
      page: () => const QuizView(),
      transition: Transition.fadeIn,
      transitionDuration: const Duration(milliseconds: 400),
      curve: AppAnimations.smooth,
    ),
  ];
}
