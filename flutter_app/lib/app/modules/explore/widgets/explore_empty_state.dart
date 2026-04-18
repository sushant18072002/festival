import 'package:flutter/material.dart';
import '../../../widgets/void_empty_state.dart';

class ExploreEmptyState extends StatelessWidget {
  const ExploreEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return const VoidEmptyState(
      message: "The void yielded nothing",
      subMessage: "Try searching for 'Light' or 'Music'",
    );
  }
}
