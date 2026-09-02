---
name: qa-test-suite-builder
description: Diseña y genera suites completas de pruebas unitarias, de integración y de casos de uso aplicando el patrón AAA y mocks limpios. Usar siempre que se desarrolle o refactorice lógica de negocio.
---

# QA Test Suite Builder

Este skill proporciona la metodología para construir pruebas de software robustas y aisladas.

## Flujo de Trabajo para Pruebas Unitarias
1. **Identificar Casos de Éxito y Casos Borde:**
   - Flujo exitoso principal (Happy Path).
   - Datos nulos o inválidos en DTOs.
   - Entidad no encontrada (ej. `UserNotFoundException`).
   - Errores de concurrencia o conflictos de unicidad (ej. correo duplicado).
2. **Estructura AAA:**
   - **Arrange:** Instanciar mocks de repositorios y definir el comportamiento esperado.
   - **Act:** Invocar el método del caso de uso.
   - **Assert:** Comprobar el valor devuelto y verificar que los métodos de persistencia se hayan llamado con los parámetros exactos.

## Ejemplo de Suite en TypeScript / Jest
```typescript
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepoMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepoMock = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new RegisterUserUseCase(userRepoMock);
  });

  it('should throw UserAlreadyExistsException when email is taken', async () => {
    userRepoMock.findByEmail.mockResolvedValue(new User({ id: '1', email: 'a@b.com' }));
    await expect(useCase.execute({ email: 'a@b.com', name: 'John' }))
      .rejects.toThrow(UserAlreadyExistsException);
    expect(userRepoMock.save).not.toHaveBeenCalled();
  });
});
```
