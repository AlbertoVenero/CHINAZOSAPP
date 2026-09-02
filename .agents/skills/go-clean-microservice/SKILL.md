---
name: go-clean-microservice
description: Diseña microservicios en Go siguiendo Clean Architecture, goroutines seguras con errgroup, interfaces pequeñas, manejo idiomático de errores y graceful shutdown. Usar al construir servicios en Go.
---

# Go Clean Microservice Scaffolder

Este skill guía la implementación de servicios robustos y de alta concurrencia en Go.

## Estructura del Caso de Uso

```go
package usecase

import (
	"context"
	"fmt"
	"sigeap/internal/domain"
)

type UserUseCase struct {
	repo domain.UserRepository
}

func NewUserUseCase(repo domain.UserRepository) *UserUseCase {
	return &UserUseCase{repo: repo}
}

func (u *UserUseCase) Register(ctx context.Context, email, name string) (*domain.User, error) {
	if email == "" || name == "" {
		return nil, domain.ErrInvalidInput
	}

	existing, err := u.repo.GetByEmail(ctx, email)
	if err != nil && !domain.IsNotFound(err) {
		return nil, fmt.Errorf("error al verificar email: %w", err)
	}
	if existing != nil {
		return nil, domain.ErrUserAlreadyExists
	}

	user := domain.NewUser(email, name)
	if err := u.repo.Save(ctx, user); err != nil {
		return nil, fmt.Errorf("error al persistir usuario: %w", err)
	}

	return user, nil
}
```

## Manejo Seguro de Goroutines con errgroup
```go
g, ctx := errgroup.WithContext(parentCtx)

g.Go(func() error {
    return sendAuditNotification(ctx, user)
})

g.Go(func() error {
    return updateSearchIndex(ctx, user)
})

if err := g.Wait(); err != nil {
    log.Printf("Error en tareas secundarias: %v", err)
}
```
