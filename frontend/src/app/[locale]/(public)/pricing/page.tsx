'use client';

import { useAuthStore } from '@/store/authStore';
import { useStripeStore } from '@/store/stripeStore';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Share2 } from 'lucide-react';

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const router = useRouter();
    const { createCheckoutSession, isLoading, error } = useStripeStore();
    const { user } = useAuthStore();
    const isAuthenticated = !!user;

    const handlePlanSelect = async (planId: string) => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (planId === 'enterprise') {
            window.location.href = 'mailto:sales@reclamtrack.pro';
            return;
        }

        const url = await createCheckoutSession(planId, isYearly ? 'year' : 'month');
        if (url) {
            window.location.href = url;
        }
    };

    const plans = [
        {
            id: "starter",
            name: "Starter",
            price: isYearly ? "41" : "49",
            description: "Idéal pour TPE et auto-entrepreneurs. L'essentiel pour démarrer.",
            features: [
                { text: "Jusqu'à 5 utilisateurs", included: true },
                { text: "1 Organisation", included: true },
                { text: "Gestion des réclamations", included: true },
                { text: "Gestion de base de l'inventaire", included: true },
                { text: "Support par email", included: true },
            ],
            buttonText: "Commencer Starter",
            popular: false,
            subtext: isYearly ? "Facturé 492 € par an" : null
        },
        {
            id: "pro",
            name: "Pro",
            price: isYearly ? "124" : "149",
            description: "Pour PME. Gérez plusieurs sites et obtenez des rapports détaillés.",
            features: [
                { text: "Jusqu'à 25 utilisateurs", included: true },
                { text: "Jusqu'à 3 Organisations", included: true },
                { text: "Tous les modules opérationnels", included: true },
                { text: "Rapports & Analytics avancés", included: true, bold: true },
                { text: "Accès API Public", included: true, bold: true },
            ],
            buttonText: "Déployer Pro",
            popular: true,
            subtext: isYearly ? "Facturé 1 488 € par an" : null
        },
        {
            id: "business",
            name: "Business",
            price: isYearly ? "291" : "349",
            description: "Pour les grandes PME avec besoins IA et intégrations complexes.",
            features: [
                { text: "Jusqu'à 100 utilisateurs", included: true },
                { text: "Organisations illimitées", included: true },
                { text: "IA AuditAX (Conformité)", included: true, bold: true },
                { text: "IA FleetAgent (Optimisation)", included: true, bold: true },
                { text: "Authentification SSO", included: true },
            ],
            buttonText: "Choisir Business",
            popular: false,
            subtext: isYearly ? "Facturé 3 492 € par an" : null
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "Sur devis",
            description: "Déploiement sur-mesure pour les grands comptes et multinationales.",
            features: [
                { text: "Utilisateurs illimités", included: true },
                { text: "Déploiement dédié", included: true },
                { text: "Marque blanche (White-label)", included: true, bold: true },
                { text: "SLA Garanti (99.9%)", included: true, bold: true },
                { text: "Support prioritaire 24/7", included: true, bold: true },
            ],
            buttonText: "Contacter les ventes",
            popular: false
        }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/30 font-display min-h-screen">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight uppercase">
                            ReclamTrack <span className="text-primary">Pro</span>
                        </h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/about" className="text-sm font-semibold hover:text-primary transition-colors">About</Link>
                        <Link href="/help" className="text-sm font-semibold hover:text-primary transition-colors">Support</Link>
                    </nav>
                    <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20">
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 flex flex-col items-center overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_rgba(236,91,19,0.05),_transparent_70%)] pointer-events-none"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-6 border border-primary/20">
                            Scalable Governance
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                            Investment in <span className="text-primary italic font-light">Efficiency.</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            Select the protocol that aligns with your operational scale. Transparent metrics, no hidden complexities.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 w-fit mx-auto">
                            <button type="button"
                                onClick={() => setIsYearly(false)}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button type="button"
                                onClick={() => setIsYearly(true)}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative ${isYearly ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                            >
                                Yearly
                                <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-bounce">
                                    2 mois offerts
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Pricing Grid */}
                <section className="py-24 px-6 max-w-7xl mx-auto relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`relative group flex flex-col rounded-3xl border p-10 transition-all duration-500 hover:-translate-y-2 ${plan.popular
                                    ? 'bg-[#1a100a] text-white border-primary shadow-2xl shadow-primary/20 scale-105 z-10'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-xl h-fit self-center'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black px-6 py-1.5 rounded-full uppercase tracking-widest">
                                        Optimization Choice
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${plan.popular ? 'text-primary' : 'text-primary'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tighter">
                                                {plan.price !== "Custom" ? `$${plan.price}` : plan.price}
                                            </span>
                                            {plan.price !== "Custom" && (
                                                <span className={`text-sm font-bold opacity-60`}>/mo</span>
                                            )}
                                        </div>
                                        {plan.subtext && (
                                            <span className="text-xs font-bold text-primary mt-2 uppercase tracking-wider">{plan.subtext}</span>
                                        )}
                                    </div>
                                    <p className={`mt-6 text-sm font-medium leading-relaxed ${plan.popular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-30' : ''}`}>
                                            <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-primary' : 'text-primary'}`} />
                                            <span className={`font-medium ${('bold' in feature && feature.bold) ? 'font-black' : ''}`}>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <button type="button"
                                    onClick={() => handlePlanSelect(plan.id)}
                                    disabled={isLoading}
                                    className={`w-full py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${plan.popular
                                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                                        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                                {error && <p className="text-red-500 text-[10px] mt-4 text-center font-bold uppercase tracking-widest">{error}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 -left-20 w-64 h-64 bg-primary opacity-5 blur-[120px] rounded-full -z-10"></div>
                    <div className="absolute bottom-0 -right-20 w-80 h-80 bg-primary opacity-5 blur-[150px] rounded-full -z-10"></div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 border-t border-primary/10">
                    <div className="max-w-3xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-primary font-bold text-xs tracking-[0.2em] uppercase mb-4">Support Intelligence</h2>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Detailed Inquiries</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { q: "Can protocols be recalibrated mid-term?", a: "Yes. You can upgrade your infrastructure scale at any moment. Recalibration happens across all nodes instantly." },
                                { q: "Do you offer infrastructure for non-profits?", a: "We provide a 30% reduction for registered non-profit entities and educational institutions looking to enhance transparency." },
                                { q: "What is the uptime SLA for the Pro Protocol?", a: "Professional and Universal tiers operate on a 99.99% uptime SLA with hardware-level redundancy across multiple zones." }
                            ].map((item, i) => (
                                <details key={i} className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:border-primary/30 transition-all">
                                    <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                                        <span>{item.q}</span>
                                        <ChevronDown className="text-primary group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="pt-4 text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="bg-primary p-1.5 rounded-lg text-white">
                                <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight uppercase transition-colors">
                                ReclamTrack <span className="italic text-primary">Pro</span>
                            </h1>
                        </Link>
                        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                            <Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
                            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} ReclamTrack Pro Infrastructure</p>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group hover:bg-primary hover:text-white transition-all cursor-pointer">
                                <Share2 className="text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
