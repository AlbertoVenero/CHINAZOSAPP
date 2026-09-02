---
name: angular-signals-architecture
description: Implementa arquitectura frontend con Angular moderno (v17+), Standalone Components, Signal inputs/outputs, computed properties y OnPush Change Detection. Usar al construir módulos en Angular.
---

# Angular Signals Architecture

Guía para implementar componentes y servicios con la reactividad basada en Signals de Angular.

## Servicio con Signals

```typescript
import { Injectable, signal, computed } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly items = signal<Product[]>([]);

  readonly totalCount = computed(() => this.items().length);
  readonly totalPrice = computed(() =>
    this.items().reduce((sum, item) => sum + item.price, 0)
  );

  addItem(product: Product): void {
    this.items.update(items => [...items, product]);
  }

  removeItem(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
  }
}
```

## Componente Standalone con Control Flow
```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CartStore } from './cart.store';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cart-container">
      <h3>Carrito ({{ cartStore.totalCount() }} items)</h3>
      <p>Total: {{ cartStore.totalPrice() | currency }}</p>

      @for (item of cartStore.items(); track item.id) {
        <div class="cart-item">
          <span>{{ item.name }} - {{ item.price | currency }}</span>
          <button (click)="cartStore.removeItem(item.id)">Eliminar</button>
        </div>
      } @empty {
        <p>Tu carrito está vacío.</p>
      }
    </div>
  `
})
export class CartSummaryComponent {
  readonly cartStore = inject(CartStore);
}
```
