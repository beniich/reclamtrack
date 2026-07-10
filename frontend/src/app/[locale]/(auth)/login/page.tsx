'use client';

import { Logo } from '@/components/shared/Logo';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
    const t = useTranslations('Auth');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const locale = useLocale();
    const router = useRouter();

    const searchParams = useSearchParams();
    const { login, googleLogin } = useAuthStore();

    useEffect(() => {
        if (searchParams.get('demo') === 'true') {
            handleQuickLogin('admin');
        }
    }, [searchParams]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Connexion réussie !');

            // Redirection avec locale pour garder le contexte i18n
            setTimeout(() => {
                router.push(`/${locale}/dashboard`);
            }, 100);

        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || error.response?.data?.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (role: 'admin' | 'superadmin') => {
        const credentials = role === 'admin' 
            ? { email: 'admin@reclamtrack.com', pass: 'Admin123!' }
            : { email: 'superadmin@reclamtrack.com', pass: 'SuperAdmin123!' };
            
        setLoading(true);
        try {
            await login(credentials.email, credentials.pass);
            toast.success(`Connexion ${role} réussie !`);
            setTimeout(() => {
                router.push(`/${locale}/dashboard`);
            }, 100);
        } catch (error: any) {
            toast.error("Échec de l'accès rapide");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        try {
            if (credentialResponse.credential) {
                await googleLogin(credentialResponse.credential);
                toast.success('Connexion Google réussie !');
                setTimeout(() => {
                    router.push(`/${locale}/dashboard`);
                }, 100);
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            const message = error.response?.data?.error || error.response?.data?.message || 'Échec de la connexion Google';
            toast.error(message);
        }
    };

    const handleGoogleError = () => {
        toast.error('Échec de la connexion Google');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-background font-display selection:bg-primary selection:text-white transition-colors duration-300 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-primary/5 dark:bg-primary/5 blur-[120px] -z-10 pointer-events-none"></div>

            {/* Logo / Branding Header */}
            <div className="mb-8 flex flex-col items-center gap-6">
                <Logo size={80} showText={true} className="flex-col !gap-6 scale-125" />
                <p className="text-[10px] text-primary dark:text-orange-400 uppercase tracking-widest font-black mt-2">Industrial Intelligence Solutions</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[440px] bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-primary/10 shadow-2xl shadow-indigo-500/5 dark:shadow-orange-500/5 overflow-hidden transition-all duration-300">
                {/* Header badge */}
                <div className="w-full px-8 pt-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-primary dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-primary dark:bg-primary rounded-full animate-pulse"></span>
                        {t('secureAuth')}
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{t('login')}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">{t('enterpriseAccess')}</p>
                </div>


                <div className="p-8">
                    <div className="mb-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            shape="pill"
                            text="signin_with"
                        />
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 dark:border-border-dark"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="px-4 bg-white dark:bg-background">{t('continueWith')}</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Username/Email Field */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2" htmlFor="identifier">{t('identifierEmail')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl notranslate" />
                                <input
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 focus:border-primary dark:focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium text-sm outline-none"
                                    id="identifier"
                                    name="identifier"
                                    placeholder={t('emailPlaceholder')}
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400" htmlFor="password">{t('password')}</label>
                                <Link className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-orange-400 hover:text-indigo-700 dark:hover:text-orange-300" href="/forgot-password">{t('forgotPassword')}</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl notranslate" />
                                <input
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 focus:border-primary dark:focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium text-sm outline-none"
                                    id="password"
                                    name="password"
                                    placeholder={t('passwordPlaceholder')}
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-xl notranslate" translate="no">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            className="w-full bg-primary dark:bg-primary hover:bg-primary-700 dark:hover:brightness-110 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-600/20 dark:shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    <span>{t('signingIn')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('signIn')}</span>
                                    <LogIn className="text-lg notranslate" />
                                </>
                            )}
                        </button>

                        <div className="pt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('admin')}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-primary/8 dark:hover:bg-slate-700 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">shield_person</span>
                                {t('adminDemo')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin('superadmin')}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-primary dark:text-orange-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-primary/20 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">monitoring</span>
                                {t('superAdmin')}
                            </button>
                        </div>
                    </form>

                    {/* Security Footer inside card */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined text-sm notranslate" translate="no">encrypted</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t('sslEncrypted')}</span>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <a className="hover:text-primary dark:hover:text-orange-400 transition-colors" href="#">{t('securityPolicy')}</a>
                <a className="hover:text-primary dark:hover:text-orange-400 transition-colors" href="#">{t('helpCenter')}</a>
                <a className="hover:text-primary dark:hover:text-orange-400 transition-colors" href="#">{t('privacy')}</a>
            </div>

            <div className="mt-8 text-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{t('newMember')} </span>
                <Link href="/register" className="text-primary dark:text-orange-400 hover:text-indigo-700 dark:hover:text-orange-300 font-black uppercase tracking-widest ml-1">
                    {t('requestAccess')}
                </Link>
            </div>

            <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} ReclamTrack Pro. London, UK.
            </p>
        </div>
    );
}
