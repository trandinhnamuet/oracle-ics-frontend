import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import AuthProvider from '@/components/providers/auth-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oracle Cloud Vietnam',
  description: 'Giải pháp Oracle Cloud hàng đầu tại Việt Nam',
  generator: 'Next.js',
  openGraph: {
    title: 'Oracle Cloud Vietnam',
    description: 'Giải pháp Oracle Cloud hàng đầu tại Việt Nam',
    url: 'https://oraclecloud.vn/',
    siteName: 'Oracle Cloud Vietnam',
    images: [
      {
        url: 'https://oraclecloud.vn/thumbnail2.jpg',
        width: 1200,
        height: 630,
        alt: 'Oracle Cloud Vietnam',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oracle Cloud Vietnam',
    description: 'Giải pháp Oracle Cloud hàng đầu tại Việt Nam',
    images: ['https://oraclecloud.vn/thumbnail2.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Đọc ngôn ngữ từ cookie để đồng bộ với server-side
  const cookieStore = cookies()
  const language = cookieStore.get('language')?.value || 'vi'
  
  return (
    <html lang={language} suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider initialLanguage={language}>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <Toaster />
              </div>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
