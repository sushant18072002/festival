import 'dart:async';
import 'package:flutter/material.dart';
import '../../../data/models/event_model.dart';
import 'hero_banner.dart';
import '../../../theme/app_colors.dart';

class AutoRotatingCarousel extends StatefulWidget {
  final List<EventModel> events;

  const AutoRotatingCarousel({super.key, required this.events});

  @override
  State<AutoRotatingCarousel> createState() => _AutoRotatingCarouselState();
}

class _AutoRotatingCarouselState extends State<AutoRotatingCarousel> {
  late final PageController _pageController;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);

    if (widget.events.length > 1) {
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_pageController.hasClients) {
        int nextPage = _currentPage + 1;
        if (nextPage >= widget.events.length) {
          nextPage = 0;
          _pageController.animateToPage(
            nextPage,
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOutCubic,
          );
        } else {
          _pageController.animateToPage(
            nextPage,
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutQuart,
          );
        }
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.events.isEmpty) return const SizedBox.shrink();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 260,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (idx) {
              setState(() {
                _currentPage = idx;
              });
            },
            itemCount: widget.events.length,
            itemBuilder: (context, index) {
              // Add a slight scale effect for inactive pages
              return AnimatedBuilder(
                animation: _pageController,
                builder: (context, child) {
                  double value = 1.0;
                  if (_pageController.position.haveDimensions) {
                    value = _pageController.page! - index;
                    value = (1 - (value.abs() * 0.1)).clamp(0.0, 1.0);
                  }
                  return Transform.scale(scale: value, child: child);
                },
                child: HeroBanner(
                  event: widget.events[index],
                  heroTagPrefix: 'home_carousel',
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        // Dots Indicator
        if (widget.events.length > 1)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              widget.events.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _currentPage == index ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _currentPage == index
                      ? AppColors.primaryAdaptive(context)
                      : AppColors.textAdaptiveSecondary(context).withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
