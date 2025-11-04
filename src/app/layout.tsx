import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { InventoryProvider } from "@/context/InventoryContext";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export const metadata: Metadata = {
  title: "Stock Master",
  description: "Gerenciamento de estoque simplificado.",
};

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  // Redireciona para a página de login se não estiver autenticado e não estiver carregando
  if (!isAuthenticated && !isLoading) {
    redirect('/login');
  }
  
  // Se estiver carregando ou autenticado, renderiza o conteúdo
  if (isLoading || isAuthenticated) {
    return (
      <InventoryProvider>
        {children}
        <FirebaseErrorListener />
      </InventoryProvider>
    );
  }
  
  return null; // Não deve acontecer, mas por segurança
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AuthProvider>
              <AppContent>
                {children}
              </AppContent>
            </AuthProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
