---
name: web-modern-ui-ux
description: Diseña e implementa interfaces web modernas con CSS Custom Properties, Tailwind tokens, Container Queries, micro-interacciones, estados interactivos y cumplimiento WCAG 2.2 AA. Usar para frontend y diseño UI/UX web.
---

# Web Modern UI/UX Builder

Este skill proporciona metodologías y snippets para interfaces web accesibles y de alto impacto visual.

## Tokens de Diseño Centralizados con CSS Custom Properties

```css
:root {
  --color-primary-500: #2563eb;
  --color-primary-600: #1d4ed8;
  --color-surface-bg: #ffffff;
  --color-text-main: #0f172a;
  --color-text-muted: #64748b;
  --radius-md: 0.5rem;
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme='dark'] {
  --color-surface-bg: #0f172a;
  --color-text-main: #f8fafc;
  --color-text-muted: #94a3b8;
}
```

## Componente Accesible y Responsivo con Container Queries
```html
<div class="user-card-container">
  <article class="user-card">
    <img src="avatar.jpg" alt="Foto de perfil de Juan Pérez" class="avatar" />
    <div class="info">
      <h3>Juan Pérez</h3>
      <p class="role">Líder Técnico</p>
      <button class="btn-primary" aria-label="Enviar mensaje a Juan Pérez">
        Contactar
      </button>
    </div>
  </article>
</div>

<style>
.user-card-container {
  container-type: inline-size;
}

.user-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-surface-bg);
  border-radius: var(--radius-md);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Adaptación inteligente según el ancho del contenedor */
@container (min-width: 400px) {
  .user-card {
    flex-direction: row;
    align-items: center;
  }
}
</style>
```
