part of 'app_pages.dart';

abstract class Routes {
  Routes._();
  static const HOME = _Paths.HOME;
  static const CALENDAR = _Paths.CALENDAR;
  static const EXPLORE = _Paths.EXPLORE;
  static const SETTINGS = _Paths.SETTINGS;
  static const DASHBOARD = _Paths.DASHBOARD;
  static const INITIAL_LOAD = _Paths.INITIAL_LOAD;
  static const EVENT_DETAILS = _Paths.EVENT_DETAILS;
  static const IMAGE_DETAILS = _Paths.IMAGE_DETAILS;
  static const FAVORITES = _Paths.FAVORITES;
  static const SEARCH = _Paths.SEARCH;
  static const PROFILE = _Paths.PROFILE;
  static const RECAP = _Paths.RECAP;
  static const ONBOARDING = _Paths.ONBOARDING;
}

abstract class _Paths {
  _Paths._();
  static const HOME = '/home';
  static const CALENDAR = '/calendar';
  static const EXPLORE = '/explore';
  static const SETTINGS = '/settings';
  static const DASHBOARD = '/dashboard';
  static const INITIAL_LOAD = '/initial_load';
  static const EVENT_DETAILS = '/event-details';
  static const IMAGE_DETAILS = '/image-details';
  static const FAVORITES = '/favorites';
  static const SEARCH = '/search';
  static const PROFILE = '/profile';
  static const RECAP = '/recap';
  static const ONBOARDING = '/onboarding';
}
