part of 'app_pages.dart';

abstract class Routes {
  Routes._();
  static const home = _Paths.home;
  static const calendar = _Paths.calendar;
  static const explore = _Paths.explore;
  static const settings = _Paths.settings;
  static const dashboard = _Paths.dashboard;
  static const initialLoad = _Paths.initialLoad;
  static const eventDetails = _Paths.eventDetails;
  static const imageDetails = _Paths.imageDetails;
  static const favorites = _Paths.favorites;
  static const search = _Paths.search;
  static const profile = _Paths.profile;
  static const recap = _Paths.recap;
  static const onboarding = _Paths.onboarding;
  static const quoteDetails = _Paths.quoteDetails;
  static const mantraDetails = _Paths.mantraDetails;
  static const privacyPolicy = _Paths.privacyPolicy;
  static const termsOfService = _Paths.termsOfService;
  static const quiz = _Paths.quiz;
}

abstract class _Paths {
  _Paths._();
  static const home = '/home';
  static const calendar = '/calendar';
  static const explore = '/explore';
  static const settings = '/settings';
  static const dashboard = '/dashboard';
  static const initialLoad = '/initial_load';
  static const eventDetails = '/event-details';
  static const imageDetails = '/image-details';
  static const favorites = '/favorites';
  static const search = '/search';
  static const profile = '/profile';
  static const recap = '/recap';
  static const onboarding = '/onboarding';
  static const quoteDetails = '/quote-details';
  static const mantraDetails = '/mantra-details';
  static const privacyPolicy = '/privacy-policy';
  static const termsOfService = '/terms-of-service';
  static const quiz = '/quiz';
}
