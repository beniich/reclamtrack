import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { PremiumButton as Button } from '@/components/ui/PremiumButton';
import Image from 'next/image';
import { TypewriterText } from '@/components/animations/TypewriterText';
import { ChevronDown, ArrowRight } from 'lucide-react';

export default async function LandingPage() {
    const tNav = await getTranslations('Navbar');
    const tLanding = await getTranslations('Landing');
    const tFooter = await getTranslations('Footer');
    const tCommon = await getTranslations('Common');

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background text-slate-600 dark:text-slate-400 font-sans selection:bg-primary selection:text-white transition-colors duration-300">
            {/* Premium Navigation */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-background/50 backdrop-blur-md border-b border-slate-200 dark:border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-2 group cursor-pointer">
                        <Logo size={40} showText={true} />
                    </div>

                    <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
                        <div className="relative group cursor-pointer inline-block">
                            <span className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-orange-400 transition-colors flex items-center uppercase tracking-widest text-[10px] font-black pb-4 -mb-4">
                                {tNav('solutions')}
                                <ChevronDown className="text-xs ml-1 transition-transform group-hover:rotate-180" />
                            </span>
                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-background border border-slate-200 dark:border-primary/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                                <div className="p-2 space-y-1">
                                    {[
                                        { title: tCommon('governance'), icon: 'account_balance', href: '/services/governance' },
                                        { title: tCommon('healthcare'), icon: 'medical_services', href: '/services/healthcare' },
                                        { title: tCommon('infrastructure'), icon: 'lan', href: '/services/infrastructure' },
                                        { title: tCommon('hospitality'), icon: 'hotel', href: '/services/hospitality' },
                                        { title: tCommon('education'), icon: 'school', href: '/services/education' }
                                    ].map((item, idx) => (
                                        <Link key={idx} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group/item">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors">{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-orange-400 transition-colors uppercase tracking-widest text-[10px] font-black">{tNav('pricing')}</Link>
                        <Link href="#architecture" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-orange-400 transition-colors uppercase tracking-widest text-[10px] font-black">{tNav('architecture')}</Link>
                    </nav>

                    <div className="flex items-center space-x-6">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-orange-400 transition-colors">
                            {tNav('login')}
                        </Link>
                        <Link href="/login" className="px-6 py-2.5 bg-primary dark:bg-primary hover:bg-primary-700 dark:hover:brightness-110 text-white rounded-full transition-all shadow-lg shadow-indigo-600/20 dark:shadow-orange-600/20 text-[10px] font-black uppercase tracking-widest">
                            {tNav('getStarted')}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-48 pb-32 overflow-hidden bg-white dark:bg-background">
                    <div className="absolute top-0 right-0 -mr-20 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/5 blur-[150px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 w-[500px] h-[500px] bg-primary/5 dark:bg-violet-500/5 blur-[150px] rounded-full"></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-background border border-slate-100 dark:border-primary/10 text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
                            <span className="w-2 h-2 bg-primary dark:bg-primary rounded-full animate-ping"></span>
                            <span className="text-slate-500 dark:text-slate-400">{tLanding('heroBadge')}</span>
                        </div>

                        <h1 className="text-6xl md:text-[7rem] font-display font-black leading-[0.85] mb-12 tracking-tighter uppercase italic text-slate-900 dark:text-white max-w-6xl mx-auto">
                            {tLanding('heroTitle').split(' ').slice(0, -4).join(' ')} <br />
                            <span className="text-primary dark:text-primary not-italic">
                                {tLanding('heroTitle').split(' ').slice(-4).join(' ')}
                            </span>
                        </h1>

                        <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed font-light">
                            {tLanding('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button type="button" variant="primary" size="xl" className="w-full">
                                    {tLanding('bookDemo')}
                                </Button>
                            </Link>
                            <a href="/login?demo=true" className="w-full sm:w-auto">
                                <Button type="button" variant="outline" size="xl" className="w-full gap-3 border-primary text-primary hover:bg-primary/10">
                                    Essayer la Démo (Sandbox)
                                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                                </Button>
                            </a>
                        </div>

                        {/* Network Illustration */}
                        <div className="mt-24 relative flex justify-center">
                            <div className="w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-200 p-3 shadow-2xl">
                                <div className="w-full h-full rounded-[2.5rem] bg-slate-100 relative overflow-hidden group border border-slate-200/50">
                                    <Image
                                        alt="Industrial Visualization"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXtI2seLtcgaXHr1neshRW3AeZEcCgDAFLtOdNNwaf5TLx972p1iaUp3BIwrUR3H5WnGSpEf7ay4n1FuXEqMVvkGj98Rf9jM1gWBuyn3PBokIyxUMhXm6GNFjSRgRWNiIEUkYhxApmbinTzv8ZI8MBRV8c7P-7hpxfpTIGiftwxxm49U474HvK53CZZ3bPpXsumZOS6feAcC0DdcZZT9oRrmyKt42asdgkEQs9T8_3jyWNidIFPf7tk2RTREA0BsuKiMhM_DkbkC0"
                                        fill
                                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 border-y border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-background" id="stats">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
                            {[
                                { val: "500+", key: "statsClients" },
                                { val: "99.9%", key: "statsUptime" },
                                { val: "10+", key: "statsModules" },
                                { val: "UK", key: "statsHosting" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-3 tracking-tighter group-hover:text-primary dark:group-hover:text-orange-400 transition-colors">
                                        {stat.val}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em]">
                                        {tLanding(stat.key)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service Architecture Section */}
                <section className="py-32 bg-white dark:bg-background" id="solutions">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-24">
                            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter">
                                {tLanding('solutionsTitle')}
                            </h2>
                            <div className="h-1.5 w-32 bg-primary dark:bg-primary rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[
                                { icon: 'gov', color: 'indigo', title: 'govTitle', desc: 'govDesc', symbol: 'account_balance', href: '/services/governance' },
                                { icon: 'health', color: 'emerald', title: 'healthTitle', desc: 'healthDesc', symbol: 'medical_services', href: '/services/healthcare' },
                                { icon: 'infra', color: 'slate', title: 'infraTitle', desc: 'infraDesc', symbol: 'lan', href: '/services/infrastructure' },
                                { icon: 'hotel', color: 'amber', title: 'hotelTitle', desc: 'hotelDesc', symbol: 'hotel', href: '/services/hospitality' },
                                { icon: 'edu', color: 'purple', title: 'eduTitle', desc: 'eduDesc', symbol: 'school', href: '/services/education' }
                            ].map((service, i) => (
                                <Link key={i} href={service.href} className="bg-white dark:bg-background/50 border border-slate-200 dark:border-primary/10 p-10 rounded-[3rem] group h-full flex flex-col hover:-translate-y-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-orange-500/10 duration-700">
                                    <div className={`w-14 h-14 bg-indigo-50 dark:bg-primary/10 text-primary dark:text-orange-400 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                                        <span className="material-symbols-outlined text-3xl font-bold">{service.symbol}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{tLanding(service.title)}</h3>
                                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-primary/30 transition-all flex-grow">
                                        <p className="font-black text-primary dark:text-orange-400 mb-3 text-xs uppercase tracking-widest">{tCommon('protocolActive')}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                                            {tLanding(service.desc)}
                                        </p>
                                    </div>
                                </Link>
                            ))}

                            {/* Cloud Industrie+ (Custom) */}
                            <div className="bg-primary dark:bg-primary p-10 rounded-[3rem] border border-indigo-700 dark:border-orange-700 group h-full flex flex-col hover:-translate-y-4 shadow-xl shadow-indigo-600/20 dark:shadow-orange-600/20 duration-700">
                                <div className="w-14 h-14 bg-white dark:bg-background text-primary dark:text-orange-400 rounded-2xl flex items-center justify-center mb-10 shadow-lg">
                                    <span className="material-symbols-outlined text-3xl">bolt</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tight">{tLanding('customTitle')}</h3>
                                <p className="text-sm text-indigo-100 dark:text-orange-100 leading-relaxed font-light mb-10">
                                    {tLanding('customDesc')}
                                </p>
                                <Link href="/contact" className="mt-auto text-white dark:text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 group/btn">
                                    {tFooter('helpCenter')}
                                    <ArrowRight className="text-sm group-hover/btn:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Architecture Section */}
                <section className="py-32 bg-slate-50 dark:bg-background" id="architecture">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                            <div className="space-y-16">
                                <div>
                                    <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-10 uppercase italic tracking-tighter">
                                        {tLanding('trustTitle')}
                                    </h2>
                                    <div className="h-1.5 w-32 bg-primary dark:bg-primary rounded-full"></div>
                                </div>

                                <div className="space-y-12">
                                    {[
                                        { icon: 'shield_lock', title: 'trustSecurity', desc: 'trustSecurityDesc' },
                                        { icon: 'public', title: 'trustSovereign', desc: 'trustSovereignDesc' },
                                        { icon: 'api', title: 'trustApi', desc: 'trustApiDesc' }
                                    ].map((trust, i) => (
                                        <div key={i} className="flex items-start space-x-6 group">
                                            <div className="p-4 bg-indigo-50 dark:bg-violet-500/10 rounded-2xl text-primary dark:text-violet-400 group-hover:bg-primary dark:group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                                <span className="material-symbols-outlined text-3xl">{trust.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{tLanding(trust.title)}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                                    {tLanding(trust.desc)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-10 bg-primary/5 dark:bg-primary/5 blur-[100px] rounded-full opacity-40"></div>
                                <div className="relative bg-white dark:bg-background p-4 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-primary/10">
                                    <div className="w-full aspect-[4/3] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 relative overflow-hidden p-2">
                                         <Image
                                            alt="Platform Dashboard"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGCX8Sh_h2aCiP-0ovT4zNtSM_OqE4kF9E51Ud1us2Sl9D4k2OFfurWAmvPJAa0zfBxai5BdsZqAJ8lK2Cg5uBIU4_Llup9Z6QdtwR7MQAxgI_eovysR77WsD1WSj3gJuqYOkPFVv6dW3_CSsyGMmlv2xQR3r_zCB1kZCEx8AkGPKZA0nE9RU0aLBlLAJcpKuPktNM4TxpJUS6ApK88fxJEHj7TF69FKGYboX8fVHYYgRNIn2VLwasN76C3vb7ahZ3Iaj8f-8g02U"
                                            fill
                                            className="object-cover opacity-90 rounded-[2rem]"
                                        />
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -left-10 bg-white dark:bg-background p-8 rounded-3xl border border-indigo-200 dark:border-primary/20 shadow-2xl hidden md:block">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl font-bold">verified</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Systèmes Opérationnels</p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black tracking-widest uppercase">Latence : 8ms</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-40 text-center px-6">
                    <div className="max-w-5xl mx-auto bg-white dark:bg-background border border-slate-200 dark:border-primary/10 p-16 md:p-32 rounded-[4rem] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-600 dark:via-orange-500 to-transparent opacity-50"></div>
                        <TypewriterText 
                            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.9] mb-10"
                            lines={[
                                { text: "L'ÉCOSYSTÈME SAAS" },
                                { text: "COMPLET POUR" },
                                { text: "LES INDUSTRIES DE DEMAIN.", className: "text-indigo-700 dark:text-primary" }
                            ]}
                            speed={60}
                        />
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-light mb-16 tracking-tight">
                            {tLanding('ctaSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-8">
                            <Link href="/contact" className="px-12 py-5 bg-primary dark:bg-primary hover:bg-primary-700 dark:hover:brightness-110 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 dark:shadow-orange-600/20 transform hover:scale-105 active:scale-95">
                                {tLanding('contactExpert')}
                            </Link>
                            <Link href="/pricing" className="px-12 py-5 bg-white dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn2">
                                {tLanding('explorePricing')}
                                <span className="material-symbols-outlined text-sm group-hover/btn2:rotate-45 transition-transform duration-500">payments</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-background pt-32 pb-16 border-t border-slate-200 dark:border-primary/10 relative overflow-hidden" id="footer">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-20 lg:gap-10 mb-24">
                        <div className="col-span-2 space-y-10">
                            <div className="flex items-center space-x-3 group cursor-pointer">
                                <Logo size={40} showText={true} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-light leading-relaxed max-w-sm">
                                {tFooter('description')}
                            </p>
                            <div className="flex space-x-6">
                                {['public', 'alternate_email', 'hub'].map((icon, i) => (
                                    <Link key={i} href="#" className="w-12 h-12 bg-slate-50 dark:bg-background border border-slate-200 dark:border-primary/20 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-primary/50 transition-all duration-500 shadow-sm">
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {[
                            { title: tFooter('product'), links: [tFooter('mobileApp'), tFooter('fieldDashboard'), tFooter('apiAccess')] },
                            { title: tFooter('company'), links: [tFooter('aboutUs'), tFooter('caseStudies'), tFooter('careers')] },
                            { title: tFooter('support'), links: [tFooter('documentation'), tFooter('security'), tFooter('helpCenter')] },
                            { title: tFooter('legal'), links: [tFooter('privacyPolicy'), tFooter('termsOfService'), "/legal/cookies"] }
                        ].map((col, i) => (
                            <div key={i} className="space-y-8">
                                <h4 className="text-primary dark:text-orange-400 font-black text-[10px] uppercase tracking-[0.4em]">{col.title}</h4>
                                <ul className="space-y-5">
                                    {col.links.map((link, j) => (
                                        <li key={j}>
                                            <Link href={typeof link === 'string' && link.startsWith('/') ? link : '#'} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-orange-400 transition-colors uppercase tracking-[0.1em]">
                                                {typeof link === 'string' && link.includes('/') ? link.split('/').pop()?.toUpperCase() : link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">© {new Date().getFullYear()} CloudIndustry LTD / Global Ecosystem / LONDON, UK</p>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 flex items-center uppercase tracking-[0.2em]">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                                {tCommon('allSystemsNominal')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2"></div>
            </footer>
        </div>
    );
}
