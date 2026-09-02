---
name: flutter-clean-riverpod
description: Genera arquitectura limpia para Flutter con Riverpod 2.x, code generation (@riverpod), AsyncNotifier, modelos inmutables con freezed y repositorios desacoplados. Usar en desarrollo Flutter.
---

# Flutter Clean Riverpod Scaffolder

Este skill guía la implementación de aplicaciones móviles modernas con Flutter y Riverpod.

## Patrón de AsyncNotifier con Code Generation

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../domain/user_model.dart';
import '../domain/user_repository.dart';

part 'user_controller.g.dart';

@riverpod
class UserController extends _$UserController {
  @override
  FutureOr<List<UserModel>> build() async {
    final repository = ref.watch(userRepositoryProvider);
    return repository.getUsers();
  }

  Future<void> addUser(String name, String email) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(userRepositoryProvider);
      await repository.createUser(name: name, email: email);
      return repository.getUsers();
    });
  }
}
```

## Consumo en UI con `AsyncValue.when`
```dart
class UserListView extends ConsumerWidget {
  const UserListView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userControllerProvider);

    return userState.when(
      data: (users) => ListView.builder(
        itemCount: users.length,
        itemBuilder: (context, index) => ListTile(
          title: Text(users[index].name),
          subtitle: Text(users[index].email),
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Error: $err')),
    );
  }
}
```
