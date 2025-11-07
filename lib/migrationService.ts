import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseAlt';
import { getCurrentUser } from './authService';

// Função para migrar leads da estrutura antiga para a nova (leads específicos por usuário)
export const migrateLeadsToUserStructure = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('Usuário não autenticado - pulando migração');
      return;
    }

    console.log('🔄 Iniciando migração de leads para estrutura específica por usuário...');

    // Verificar se há leads na estrutura antiga (coleção global 'leads')
    try {
      const oldLeadsCollection = collection(db, 'leads');
      const oldLeadsSnapshot = await getDocs(oldLeadsCollection);
      
      if (oldLeadsSnapshot.empty) {
        console.log('✅ Nenhum lead na estrutura antiga encontrado');
        return;
      }

      console.log(`📦 Encontrados ${oldLeadsSnapshot.size} leads na estrutura antiga`);

      // Mover leads para a estrutura nova (users/{userId}/leads)
      let movedCount = 0;
      
      for (const leadDoc of oldLeadsSnapshot.docs) {
        const leadData = leadDoc.data();
        const leadId = leadDoc.id;

        // Criar lead na nova estrutura
        const newLeadRef = doc(db, `users/${user.uid}/leads`, leadId);
        await setDoc(newLeadRef, {
          ...leadData,
          userId: user.uid, // Adicionar campo userId
          migratedAt: new Date()
        });

        // Deletar lead da estrutura antiga
        await deleteDoc(leadDoc.ref);
        
        movedCount++;
        console.log(`✅ Lead migrado: ${leadId}`);
      }

      console.log(`🎉 Migração concluída! ${movedCount} leads movidos para o usuário ${user.uid}`);
      
    } catch (error: any) {
      // Se der erro de permissão, significa que não há leads na estrutura antiga
      if (error.code === 'permission-denied') {
        console.log('✅ Estrutura antiga não existe ou sem permissão - migração não necessária');
        return;
      }
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro durante migração de leads:', error);
    // Não propagar o erro para não quebrar a aplicação
  }
};

// Função para verificar se o usuário já tem leads na nova estrutura
export const checkUserLeadsStructure = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const userLeadsCollection = collection(db, `users/${user.uid}/leads`);
    const snapshot = await getDocs(userLeadsCollection);
    
    console.log(`👤 Usuário ${user.uid} tem ${snapshot.size} leads na estrutura nova`);
    return snapshot.size > 0;
    
  } catch (error) {
    console.error('Erro ao verificar estrutura de leads do usuário:', error);
    return false;
  }
};