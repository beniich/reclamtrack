import { authApi } from '@/lib/api';
import { User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<{ emailVerificationRequired?: boolean }>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    checkAuth: () => Promise<void>;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user }),
            setToken: (token) => {
                set({ token });
                if (typeof window !== 'undefined') {
                    if (token) {
                        localStorage.setItem('auth_token', token);
                        // Simple clean cookie for middleware (not the Zustand JSON one)
                        document.cookie = `auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
                    } else {
                        localStorage.removeItem('auth_token');
                        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    }
                }
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login({ email, password });
                    const { user, accessToken } = response as any;
                    const token = accessToken || (response as any).token;

                    if (!user || !token) {
                        throw new Error('Réponse invalide du serveur');
                    }

                    // setToken s'occupe de localStorage + cookie
                    set({ user, token, isLoading: false });
                    useAuthStore.getState().setToken(token);
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Identifiants invalides';
                    set({ isLoading: false, error: errorMsg });
                    throw error;
                }
            },

            register: async (email, password, name) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.register({ email, password, name });
                    const { user, accessToken, emailVerificationRequired } = response as any;
                    const token = accessToken || (response as any).token;

                    if (emailVerificationRequired) {
                        set({ isLoading: false });
                        return { emailVerificationRequired: true };
                    }

                    if (!user || !token) {
                        throw new Error('Réponse invalide du serveur');
                    }

                    set({ user, token, isLoading: false });
                    useAuthStore.getState().setToken(token);
                    return {};
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || "Erreur d'inscription";
                    set({ isLoading: false, error: errorMsg });
                    throw error;
                }
            },

            googleLogin: async (credential) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.googleLogin(credential);
                    const { user, accessToken, token: fallbackToken } = response as any;
                    const token = accessToken || fallbackToken;

                    if (!user || !token) {
                         throw new Error('Réponse invalide du serveur');
                    }

                    set({ user, token, isLoading: false });
                    useAuthStore.getState().setToken(token);
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Échec de la connexion Google';
                    set({ isLoading: false, error: errorMsg });
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    // Detect current locale from URL to maintain i18n context
                    const pathLocale = window.location.pathname.split('/')[1];
                    const locale = ['fr', 'en'].includes(pathLocale) ? pathLocale : 'fr';
                    window.location.href = `/${locale}/login`;
                }
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const user = await authApi.me();
                    set({ user, isLoading: false });
                } catch {
                    // console.error(error);
                    set({ user: null, token: null, isLoading: false });
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('auth_token');
                    }
                }
            },

            // Hydration state
            _hasHydrated: false,
            setHasHydrated: (state: boolean) => set({ _hasHydrated: state })
        }),
        {
            name: 'reclamtrack-auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);
