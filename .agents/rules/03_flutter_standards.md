# Estándares de Ingeniería Flutter y Dart

## 1. Dart 3 Moderno
- Usar constructores concisos (`ClassName(this.param);`) y parámetros nombrados obligatorios (`required`).
- Usar **Pattern Matching** y expresiones `switch` exhaustivas en enums y sealed classes.
- Usar **Records** para retornos múltiples livianos en lugar de clases intermedias innecesarias.

## 2. Gestión de Estado y Arquitectura
- **Riverpod 2.x:**
  - Usar anotaciones de `@riverpod` con generación de código (`riverpod_generator`).
  - Utilizar `AsyncNotifier` para estados asíncronos con manejo automático de `loading`, `error` y `data`.
  - Inmutabilidad de modelos con `@freezed`.
- **Organización de Features:**
  - `features/<feature_name>/domain/` (Models, Repositories interfaces)
  - `features/<feature_name>/data/` (Datasources, Repositories impl, DTOs)
  - `features/<feature_name>/presentation/` (Controllers/Providers, Screens, Widgets)

## 3. Rendimiento de UI
- Usar `const` en todos los constructores de widgets constantes.
- Evitar `MediaQuery.of(context)` en widgets grandes; extraer a subwidgets o usar `MediaQuery.sizeOf(context)` para evitar rebuilds globales.
- Usar `ListView.builder` con `itemExtent` o `prototypeItem` para listas largas.
- Mantener animaciones fluidas a 60/120 FPS sin bloqueos en el UI thread.
