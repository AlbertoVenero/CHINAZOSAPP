// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// @ts-ignore
import authService from '@/services/AuthService';

interface Sicario {
    id: number;
    nombre: string;
    alias: string;
    foto: string | null;
}

interface AuthContextType {
    user: Sicario | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    login: (alias: string, password: string) => Promise<void>;
    loginAsGuest: () => void;
    logout: () => void;
    exitGuest: () => void;  // ✅ Agregado al tipo
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Sicario | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verificarSesion = async () => {
            try {
                console.log('🔍 Verificando sesión...');
                const data = await authService.verificarSesion();
                console.log('📊 Respuesta verificación:', data);
                
                if (data.autenticado && data.sicario) {
                    setUser(data.sicario);
                    setIsGuest(false);
                    console.log('✅ Usuario autenticado:', data.sicario.alias);
                } else {
                    const guest = localStorage.getItem('guest');
                    if (guest === 'true') {
                        setIsGuest(true);
                        console.log('👤 Usuario invitado');
                    } else {
                        console.log('❌ No hay sesión activa');
                    }
                }
            } catch (error) {
                console.error('❌ Error al verificar sesión:', error);
            } finally {
                setLoading(false);
            }
        };
        verificarSesion();
    }, []);

    const login = async (alias: string, password: string) => {
        setLoading(true);
        try {
            console.log('📤 Intentando login:', { alias, password });
            const data = await authService.login(alias, password);
            console.log('✅ Login exitoso:', data);
            
            setUser(data.sicario);
            setIsGuest(false);
            localStorage.removeItem('guest');
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = () => {
        console.log('👤 Entrando como invitado');
        setIsGuest(true);
        setUser(null);
        localStorage.setItem('guest', 'true');
        window.location.href = '/';
    };

    const exitGuest = () => {
        console.log('🚪 Saliendo del modo invitado');
        setIsGuest(false);
        setUser(null);
        localStorage.removeItem('guest');
        window.location.href = '/login';
    };

    const logout = async () => {
        try {
            console.log('📤 Cerrando sesión...');
            await authService.logout();
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
        } finally {
            setUser(null);
            setIsGuest(false);
            localStorage.removeItem('guest');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isGuest,
            login,
            loginAsGuest,
            logout,
            exitGuest,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};