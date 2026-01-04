import { ClerkProvider } from '@clerk/nextjs'
import AuthContext from '@/context/AuthContext';
import Footer from '@/components/shared/Footer'
import './globals.scss'
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Giggle',
  description: 'Effortlessly explore the web',
  keywords: ['Next.js', 'React', 'JavaScript'],
  authors: [{ name: 'DevXprite', url: 'https://github.com/devxprite' }],
  favicon: '/favicon.png',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    images: '/images/screenshot.png',
    type: 'website',
  },
};

export const viewport = {
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html lang="en" >
         <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
         </head>
          <body>
            <main>
              <AuthContext>
                {children}
              </AuthContext>
            </main>
            <Footer />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  )
}
