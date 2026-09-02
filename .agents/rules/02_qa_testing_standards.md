# Estándares de Control de Calidad, QA y Estrategia de Pruebas

## 1. Pirámide de Pruebas
1. **Pruebas Unitarias (70%):** Rápidas, aisladas, ejecutan en memoria sin I/O real. Cubren casos de uso, entidades y lógica pura.
2. **Pruebas de Integración (20%):** Verifican interacción entre componentes reales (ej. Repositorio Postgres con Testcontainers, APIs HTTP).
3. **Pruebas E2E / UI (10%):** Pruebas de flujos críticos de usuario (ej. Login -> Creación de expediente -> Exportación PDF).

## 2. Convención de Escritura (Patrón AAA)
```typescript
describe('CreateUserUseCase', () => {
  it('should create user successfully when email is unique', async () => {
    // Arrange (Preparar datos, mocks y dependencias)
    const dto = { email: 'test@domain.com', name: 'John Doe' };
    userRepoMock.findByEmail.mockResolvedValue(null);

    // Act (Ejecutar la unidad bajo prueba)
    const result = await useCase.execute(dto);

    // Assert (Verificar el estado o retorno esperado)
    expect(result.isSuccess()).toBe(true);
    expect(userRepoMock.save).toHaveBeenCalledTimes(1);
  });
});
```

## 3. Criterios de Aceptación y Cobertura
- Cobertura mínima de líneas: **85%**.
- Cobertura mínima de ramas (*branches*): **80%**.
- Todo bug reportado debe iniciar con la creación de un test que reproduzca la falla antes de aplicar el fix.
