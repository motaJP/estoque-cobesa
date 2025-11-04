"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { UserSettings } from "@/lib/settings-types";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [lowStockEmail, setLowStockEmail] = useState(true);
  const [weeklyReportsEmail, setWeeklyReportsEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !firestore) return;
      
      setIsLoading(true);
      try {
        const settingsRef = doc(firestore, 'settings', user.uid);
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as UserSettings;
          setLowStockEmail(data.notifications.lowStockEmail);
          setWeeklyReportsEmail(data.notifications.weeklyReportsEmail);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user, firestore]);
  
  const handleSaveSettings = async () => {
    if (!user || !firestore) return;
    
    setIsSaving(true);
    try {
      const settingsRef = doc(firestore, 'settings', user.uid);
      const settings: Omit<UserSettings, 'id'> = {
        userId: user.uid,
        notifications: {
          lowStockEmail,
          weeklyReportsEmail,
        },
        theme: theme as 'light' | 'dark' | 'system',
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(settingsRef, settings, { merge: true });
      
      toast({
        title: "Configurações Salvas!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar suas configurações.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta e do aplicativo.
          </p>
        </div>
        <Separator />
        
        <div className="max-w-2xl space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>
                        Escolha como você recebe as notificações.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 space-y-2 sm:space-y-0">
                        <div className="space-y-0.5">
                            <Label htmlFor="low-stock-email" className="text-base">
                            Alertas de Estoque Baixo por E-mail
                            </Label>
                            <p className="text-sm text-muted-foreground">
                            Receba um e-mail quando um item atingir o nível de reposição.
                            </p>
                        </div>
                        <Switch 
                          id="low-stock-email" 
                          checked={lowStockEmail}
                          onCheckedChange={setLowStockEmail}
                          disabled={isLoading}
                        />
                    </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 space-y-2 sm:space-y-0">
                        <div className="space-y-0.5">
                            <Label htmlFor="reports-email" className="text-base">
                            Relatórios Semanais por E-mail
                            </Label>
                            <p className="text-sm text-muted-foreground">
                            Receba um resumo do seu inventário toda segunda-feira.
                            </p>
                        </div>
                        <Switch 
                          id="reports-email" 
                          checked={weeklyReportsEmail}
                          onCheckedChange={setWeeklyReportsEmail}
                          disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>
                        Personalize a aparência do aplicativo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 space-y-2 sm:space-y-0">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base">
                            Modo Escuro
                            </Label>
                            <p className="text-sm text-muted-foreground">
                            Ative o modo escuro para uma experiência visual diferente.
                            </p>
                        </div>
                        <Switch
                          id="dark-mode"
                          checked={theme === 'dark'}
                          onCheckedChange={(checked) => {
                            setTheme(checked ? 'dark' : 'light');
                          }}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Button onClick={handleSaveSettings} disabled={isSaving || isLoading}>
              {isSaving ? "Salvando..." : "Salvar Preferências"}
            </Button>
        </div>
      </div>
    </AppLayout>
  );
}
