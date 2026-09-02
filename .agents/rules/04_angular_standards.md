# Estándares de Angular Moderno

## 1. Componentes Standalone y Control Flow
- Prohibido crear NgModules en código nuevo; usar `standalone: true`.
- Utilizar el nuevo control flow nativo:
  ```html
  @if (user(); as u) {
    <p>Bienvenido, {{ u.name }}</p>
  } @else {
    <p>Inicie sesión</p>
  }

  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  } @empty {
    <p>No hay elementos disponibles.</p>
  }
  ```

## 2. Reactividad con Signals
- Gestionar el estado local con `signal()` y valores derivados con `computed()`.
- Usar `input()`, `output()` y `model()` basados en signals en lugar de `@Input()` y `@Output()`.
- Usar `ChangeDetectionStrategy.OnPush` en el 100% de los componentes.
- Utilizar `toSignal()` para interoperar con Observables de RxJS cuando sea necesario.

## 3. Optimización y Carga Diferida
- Implementar `@defer (on viewport)` o `@defer (on idle)` en componentes visualmente pesados o debajo del pliegue (below the fold) para mejorar el First Contentful Paint (FCP) y LCP.
