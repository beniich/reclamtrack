'use client';

import { Logo } from '@/components/shared/Logo';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Lock, Mail, User, UserPlus, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';

// ─── Validation force du mot de passe ────────────────────────────────────────
function getPasswordStrength(pwd: string) {
    const checks = {
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        digit: /[0-9]/.test(pwd),
        special: /[^A-Za-z0-9]/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const label = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][score];
    const color = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][score];
    return { checks, score, label, color };
}

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);
    const [emailVerifRequired, setEmailVerifRequired] = useState(false);

    const { register, isLoading, error } = useAuthStore();
    const locale = useLocale();
    const router = useRouter();

    const strength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = confirmPassword === '' || password === confirmPassword;
    const canSubmit = name.trim() && email && strength.score >= 2 && password === confirmPassword && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        try {
            const result = await register(email, password, name.trim());
            if (result?.emailVerificationRequired) {
                setEmailVerifRequired(true);
                setSuccess(true);
            } else {
                toast.success('Compte créé avec succès !');
                setTimeout(() => router.push(`/${locale}/dashboard`), 100);
            }
        } catch (err: any) {
            // error est déjà dans le store
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50 dark:bg-background transition-colors duration-300 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-primary/5 blur-[120px] -z-10 pointer-events-none" />

            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-6">
                <Logo size={80} showText={true} className="flex-col !gap-6 scale-125" />
                <p className="text-[10px] text-primary dark:text-orange-400 uppercase tracking-widest font-black mt-2">
                    Industrial Intelligence Solutions
                </p>
            </div>

            {/* Card */}
            <div className="w-full max-w-[480px] bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-primary/10 shadow-2xl shadow-indigo-500/5 dark:shadow-orange-500/5 overflow-hidden">
                <div className="w-full px-8 pt-8 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-primary dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Créer un compte
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Inscription
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">
                        Accès Enterprise · 14 jours gratuits
                    </p>
                </div>

                <div className="p-8">
                    {/* Succès */}
                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    Inscription réussie !
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {emailVerifRequired
                                        ? <>Un email de vérification a été envoyé à <b>{email}</b>. Vérifiez votre boîte de réception pour activer votre compte.</>
                                        : 'Votre compte et votre organisation ont été créés.'}
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="block w-full bg-primary hover:bg-primary/90 text-white font-black py-3 rounded-xl text-center uppercase tracking-widest text-xs transition-all"
                            >
                                Aller à la connexion
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Erreur globale */}
                            {error && (
                                <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Nom complet */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2" htmlFor="name">
                                        Nom complet
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Jean Dupont"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2" htmlFor="email">
                                        Email professionnel
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="jean@acme.com"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        L&apos;organisation sera générée automatiquement depuis votre domaine email.
                                    </p>
                                </div>

                                {/* Mot de passe */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2" htmlFor="password">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Force indicator */}
                                    {password && (
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                                {[
                                                    { key: 'length', label: '8+ caractères' },
                                                    { key: 'uppercase', label: '1 majuscule' },
                                                    { key: 'digit', label: '1 chiffre' },
                                                    { key: 'special', label: '1 caractère spécial' },
                                                ].map(({ key, label }) => (
                                                    <div key={key} className={`flex items-center gap-1 text-[10px] font-medium ${(strength.checks as any)[key] ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                                        {(strength.checks as any)[key]
                                                            ? <CheckCircle2 className="w-3 h-3" />
                                                            : <XCircle className="w-3 h-3" />}
                                                        {label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirmation */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2" htmlFor="confirmPassword">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none ${
                                                !passwordsMatch
                                                    ? 'border-red-400 dark:border-red-600 focus:ring-red-200'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
                                            }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {!passwordsMatch && (
                                        <p className="mt-1.5 text-[10px] text-red-500 font-medium flex items-center gap-1">
                                            <XCircle className="w-3 h-3" /> Les mots de passe ne correspondent pas
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-600/20 dark:shadow-orange-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            <span>Création du compte...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>Créer mon compte</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark text-center text-xs">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Déjà un compte ? </span>
                                <Link href="/login" className="text-primary dark:text-orange-400 hover:text-indigo-700 font-black uppercase tracking-widest ml-1">
                                    Se connecter
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} ReclamTrack Pro. London, UK.
            </p>
        </div>
    );
}
