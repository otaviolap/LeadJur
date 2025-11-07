import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Versão simplificada para teste
export const simpleRegister = async (email: string, password: string) => {
  try {
    console.log('🚀 Tentando criar usuário simples...');
    console.log('Email:', email);
    console.log('Senha length:', password.length);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Usuário criado com sucesso!', userCredential.user.uid);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Erro detalhado:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};