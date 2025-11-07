import { auth, db } from './firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

// Função para verificar variáveis de ambiente
export const checkEnvironmentVariables = () => {
  console.log('=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars: string[] = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.error(`❌ ${varName}: AUSENTE`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
  });

  if (missingVars.length > 0) {
    console.error('Variáveis de ambiente ausentes:', missingVars);
    return false;
  }

  console.log('✅ Todas as variáveis de ambiente estão configuradas');
  return true;
};

// Função para testar a configuração do Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('=== TESTE DE CONFIGURAÇÃO FIREBASE ===');
    
    // Testar configuração básica
    console.log('Auth instance:', auth);
    console.log('Firestore instance:', db);
    console.log('Project ID:', auth.app.options.projectId);
    console.log('Auth Domain:', auth.app.options.authDomain);
    
    return true;
  } catch (error) {
    console.error('Erro na configuração do Firebase:', error);
    return false;
  }
};

// Função para testar a conexão e permissões do Firebase
export const firebaseTest = {
  // Testar conexão básica
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testando conexão com Firebase...');
      
      // Verificar variáveis de ambiente primeiro
      const envCheck = checkEnvironmentVariables();
      if (!envCheck) {
        return {
          success: false,
          message: 'Variáveis de ambiente do Firebase não configuradas corretamente'
        };
      }
      
      // Testar conexão básica
      await testFirebaseConnection();
      
      console.log('✅ Conexão com Firebase funcionando!');
      return {
        success: true,
        message: 'Conexão com Firebase estabelecida com sucesso'
      };
    } catch (error: any) {
      console.error('❌ Erro ao conectar com Firebase:', error);
      return {
        success: false,
        message: `Erro de conexão: ${error.message}`
      };
    }
  },

  // Testar autenticação específica
  async testAuthentication(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testando configuração de autenticação...');
      
      // Verificar se o auth está configurado
      if (!auth) {
        throw new Error('Auth não inicializado');
      }
      
      console.log('Auth configurado:', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
        currentUser: auth.currentUser
      });
      
      return {
        success: true,
        message: 'Autenticação configurada corretamente'
      };
    } catch (error: any) {
      console.error('❌ Erro na configuração de autenticação:', error);
      return {
        success: false,
        message: `Erro de autenticação: ${error.message}`
      };
    }
  },

  // Testar todas as configurações
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando testes completos do Firebase...');
    
    const connectionTest = await this.testConnection();
    console.log('Teste de Conexão:', connectionTest);
    
    const authTest = await this.testAuthentication();
    console.log('Teste de Autenticação:', authTest);
    
    if (connectionTest.success && authTest.success) {
      console.log('🎉 Todos os testes passaram! Firebase está configurado corretamente.');
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique a configuração do Firebase.');
    }
  }
};
        message: 'Conexão estabelecida com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      return {
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  },

  // Testar permissões de leitura
  async testReadPermissions(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📖 Testando permissões de leitura...');
      
      const testCollection = collection(db, 'teste');
      await getDocs(testCollection);
      
      console.log('✅ Permissões de leitura funcionando!');
      return {
        success: true,
        message: 'Permissões de leitura funcionando!'
      };
    } catch (error) {
      console.error('❌ Erro nas permissões de leitura:', error);
      return {
        success: false,
        message: `Erro de leitura: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  },

  // Testar permissões de escrita
  async testWritePermissions(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('✍️ Testando permissões de escrita...');
      
      const testDoc = doc(db, 'teste', 'teste-escrita');
      await setDoc(testDoc, {
        timestamp: new Date(),
        teste: 'permissao-escrita'
      });
      
      console.log('✅ Permissões de escrita funcionando!');
      return {
        success: true,
        message: 'Permissões de escrita funcionando!'
      };
    } catch (error) {
      console.error('❌ Erro nas permissões de escrita:', error);
      return {
        success: false,
        message: `Erro de escrita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  },

  // Executar todos os testes
  async runAllTests(): Promise<{
    connection: boolean;
    read: boolean;
    write: boolean;
    messages: string[];
  }> {
    const results = {
      connection: false,
      read: false,
      write: false,
      messages: [] as string[]
    };

    // Teste de conexão
    const connectionTest = await this.testConnection();
    results.connection = connectionTest.success;
    results.messages.push(connectionTest.message);

    if (!connectionTest.success) {
      results.messages.push('⚠️ Parando testes devido a erro de conexão');
      return results;
    }

    // Teste de leitura
    const readTest = await this.testReadPermissions();
    results.read = readTest.success;
    results.messages.push(readTest.message);

    // Teste de escrita
    const writeTest = await this.testWritePermissions();
    results.write = writeTest.success;
    results.messages.push(writeTest.message);

    return results;
  },

  // Diagnóstico completo
  async diagnose(): Promise<string[]> {
    const messages: string[] = [];
    
    messages.push('🔧 DIAGNÓSTICO DO FIREBASE');
    messages.push('=' .repeat(40));
    
    try {
      const tests = await this.runAllTests();
      
      messages.push('📊 RESULTADOS:');
      messages.push(`Conexão: ${tests.connection ? '✅' : '❌'}`);
      messages.push(`Leitura: ${tests.read ? '✅' : '❌'}`);
      messages.push(`Escrita: ${tests.write ? '✅' : '❌'}`);
      messages.push('');
      
      messages.push('📝 DETALHES:');
      tests.messages.forEach(msg => messages.push(`- ${msg}`));
      
      if (!tests.connection || !tests.read || !tests.write) {
        messages.push('');
        messages.push('🚨 PROBLEMAS DETECTADOS:');
        
        if (!tests.connection) {
          messages.push('❌ Problema de conexão - Verifique:');
          messages.push('  • Configurações do Firebase (.env.local)');
          messages.push('  • Conexão com a internet/VPN');
          messages.push('  • ID do projeto correto');
        }
        
        if (!tests.read || !tests.write) {
          messages.push('❌ Problema de permissões - Soluções:');
          messages.push('  • Acesse: https://console.firebase.google.com');
          messages.push('  • Vá em Firestore Database → Regras');
          messages.push('  • Substitua por: allow read, write: if true;');
          messages.push('  • Clique em "Publicar"');
        }
      } else {
        messages.push('');
        messages.push('🎉 TUDO FUNCIONANDO PERFEITAMENTE!');
        messages.push('Você pode prosseguir com a população do banco.');
      }
      
    } catch (error) {
      messages.push(`❌ Erro no diagnóstico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    return messages;
  }
};