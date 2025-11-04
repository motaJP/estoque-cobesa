"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { getAuth, signInWithEmailAndPassword, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { UserProfile, UserRole, Group } from '@/lib/auth-types';

interface AuthContextType {
  user: FirebaseAuthUser | null;
  profile: UserProfile | null;
  group: Group | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Adicionar outras funções de gestão de usuário aqui
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função auxiliar para converter username em um email de login
const usernameToEmail = (username: string) => `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@truckstock.com`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const isAuthenticated = !!user && !!profile;
  const isAdmin = profile?.role === 'admin';
  const isLoading = isUserLoading || isLoadingProfile;

  // 1. Carregar Perfil do Usuário
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !firestore) {
        setProfile(null);
        setGroup(null);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        const profileRef = doc(firestore, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const userProfile = profileSnap.data() as UserProfile;
          setProfile(userProfile);
          
          // 2. Carregar Grupo (Loja)
          if (userProfile.groupId) {
            const groupRef = doc(firestore, 'groups', userProfile.groupId);
            const groupSnap = await getDoc(groupRef);
            if (groupSnap.exists()) {
              setGroup(groupSnap.data() as Group);
            } else {
              setGroup(null);
            }
          } else {
            setGroup(null);
          }
        } else {
          setProfile(null);
          setGroup(null);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil/grupo:", error);
        toast({
          variant: "destructive",
          title: "Erro de Perfil",
          description: "Não foi possível carregar as informações do seu perfil.",
        });
        setProfile(null);
        setGroup(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, firestore, toast]);

  // 3. Função de Login
  const login = async (username: string, password: string) => {
    if (!auth) return;
    
    const email = usernameToEmail(username);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Bem-Sucedido!",
        description: `Bem-vindo, ${username}.`,
      });
    } catch (error: any) {
      console.error("Erro de Login:", error);
      let errorMessage = "Erro ao fazer login. Verifique seu usuário e senha.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Usuário ou senha inválidos.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // 4. Função de Logout
  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setProfile(null);
      setGroup(null);
      toast({
        title: "Logout",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error("Erro de Logout:", error);
    }
  };
  
  // 5. Criação do Usuário Admin Inicial (Apenas para Desenvolvimento)
  useEffect(() => {
    const createInitialAdmin = async () => {
      if (!firestore || !auth || isUserLoading) return;
      
      const adminUsername = "admin";
      const adminEmail = usernameToEmail(adminUsername);
      const adminPassword = "adminpassword"; // Senha padrão para o admin inicial
      const adminUid = "initial-admin-uid"; // UID fixo para o admin inicial (para facilitar o acesso)
      
      // Criar o grupo padrão se não existir
      const defaultGroupId = 'default-group';
      const groupRef = doc(firestore, 'groups', defaultGroupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        const defaultGroup: Group = {
          id: defaultGroupId,
          name: 'Loja Principal',
          description: 'Grupo padrão para o estoque de peças.',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        await setDoc(groupRef, defaultGroup);
        console.log("Grupo padrão criado.");
      }
      
      // Verificar se o perfil do admin já existe
      const profileRef = doc(firestore, 'userProfiles', adminUid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        // Criar o perfil do usuário
        const adminProfile: UserProfile = {
          id: adminUid,
          username: adminUsername,
          role: 'admin',
          groupId: defaultGroupId,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        await setDoc(profileRef, adminProfile);
        console.log("Perfil do Admin inicial criado.");
        
        // Tentar criar o usuário no Firebase Auth (pode falhar se já existir)
        try {
          const userCredential = await getAuth().createUserWithEmailAndPassword(adminEmail, adminPassword);
          // Se o usuário foi criado, atualizar o UID no perfil
          if (userCredential.user) {
             await setDoc(doc(firestore, 'userProfiles', userCredential.user.uid), { ...adminProfile, id: userCredential.user.uid });
             console.log("Usuário Admin criado no Auth com UID real.");
             // Excluir o perfil temporário
             await setDoc(doc(firestore, 'userProfiles', adminUid), { isActive: false }, { merge: true });
          }
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            console.log("Usuário Admin já existe no Auth. Ignorando criação.");
          } else {
            console.error("Erro ao criar usuário Admin no Auth:", authError);
          }
        }
      }
    };
    
    createInitialAdmin(); // Descomentar para criar o admin inicial
  }, [firestore, auth, isUserLoading]);


  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      group,
      isAuthenticated, 
      isAdmin, 
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
