import DebugWidget from '@/components/DebugWidget';
import JsonLd from '@/components/seo/JsonLd';
import { MiniMcLarenLoader } from '@/components/mini-mclarenloader';
import { NotificationToast } from '@/components/NotificationToast';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/providers/AuthProvider';
import { CallProvider } from '@/providers/CallProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import '@/styles/globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Sora } from 'next/font/google';
import { notFound } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Provider as ChakraProvider } from '@/components/ui/chakra/provider';
import { AISidekick } from '@/components/ai/AISidekick';

import type { Metadata } from 'next';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
});

const sora = Sora({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sora'
});

export const metadata: Metadata = {
    title: {
        template: '%s | CloudIndustry LTD',
        default: 'CloudIndustry LTD — Industrial Cloud Solutions & Ecosystem Architecture',
    },
    description: 'CloudIndustry LTD provides high-performance, secure, and modular cloud solutions for healthcare, industry, and governance. Built for the future of industrial intelligence.',
    keywords: ['industrial cloud', 'SaaS ecosystem', 'UK business solutions', 'Doctic Care', 'MecanicPro', 'Enterprise ERP'],
    authors: [{ name: 'CloudIndustry LTD' }],
    viewport: 'width=device-width, initial-scale=1',
    robots: 'index, follow',
    manifest: '/manifest.json',
    themeColor: '#f97316',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'ReclamTrack',
    },
    openGraph: {
        type: 'website',
        locale: 'en_GB',
        url: 'https://cloudindustry.co.uk',
        siteName: 'CloudIndustry LTD',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'CloudIndustry LTD — Industrial Intelligence',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CloudIndustry LTD — Industrial Cloud Solutions',
        description: 'Engineering Industrial Intelligence. Sovereign, Secure, Modular.',
        images: ['/og-image.jpg'],
    },
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as "en" | "fr" | "en-GB")) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                />
                <link rel="icon" type="image/jpeg" href="/logo.jpg" />
                <link rel="apple-touch-icon" href="/logo.jpg" />
                {/* Google Tag Manager */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T3KMCQSZ');`
                    }}
                />
                {/* End Google Tag Manager */}
            </head>
            <body className={`${inter.variable} ${sora.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T3KMCQSZ"
                        height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
                </noscript>
                {/* End Google Tag Manager (noscript) */}
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <JsonLd
                        data={{
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "CloudIndustry LTD",
                            "url": "https://cloudindustry.co.uk",
                            "logo": "https://cloudindustry.co.uk/logo.jpg",
                            "sameAs": [
                                "https://www.linkedin.com/company/cloudindustry",
                                "https://facebook.com/cloudindustry"
                            ],
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+44-000-000-000",
                                "contactType": "customer service",
                                "areaServed": "GB",
                                "availableLanguage": ["en", "en"]
                            }
                        }}
                    />
                    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                        <QueryProvider>
                            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                                <AuthProvider>
                                    <CallProvider>
                                        <NextTopLoader
                                            color="var(--pumpkin-spice)"
                                            initialPosition={0.08}
                                            crawlSpeed={200}
                                            height={3}
                                            crawl={true}
                                            showSpinner={false}
                                            easing="ease"
                                            speed={200}
                                            shadow="0 0 10px var(--pumpkin-spice),0 0 5px var(--pumpkin-spice)"
                                            zIndex={1600}
                                            showAtBottom={false}
                                        />
                                        <ChakraProvider>
                                            {children}
                                        </ChakraProvider>
                                        <AISidekick />
                                        <NotificationToast />
                                        <DebugWidget />
                                        <MiniMcLarenLoader />
                                    </CallProvider>
                                </AuthProvider>
                            </ThemeProvider>
                        </QueryProvider>
                    </GoogleOAuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
