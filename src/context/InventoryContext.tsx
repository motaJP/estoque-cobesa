"use client";

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useAuth, useUser } from '@/firebase';
// import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login'; // Removido
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Product, StockMovement } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface InventoryContextType {
  products: Product[];
  stockMovements: StockMovement[];
  isProductsLoading: boolean;
  isMovementsLoading: boolean;
  addProduct: (newProduct: Omit<Product, 'id'>) => void;
  editProduct: (editedProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  handleStockMovement: (product: Product, type: 'Entrada' | 'Saída', quantity: number, notes?: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialProductsData = [
  { name: 'Filtro de Combustível MANN 1060/4', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718; Atron 1718', quantity: 1, location: 'A31', reorderLevel: 1, price: 85.50, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 2214', category: 'Filtro de Combustível', sku: 'VW 24.250', quantity: 1, location: 'A32', reorderLevel: 1, price: 78.90, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN HU 931/5x', category: 'Filtro de Óleo', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'A33', reorderLevel: 1, price: 92.30, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN WOE 475', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'A34', reorderLevel: 1, price: 88.75, groupId: 'default-group' },
  { name: 'Filtro de Óleo WEGA 950/21', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'B31', reorderLevel: 1, price: 65.40, groupId: 'default-group' },
  { name: 'Filtro de Óleo WEGA FCD 2093', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'B31', reorderLevel: 1, price: 71.20, groupId: 'default-group' },
  { name: 'Filtro de Óleo WEGA FCD 0952', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'B31', reorderLevel: 1, price: 69.80, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN 1060/2', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'B32', reorderLevel: 1, price: 82.60, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN HU 945/2x', category: 'Filtro de Óleo', sku: 'Scania R440; Scania R500', quantity: 1, location: 'B33', reorderLevel: 1, price: 95.80, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN HU 1077 2z', category: 'Filtro de Óleo', sku: 'Scania R440; Scania R500', quantity: 1, location: 'B33', reorderLevel: 1, price: 98.50, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN WO 612', category: 'Filtro de Óleo', sku: 'VW 24.250; MB 1718', quantity: 1, location: 'B34', reorderLevel: 1, price: 76.30, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN PU 941x', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'C31', reorderLevel: 1, price: 89.90, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA REC-151', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'C31', reorderLevel: 1, price: 72.40, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN WK 1060/2', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'C31', reorderLevel: 1, price: 84.20, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN WK 10 002/1x', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'C32', reorderLevel: 1, price: 91.60, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN PU 1059x', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'C32', reorderLevel: 1, price: 87.30, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN WO 711', category: 'Filtro de Óleo', sku: 'VW 24.250', quantity: 1, location: 'C33', reorderLevel: 1, price: 73.80, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN WOE 440', category: 'Filtro de Óleo', sku: 'VW 24.250', quantity: 1, location: 'C34', reorderLevel: 1, price: 79.50, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 2214', category: 'Filtro de Combustível', sku: 'VW 24.250', quantity: 1, location: 'D31', reorderLevel: 1, price: 78.90, groupId: 'default-group' },
  { name: 'Filtro de Combustível MANN PU 1046', category: 'Filtro de Combustível', sku: 'VW 24.250', quantity: 1, location: 'D31', reorderLevel: 1, price: 86.70, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FDC 2294', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'D32', reorderLevel: 1, price: 75.60, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 0768', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'D32', reorderLevel: 1, price: 74.20, groupId: 'default-group' },
  { name: 'Filtro de Óleo MANN WO 770', category: 'Filtro de Óleo', sku: 'VW 24.250', quantity: 1, location: 'D33', reorderLevel: 1, price: 77.90, groupId: 'default-group' },
  { name: 'Filtro de Ar UNIFILTER UST65801', category: 'Filtro de Ar', sku: 'Scania R440; Scania R500', quantity: 1, location: 'D34', reorderLevel: 1, price: 125.50, groupId: 'default-group' },
  { name: 'Filtro de Óleo WEGA DAF 200', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'D35', reorderLevel: 1, price: 68.90, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 0970K', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'E31', reorderLevel: 1, price: 81.40, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 2173', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'E31', reorderLevel: 1, price: 79.80, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 2099', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'E32', reorderLevel: 1, price: 76.50, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 2214', category: 'Filtro de Combustível', sku: 'MB 1718; Atego 1718', quantity: 1, location: 'E32', reorderLevel: 1, price: 78.90, groupId: 'default-group' },
  { name: 'Filtro de Combustível WEGA FCD 30123F', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'E34', reorderLevel: 1, price: 83.20, groupId: 'default-group' },
  { name: 'Filtro de Combustível PARKER R120LJ-10M-AQII', category: 'Filtro de Combustível', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'E34', reorderLevel: 1, price: 142.30, groupId: 'default-group' },
  { name: 'Filtro de Óleo WEGA DAF 200', category: 'Filtro de Óleo', sku: 'VW 24.250; VW 25.420', quantity: 1, location: 'E35', reorderLevel: 1, price: 68.90, groupId: 'default-group' },
];


import { useAuthContext } from './AuthContext';

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile, isLoading: isAuthLoading } = useAuthContext();
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser(); // Mantido para compatibilidade, mas será substituído pelo AuthContext
  
  // Filtra os dados pelo groupId do usuário logado
  const productsRef = useMemoFirebase(() => (user && profile) ? query(collection(firestore, 'products'), where('groupId', '==', profile.groupId)) : null, [firestore, user, profile]);
  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsRef);

  const movementsRef = useMemoFirebase(() => (user && profile) ? query(collection(firestore, 'stockMovements'), where('groupId', '==', profile.groupId), orderBy('timestamp', 'desc')) : null, [firestore, user, profile]);
  const { data: stockMovements, isLoading: isMovementsLoading } = useCollection<StockMovement>(movementsRef);
  
  // Removida a autenticação anônima. O login será feito pelo AuthContext.

  useEffect(() => {
    const seedData = async () => {
      // Prevent seeding if user is not loaded, firestore is not ready, or data is still loading
      if (isAuthLoading || !user || !profile || !firestore || isProductsLoading) {
        return;
      }

      // Novo seed para multi-tenant
      const seedKey = `dataSeededMultiTenant-${profile.groupId}`;
      const hasBeenSeeded = localStorage.getItem(seedKey);
      if (hasBeenSeeded) {
        return;
      }
      
      console.log("Verificando a necessidade de atualizar os dados...");

      // Force re-seeding logic
      try {
        console.log("Iniciando a limpeza e o re-seeding dos dados...");
        const batch = writeBatch(firestore);

        // Delete all existing products
        if (products && productsRef) {
            console.log(`Excluindo ${products.length} produtos antigos.`);
            const currentDocs = await getDocs(productsRef);
            currentDocs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        // Add new products
        console.log(`Adicionando ${initialProductsData.length} novos produtos.`);
        initialProductsData.forEach((productData) => {
          const newDocRef = doc(collection(firestore, 'products'));
          batch.set(newDocRef, { ...productData, createdAt: serverTimestamp(), groupId: profile.groupId });
        });
        
        await batch.commit();

        toast({
            title: "Inventário Atualizado!",
            description: `Os dados do seu inventário foram corrigidos e atualizados.`,
        });
        console.log("Re-seeding concluído com sucesso.");
        localStorage.setItem(seedKey, 'true'); // Mark as seeded
      } catch (error) {
         console.error("Erro durante o re-seeding:", error);
         toast({
          variant: "destructive",
          title: "Erro ao atualizar dados",
          description: "Não foi possível corrigir os dados do inventário.",
        });
      }
    };

    seedData();
  }, [user, products, isProductsLoading, isUserLoading, firestore, toast, productsRef]);


  const addProduct = (newProductData: Omit<Product, 'id' | 'groupId'>) => {
    if (!productsRef || !profile) return;
    
		  const newProduct: Omit<Product, 'id'> = {
		      ...newProductData,
		      createdAt: serverTimestamp(),
		      groupId: profile.groupId,
		    }

    addDocumentNonBlocking(productsRef, newProduct);
    
    toast({
        title: "Produto Adicionado!",
        description: `${newProduct.name} foi adicionado ao seu inventário.`,
    });
  };

  const editProduct = (editedProduct: Product) => {
    if (!firestore || !profile) return;
    const productRef = doc(firestore, 'products', editedProduct.id);
    // Garante que o groupId não seja alterado
    const dataToUpdate = { ...editedProduct };
    delete dataToUpdate.groupId; 
    updateDocumentNonBlocking(productRef, dataToUpdate);
    toast({
        title: "Produto Atualizado!",
        description: `Os detalhes de ${editedProduct.name} foram atualizados.`,
    });
  }

  const deleteProduct = (productId: string) => {
    if (!firestore) return;
    const productName = products?.find(p => p.id === productId)?.name || "Produto";
    deleteDocumentNonBlocking(doc(firestore, 'products', productId));
    toast({
        variant: "destructive",
        title: "Produto Excluído!",
        description: `${productName} foi removido do seu inventário.`,
    });
  }

  const handleStockMovement = (product: Product, type: 'Entrada' | 'Saída', quantity: number, notes?: string) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', product.id);
    const newQuantity = type === 'Entrada' ? product.quantity + quantity : product.quantity - quantity;

    if (newQuantity < 0) {
      toast({
        variant: 'destructive',
        title: 'Erro de Estoque',
        description: `Não é possível registrar a saída. Estoque insuficiente para ${product.name}.`,
      });
      return;
    }

    const batch = writeBatch(firestore);

    batch.update(productRef, { quantity: newQuantity });

	  const newMovement: Omit<StockMovement, 'id' | 'timestamp'> = {
		      productId: product.id,
		      productName: product.name,
		      sku: product.sku,
		      type,
		      quantity,
		      timestamp: serverTimestamp(),
		      notes: notes || '',
		      groupId: profile.groupId, // Usa o groupId do usuário logado
		    };
    const movementRef = doc(collection(firestore, 'stockMovements'));
    batch.set(movementRef, newMovement);

    batch.commit().then(() => {
      toast({
        title: `Movimentação Registrada!`,
        description: `${quantity} unidade(s) de ${product.name} (${type}).`,
      });
    }).catch((serverError) => {
        errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: movementRef.path,
            operation: 'write',
            requestResourceData: newMovement,
        })
        );
    });
  };

  return (
    <InventoryContext.Provider value={{ 
        products: products || [], 
        stockMovements: stockMovements || [],
        isProductsLoading: isAuthLoading || isProductsLoading,
        isMovementsLoading: isAuthLoading || isMovementsLoading, 
        addProduct, 
        editProduct, 
        deleteProduct, 
        handleStockMovement 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

    