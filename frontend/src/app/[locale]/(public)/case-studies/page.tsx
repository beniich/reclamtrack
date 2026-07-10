'use client';

import { Link } from '@/i18n/navigation';
import { ArrowRight, Building2, Hotel, Landmark } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CaseStudiesPage() {
    const t = useTranslations('Common');

    const caseStudies = [
        {
            id: 'hospitality',
            icon: Hotel,
            title: "Hôtellerie de Luxe",
            client: "Groupe Hôtelier International (12 établissements)",
            challenge: "Gestion fragmentée des réclamations clients et maintenance préventive inefficace des équipements des chambres.",
            solution: "Déploiement de ReclamTrack Pro pour unifier les requêtes de service en chambre et automatiser la maintenance.",
            results: [
                "Réduction de 40% du temps de résolution des plaintes.",
                "Augmentation de 15% du score de satisfaction client (NPS).",
                "Diminution de 25% des pannes d'équipement grâce à l'AuditAX."
            ],
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/10"
        },
        {
            id: 'real-estate',
            icon: Building2,
            title: "Gestion Immobilière (Property Management)",
            client: "Société de Gestion Foncière (50+ bâtiments)",
            challenge: "Difficulté à suivre les interventions des techniciens externes et à gérer l'inventaire des pièces de rechange.",
            solution: "Utilisation du module Inventaire et de l'intégration FleetAgent pour optimiser les déplacements des techniciens.",
            results: [
                "Baisse de 30% des coûts logistiques et déplacements.",
                "Ruptures de stock de pièces détachées réduites à 0.",
                "Centralisation des tickets locataires sur un portail unique."
            ],
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/10"
        },
        {
            id: 'public-sector',
            icon: Landmark,
            title: "Collectivités Locales",
            client: "Mairie de Métropole (100k+ habitants)",
            challenge: "Volume ingérable de signalements citoyens (voirie, éclairage) et manque de traçabilité.",
            solution: "Implémentation de l'édition Enterprise avec accès API pour l'intégration à l'application citoyenne existante.",
            results: [
                "Traitement de plus de 10 000 requêtes citoyennes par mois.",
                "Amélioration de 60% de la transparence des interventions.",
                "Cartographie en temps réel des zones d'intervention."
            ],
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/10"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background pt-32 pb-24 font-display">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-6 border border-primary/20">
                        Études de Cas
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                        Ils transforment leurs <span className="text-primary italic">opérations</span>.
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                        Découvrez comment nos clients dans différents secteurs utilisent ReclamTrack pour optimiser leur gestion, réduire les coûts et améliorer la satisfaction.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {caseStudies.map((study) => (
                        <div key={study.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 hover:shadow-2xl transition-all duration-300 group">
                            <div className={`w-14 h-14 rounded-2xl ${study.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                <study.icon className={`w-7 h-7 ${study.color}`} />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{study.title}</h2>
                            <p className="text-sm text-primary font-semibold mb-6">{study.client}</p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Le Défi</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{study.challenge}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Notre Solution</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{study.solution}</p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Résultats</h3>
                                    <ul className="space-y-2">
                                        {study.results.map((result, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{result}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <Link href="/login?demo=true" className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-1">
                        Essayer ReclamTrack
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
