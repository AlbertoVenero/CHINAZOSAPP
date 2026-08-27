// components/navigation/TopBar.tsx
import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from '@nextui-org/react';
import { MoonIcon, SunIcon, UserIcon, KeyIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
// @ts-ignore
import authService from '@/services/AuthService';

export const TopBar = () => {
  console.log('🔵 [TopBar] Renderizando componente');
  
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isGuest, logout, exitGuest } = useAuth();
  
  console.log(`🔵 [TopBar] isAuthenticated: ${isAuthenticated}, isGuest: ${isGuest}`);
  console.log('🔵 [TopBar] user:', user);
  
  const { isOpen: isOpenPerfil, onOpen: onOpenPerfil, onClose: onClosePerfil } = useDisclosure();
  const { isOpen: isOpenPassword, onOpen: onOpenPassword, onClose: onClosePassword } = useDisclosure();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================
  const handleLogout = async () => {
    console.log('🔵 [TopBar] handleLogout - Iniciando');
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      console.log('🔵 [TopBar] handleLogout - Confirmado, cerrando sesión');
      await logout();
      console.log('🔵 [TopBar] handleLogout - Sesión cerrada');
    } else {
      console.log('🔵 [TopBar] handleLogout - Cancelado');
    }
  };

  // ============================================================
  // SALIR DE INVITADO
  // ============================================================
  const handleExitGuest = () => {
    console.log('🔵 [TopBar] handleExitGuest - Iniciando');
    if (confirm('¿Salir del modo invitado?')) {
      console.log('🔵 [TopBar] handleExitGuest - Confirmado, saliendo');
      exitGuest();
    } else {
      console.log('🔵 [TopBar] handleExitGuest - Cancelado');
    }
  };

  // ============================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================
  const handleChangePassword = async () => {
    console.log('🔑 [TopBar] ============================');
    console.log('🔑 [TopBar] handleChangePassword - Iniciando');
    console.log('🔑 [TopBar] user:', user);
    console.log('🔑 [TopBar] newPassword:', newPassword);
    console.log('🔑 [TopBar] confirmPassword:', confirmPassword);
    
    setError('');
    setSuccess('');
    
    if (!newPassword || !confirmPassword) {
      console.log('❌ [TopBar] Campos vacíos');
      setError('Todos los campos son obligatorios');
      return;
    }
    if (newPassword !== confirmPassword) {
      console.log('❌ [TopBar] Las contraseñas no coinciden');
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 3) {
      console.log('❌ [TopBar] Contraseña muy corta');
      setError('La contraseña debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!user) {
        console.error('❌ [TopBar] No hay usuario logueado');
        setError('No hay usuario logueado');
        setLoading(false);
        return;
      }
      
      console.log(`🔑 [TopBar] Llamando a changePassword con ID: ${user.id}`);
      
      const response = await authService.changePassword(user.id, newPassword);
      
      console.log('✅ [TopBar] Respuesta recibida:', response);
      
      setSuccess('✅ Contraseña actualizada exitosamente');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        console.log('🔑 [TopBar] Cerrando modal de cambio de contraseña');
        onClosePassword();
        setSuccess('');
        setError('');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ [TopBar] Error al cambiar contraseña:', error);
      console.error('❌ [TopBar] Error stack:', error.stack);
      setError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
      console.log('🔑 [TopBar] ============================');
    }
  };

  return (
    <>
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-divider bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">CZ</span>
          </div>
          <span className="text-lg font-bold">CHINAZOOO</span>
          {isGuest && (
            <span className="text-xs bg-default-200 text-default-600 px-2 py-0.5 rounded-full ml-2">
              Invitado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de tema */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={toggleTheme}
            className="flex-shrink-0"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          {/* Dropdown de usuario */}
          {isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm" className="flex-shrink-0">
                  <Avatar
                    src={user?.foto ? `http://localhost:5000/uploads/${user.foto}` : undefined}
                    name={user?.alias || 'U'}
                    size="sm"
                    className="w-8 h-8"
                    isBordered
                    color="primary"
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Perfil de usuario" variant="flat">
                <DropdownItem key="user-info" className="h-14 gap-2" isReadOnly>
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm">{user?.alias}</p>
                    <p className="text-xs text-default-500">{user?.nombre}</p>
                  </div>
                </DropdownItem>
                <DropdownItem key="divider1" className="h-px my-1" isReadOnly>
                  <div className="border-t border-divider" />
                </DropdownItem>
                <DropdownItem
                  key="perfil"
                  startContent={<UserCircleIcon className="h-4 w-4" />}
                  onPress={() => {
                    console.log('🔵 [TopBar] Abriendo modal de perfil');
                    onOpenPerfil();
                  }}
                >
                  Mi Perfil
                </DropdownItem>
                <DropdownItem
                  key="cambiar_password"
                  startContent={<KeyIcon className="h-4 w-4" />}
                  onPress={() => {
                    console.log('🔑 [TopBar] Abriendo modal de cambio de contraseña');
                    setError('');
                    setSuccess('');
                    setNewPassword('');
                    setConfirmPassword('');
                    onOpenPassword();
                  }}
                >
                  Cambiar Contraseña
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                  onPress={handleLogout}
                >
                  Cerrar Sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : isGuest ? (
            <Button
              size="sm"
              color="warning"
              variant="flat"
              onPress={handleExitGuest}
            >
              Salir de Invitado
            </Button>
          ) : (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<UserIcon className="h-4 w-4" />}
              onPress={() => {
                console.log('🔵 [TopBar] Navegando a /login');
                window.location.href = '/login';
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      </header>

      {/* ============================================================
      MODAL DE PERFIL
      ============================================================ */}
      <Modal isOpen={isOpenPerfil} onClose={onClosePerfil} size="md">
        <ModalContent>
          <ModalHeader>Mi Perfil</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar
                src={user?.foto ? `http://localhost:5000/uploads/${user.foto}` : undefined}
                name={user?.alias || 'U'}
                className="w-24 h-24 text-2xl"
              />
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-default-500">Alias</span>
                  <span className="font-medium">{user?.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Nombre</span>
                  <span className="font-medium">{user?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">ID</span>
                  <span className="font-medium">#{user?.id}</span>
                </div>
                {isGuest && (
                  <div className="flex justify-between">
                    <span className="text-default-500">Tipo</span>
                    <span className="font-medium text-warning">Invitado</span>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClosePerfil}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============================================================
      MODAL DE CAMBIAR CONTRASEÑA
      ============================================================ */}
      {!isGuest && (
        <Modal isOpen={isOpenPassword} onClose={() => {
          console.log('🔑 [TopBar] Cerrando modal de cambio de contraseña');
          setError('');
          setSuccess('');
          setNewPassword('');
          setConfirmPassword('');
          onClosePassword();
        }} size="md">
          <ModalContent>
            <ModalHeader>Cambiar Contraseña</ModalHeader>
            <ModalBody>
              <div className="space-y-4 py-2">
                {error && (
                  <div className="bg-danger-50 text-danger p-3 rounded-lg text-sm">
                    ❌ {error}
                  </div>
                )}
                {success && (
                  <div className="bg-success-50 text-success p-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}
                <p className="text-sm text-default-500">
                  Ingresa tu nueva contraseña. Debe tener al menos 3 caracteres.
                </p>
                <Input
                  label="Nueva Contraseña"
                  placeholder="Ingresa tu nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    console.log('🔑 [TopBar] newPassword cambiado:', e.target.value);
                    setNewPassword(e.target.value);
                    if (error) setError('');
                    if (success) setSuccess('');
                  }}
                  isDisabled={loading}
                />
                <Input
                  label="Confirmar Contraseña"
                  placeholder="Confirma tu nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    console.log('🔑 [TopBar] confirmPassword cambiado:', e.target.value);
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                    if (success) setSuccess('');
                  }}
                  isDisabled={loading}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={() => {
                  console.log('🔑 [TopBar] Cerrando modal de cambio de contraseña');
                  setError('');
                  setSuccess('');
                  setNewPassword('');
                  setConfirmPassword('');
                  onClosePassword();
                }} 
                isDisabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                color="primary" 
                onPress={handleChangePassword} 
                isLoading={loading}
                isDisabled={loading || !!success}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};