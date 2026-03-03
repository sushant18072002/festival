import '../models/home_feed_model.dart';
import '../models/taxonomy_model.dart';
import '../models/calendar_model.dart';
import '../models/search_model.dart';
import '../models/event_model.dart';
import '../models/image_model.dart';
import '../models/greeting_model.dart';
import '../models/quote_model.dart';
import '../models/mantra_model.dart';
import '../models/quiz_model.dart';
import '../models/trivia_model.dart';
import '../models/gamification_config_model.dart';

abstract class DataSource {
  Future<void> init();
  Future<int> getVersion();
  Future<Map<String, dynamic>?>
  getDeployHealth(); // Returns { deploy_hash, deployed_at } or null
  Future<HomeFeed?> getHomeFeed(String lang);
  Future<Taxonomy?> getTaxonomy(String lang);
  Future<CalendarData?> getCalendarData(String lang);
  Future<List<SearchItem>?> getSearchIndex(String lang);
  Future<Map<String, EventModel>?> getEventsCatalog(String lang);
  Future<EventModel?> getEventBySlug(String slug, String lang);
  Future<Map<String, List<ImageModel>>?> getImageCatalog(String lang);
  Future<List<GreetingModel>?> getGreetings(String lang);
  Future<List<QuoteModel>?> getQuotes(String lang);
  Future<List<MantraModel>?> getMantras(String lang);
  Future<List<QuizModel>?> getQuizzes(String lang);
  Future<List<TriviaModel>?> getTrivia(String lang);
  Future<GamificationConfigModel?> getGamificationConfig(String lang);
}
