// src/pages/login/LoginPage.tsx
import { Card, CardBody, Input, Button, Divider } from '@nextui-org/react';
import { useLoginPage } from './useLoginPage';

export const LoginPage = () => {
  const {
    alias,
    setAlias,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
    handleGuestLogin,
    isAuthenticated,
    isGuest
  } = useLoginPage();

  // Si ya está autenticado o es invitado, redirigir
  if (isAuthenticated || isGuest) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50">
      <Card className="w-full max-w-md">
        <CardBody className="gap-6 p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">CZ</span>
            </div>
            <h1 className="text-2xl font-bold">CHINAZOOO</h1>
            <p className="text-default-500 text-sm mt-1">Inicia sesión o entra como invitado</p>
          </div>

          {error && (
            <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alias"
              placeholder="Ingresa tu alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              isDisabled={loading}
              isRequired
            />

            <Input
              label="Contraseña"
              placeholder="Tu alias es tu contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDisabled={loading}
              isRequired
            />

            <p className="text-xs text-default-400 text-center">
              ℹ️ La contraseña es tu alias (ejemplo: si tu alias es "ElChino", tu contraseña es "ElChino")
            </p>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={loading}
              isDisabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <Divider className="flex-1" />
            <span className="text-xs text-default-400">O</span>
            <Divider className="flex-1" />
          </div>

          <Button
            variant="flat"
            className="w-full"
            size="lg"
            onPress={handleGuestLogin}
            isDisabled={loading}
          >
            Entrar como Invitado
          </Button>

          <p className="text-xs text-default-400 text-center mt-2">
            Como invitado podrás ver y votar, pero no tendrás acceso a funciones administrativas
          </p>
        </CardBody>
      </Card>
    </div>
  );
};