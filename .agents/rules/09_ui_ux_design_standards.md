# Estándares de Diseño UI/UX (Flutter y Web)

## 1. Accesibilidad (a11y) y WCAG 2.2 AA
- Contraste de color mínimo de 4.5:1 para texto normal y 3:1 para texto grande / elementos de UI esenciales.
- Enriquecer elementos con etiquetas semánticas (`aria-label`, `<button>`, `Semantics` en Flutter).
- Toda acción accesible mediante ratón debe ser 100% operable mediante teclado (Tab, Enter, Escape, Flechas).
- Mantener estilos visibles de `:focus-visible` para accesibilidad de teclado.

## 2. Sistemas de Diseño y Tokens
- Centralizar colores, tipografías, elevaciones, bordes y espaciados en tokens de diseño reutilizables.
- Soportar Modo Claro y Modo Oscuro (*Dark / Light Mode*) a través de variables CSS o `ThemeExtension` en Flutter.
- Respetar las preferencias de accesibilidad del usuario (`prefers-reduced-motion` en Web y `textScaler` en Flutter).

## 3. Micro-interacciones y Animaciones
- Duración recomendada de transiciones: 150ms a 300ms con curvas suaves (`ease-out` o `cubic-bezier`).
- Proporcionar feedback visual inmediato en todas las acciones interactivas (estados hover, active, disabled, loading).
