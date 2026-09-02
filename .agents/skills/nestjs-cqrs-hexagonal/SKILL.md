---
name: nestjs-cqrs-hexagonal
description: Estructura módulos de NestJS utilizando el patrón CQRS (Command Query Responsibility Segregation), separación estricta de puertos y adaptadores y validación DTO. Usar en backend NestJS.
---

# NestJS CQRS & Hexagonal Scaffolder

Este skill guía la implementación de módulos de alto rendimiento desacoplados en NestJS.

## Patrón de Command Handler (Escritura)

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error('El usuario ya existe');
    }
    const user = User.create(command.email, command.name);
    await this.userRepository.save(user);
    return user.id;
  }
}
```

## Configuración del Módulo
```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from './application/commands/create-user.handler';
import { USER_REPOSITORY } from './domain/user.repository';
import { PostgresUserRepository } from './infrastructure/postgres-user.repository';
import { UsersController } from './infrastructure/users.controller';

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    CreateUserHandler,
    {
      provide: USER_REPOSITORY,
      useClass: PostgresUserRepository,
    },
  ],
})
export class UsersModule {}
```
