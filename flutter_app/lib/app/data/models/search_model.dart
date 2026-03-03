class SearchItem {
  final String id;
  final String title;
  final String category;
  final List<String> vibes;
  final List<String> keywords;
  final String searchString;
  final String? thumbnail;
  final String location;
  final String date;

  SearchItem({
    required this.id,
    required this.title,
    required this.category,
    required this.vibes,
    required this.keywords,
    required this.searchString,
    this.thumbnail,
    this.location = '',
    this.date = '',
  });

  factory SearchItem.fromJson(Map<String, dynamic> json) {
    return SearchItem(
      id: json['id'] ?? '',
      title: json['t'] ?? '',
      category: json['c'] ?? '',
      vibes: (json['v'] as List?)?.map((e) => e.toString()).toList() ?? [],
      keywords: (json['k'] as List?)?.map((e) => e.toString()).toList() ?? [],
      searchString: json['s'] ?? '',
      thumbnail: json['i'],
      location: json['l'] ?? 'Festival Grounds',
      date: json['d'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      't': title,
      'c': category,
      'v': vibes,
      'k': keywords,
      's': searchString,
      'i': thumbnail,
      'l': location,
      'd': date,
    };
  }
}
