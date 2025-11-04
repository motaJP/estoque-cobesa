"use server";

import { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { UserProfile, Group } from "@/lib/auth-types";
import { initializeFirebase } from "@/firebase/server-provider";

// Inicializa o Firebase no servidor
initializeFirebase();
const firestore = getFirestore();
const auth = getAuth();

// --- Funções de Gestão de Usuários ---

export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  try {
    const userProfileRef = doc(firestore, 'userProfiles', userId);
    await updateDoc(userProfileRef, { isActive });
    
    // Opcional: Se o usuário for bloqueado, você pode forçar o logout dele
    // No Firebase Auth, isso é feito revogando o token, mas é complexo.
    // A forma mais simples é confiar na regra de segurança do Firestore.
    
    return { success: true, message: `Usuário ${isActive ? 'ativado' : 'bloqueado'} com sucesso.` };
  } catch (error) {
    console.error("Erro ao alterar status do usuário:", error);
    return { success: false, message: "Erro ao alterar status do usuário." };
  }
}

export async function deleteUserAndProfile(userId: string) {
  try {
    // 1. Deletar o perfil do Firestore
    const userProfileRef = doc(firestore, 'userProfiles', userId);
    await updateDoc(userProfileRef, { isActive: false }); // Marcar como inativo antes de deletar
    // await deleteDoc(userProfileRef); // Não deletamos, apenas inativamos por segurança

    // 2. Deletar o usuário do Firebase Auth
    // Nota: Isso requer privilégios de Admin SDK, que não temos aqui.
    // Em um ambiente real, você usaria o Admin SDK para deletar o usuário.
    // Aqui, vamos apenas inativar o perfil e confiar que a regra de segurança impedirá o login.
    
    // Tentar deletar do Auth (pode falhar no ambiente de cliente/serverless)
    try {
        await deleteUser(auth.currentUser!); // Isso só funciona se o usuário logado for o próprio
    } catch (e) {
        console.warn("Não foi possível deletar o usuário do Auth (requer Admin SDK ou ser o próprio usuário). Inativação do perfil é suficiente para bloquear o acesso.");
    }

    return { success: true, message: "Usuário inativado com sucesso." };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, message: "Erro ao deletar usuário." };
  }
}

// --- Funções de Gestão de Grupos ---

export async function toggleGroupActiveStatus(groupId: string, isActive: boolean) {
  try {
    const groupRef = doc(firestore, 'groups', groupId);
    await updateDoc(groupRef, { isActive });
    
    // Opcional: Bloquear todos os usuários do grupo
    if (!isActive) {
        const usersQuery = query(collection(firestore, 'userProfiles'), where('groupId', '==', groupId));
        const usersSnapshot = await getDocs(usersQuery);
        
        const batch = firestore.batch();
        usersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isActive: false });
        });
        await batch.commit();
    }
    
    return { success: true, message: `Grupo ${isActive ? 'ativado' : 'bloqueado'} com sucesso.` };
  } catch (error) {
    console.error("Erro ao alterar status do grupo:", error);
    return { success: false, message: "Erro ao alterar status do grupo." };
  }
}

export async function deleteGroup(groupId: string) {
  try {
    // 1. Verificar se há usuários ativos no grupo
    const usersQuery = query(collection(firestore, 'userProfiles'), where('groupId', '==', groupId), where('isActive', '==', true));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
        return { success: false, message: "Não é possível deletar o grupo. Existem usuários ativos associados." };
    }
    
    // 2. Deletar o grupo (ou inativar)
    const groupRef = doc(firestore, 'groups', groupId);
    await updateDoc(groupRef, { isActive: false }); // Apenas inativamos
    
    return { success: true, message: "Grupo inativado com sucesso." };
  } catch (error) {
    console.error("Erro ao deletar grupo:", error);
    return { success: false, message: "Erro ao deletar grupo." };
  }
}
