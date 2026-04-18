import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class BaseScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final bool useGradient;

  const BaseScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.useGradient = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: appBar,
      body: Container(
        decoration: useGradient
            ? const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [AppColors.backgroundLight, Colors.white],
                  stops: [0.0, 0.3],
                ),
              )
            : null,
        child: Stack(
          children: [
            // Decorative Background Elements
            if (useGradient)
              Positioned(
                top: -100,
                right: -100,
                child: Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryAdaptive(context).withValues(alpha: 0.2),
                        blurRadius: 100,
                        spreadRadius: 50,
                      ),
                    ],
                  ),
                ),
              ),

            // Main Body
            appBar != null
                ? Padding(
                    padding: EdgeInsets.only(
                      top: MediaQuery.of(context).padding.top + kToolbarHeight,
                    ),
                    child: body,
                  )
                : SafeArea(top: true, child: body),
          ],
        ),
      ),
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
    );
  }
}
