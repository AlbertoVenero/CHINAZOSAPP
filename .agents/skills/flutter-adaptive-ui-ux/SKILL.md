---
name: flutter-adaptive-ui-ux
description: Construye interfaces de usuario adaptativas y responsivas en Flutter (Mobile, Tablet, Desktop, Web) con ThemeExtensions, Material 3, micro-animaciones fluidas y accesibilidad (Semantics). Usar para diseño UI/UX Flutter.
---

# Flutter Adaptive UI/UX Builder

Este skill guía la creación de interfaces consistentes, estéticas y adaptables en Flutter.

## Sistema de Breakpoints Adaptativos

```dart
import 'package:flutter/material.dart';

enum DeviceScreenType { mobile, tablet, desktop }

class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  static DeviceScreenType getDeviceType(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width >= 1024) return DeviceScreenType.desktop;
    if (width >= 600) return DeviceScreenType.tablet;
    return DeviceScreenType.mobile;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1024 && desktop != null) {
          return desktop!;
        }
        if (constraints.maxWidth >= 600 && tablet != null) {
          return tablet!;
        }
        return mobile;
      },
    );
  }
}
```

## ThemeExtension para Tokens de Marca Personalizados
```dart
class AppCustomColors extends ThemeExtension<AppCustomColors> {
  final Color badgeBackground;
  final Color statusSuccess;

  const AppCustomColors({
    required this.badgeBackground,
    required this.statusSuccess,
  });

  @override
  AppCustomColors copyWith({Color? badgeBackground, Color? statusSuccess}) {
    return AppCustomColors(
      badgeBackground: badgeBackground ?? this.badgeBackground,
      statusSuccess: statusSuccess ?? this.statusSuccess,
    );
  }

  @override
  AppCustomColors lerp(ThemeExtension<AppCustomColors>? other, double t) {
    if (other is! AppCustomColors) return this;
    return AppCustomColors(
      badgeBackground: Color.lerp(badgeBackground, other.badgeBackground, t)!,
      statusSuccess: Color.lerp(statusSuccess, other.statusSuccess, t)!,
    );
  }
}
```
