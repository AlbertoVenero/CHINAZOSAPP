# Estándares de Go (Golang)

## 1. Estructura del Proyecto (Standard Go Layout)
- `/cmd/<app-name>/main.go`: Punto de entrada que inicializa dependencias y ejecuta el servidor.
- `/internal/`: Código privado del proyecto no exportable a módulos externos.
  - `/internal/domain/`: Entidades e interfaces de negocio.
  - `/internal/usecase/`: Casos de uso e interactors.
  - `/internal/adapter/`: Handlers HTTP/gRPC y repositorios de base de datos.
- `/pkg/`: Utilidades reutilizables y agnósticas al negocio.

## 2. Concurrencia y Contexto
- Todo método de red o I/O debe recibir `ctx context.Context` como su primer argumento.
- Al lanzar Goroutines, controlar su ciclo de vida con `sync.WaitGroup` o `errgroup.Group`.
- Comprobar cancelaciones de contexto en operaciones largas:
  ```go
  select {
  case <-ctx.Done():
      return ctx.Err()
  case res := <-ch:
      // procesar resultado
  }
  ```

## 3. Manejo de Errores Idiomático
- No descartar errores con `_`.
- Envolver errores contextuales con `fmt.Errorf("error al buscar usuario con id %s: %w", id, err)`.
- Comparar errores usando `errors.Is(err, domain.ErrNotFound)` y `errors.As`.
