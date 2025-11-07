"use client";

import { useState } from 'react';
import { seedDatabase } from '../../lib/seedDatabase';
import { lawyerService } from '../../lib/lawyerService';
import { leadService } from '../../lib/leadService';
import { statsService } from '../../lib/statsService';
import { firebaseTest } from '../../lib/firebaseTest';
import { useAuth } from '../../lib/useAuth';

export default function PopulateDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { user, profile, authenticated } = useAuth();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebase = async () => {
    setIsLoading(true);
    setLogs([]);
    
    try {
      addLog("🔧 Iniciando diagnóstico do Firebase...");
      
      await firebaseTest.runAllTests();
      addLog("✅ Diagnóstico completo! Veja o console para detalhes.");
      
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      addLog(`❌ Erro no diagnóstico: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const populateDatabase = async () => {
    setIsLoading(true);
    setLogs([]);
    
    try {
      addLog("🚀 Iniciando população do banco de dados...");
      
      // Verificar se o usuário está autenticado
      if (!authenticated || !user) {
        addLog("❌ Usuário não autenticado!");
        addLog("⚠️  Para popular os leads, você precisa estar logado.");
        addLog("🔑 Acesse: http://localhost:3000 e faça login primeiro.");
        return;
      }
      
      addLog(`👤 Usuário autenticado: ${profile?.fullName || user.email}`);
      
      // Primeiro, adicionar advogados
      addLog("👨‍⚖️ Adicionando advogados de exemplo...");
      await lawyerService.addSampleLawyers();
      addLog("✅ Advogados adicionados com sucesso!");
      
      // Depois, adicionar leads (específicos do usuário)
      addLog("📋 Adicionando leads de exemplo para o usuário atual...");
      await seedDatabase.addSampleLeads();
      addLog("✅ Leads adicionados com sucesso para seu usuário!");
      
      // Adicionar algumas atividades
      addLog("📊 Adicionando atividades de exemplo...");
      await seedDatabase.addSampleActivities();
      addLog("✅ Atividades adicionadas com sucesso!");
      
      // Calcular estatísticas
      addLog("📈 Calculando estatísticas...");
      const newStats = await statsService.getDashboardStats();
      setStats(newStats);
      addLog("✅ Estatísticas calculadas!");
      
      addLog("🎉 População do banco concluída com sucesso!");
      
    } catch (error) {
      console.error('Erro ao popular banco:', error);
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDatabase = async () => {
    try {
      addLog("🔍 Verificando dados existentes...");
      
      const [leads, lawyers] = await Promise.all([
        leadService.getLeads(),
        lawyerService.getLawyers()
      ]);
      
      addLog(`📋 Leads encontrados: ${leads.length}`);
      addLog(`👨‍⚖️ Advogados encontrados: ${lawyers.length}`);
      
      const newStats = await statsService.getDashboardStats();
      setStats(newStats);
      addLog("✅ Verificação concluída!");
      
    } catch (error) {
      console.error('Erro ao verificar banco:', error);
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Configuração do Banco de Dados LeadJur</h1>
        
        {/* Status de Autenticação */}
        <div className="mb-6 p-4 rounded-lg border-2 border-gray-700 bg-gray-800">
          <h3 className="text-lg font-semibold mb-2">👤 Status de Autenticação</h3>
          {authenticated && user ? (
            <div className="text-green-400">
              <p>✅ <strong>Logado:</strong> {profile?.fullName || user.email}</p>
              <p>🏢 <strong>Empresa:</strong> {profile?.company || 'Não informado'}</p>
              <p>🆔 <strong>ID:</strong> {user.uid}</p>
            </div>
          ) : (
            <div className="text-red-400">
              <p>❌ <strong>Não autenticado</strong></p>
              <p>⚠️ Para popular leads, faça login em: <a href="http://localhost:3000" className="text-blue-400 hover:underline">http://localhost:3000</a></p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testFirebase}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? "🔄 Testando..." : "🔧 Testar Firebase"}
          </button>
          
          <button
            onClick={populateDatabase}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? "🔄 Populando..." : "🚀 Popular Banco"}
          </button>
          
          <button
            onClick={checkDatabase}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔍 Verificar Dados
          </button>
        </div>

        {stats && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">📊 Estatísticas Atuais</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalLeads}</div>
                <div className="text-sm text-gray-300">Total de Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalLawyers}</div>
                <div className="text-sm text-gray-300">Total de Advogados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.contactsRevealed}</div>
                <div className="text-sm text-gray-300">Contatos Revelados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-300">Taxa de Conversão</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">📝 Log de Atividades</h2>
          <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Clique em um dos botões acima para começar...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <h3 className="font-bold mb-2">🚨 Erro de Permissões?</h3>
          <p className="text-sm mb-2">Se você está vendo "Missing or insufficient permissions", siga estes passos:</p>
          <ol className="space-y-1 text-sm list-decimal list-inside">
            <li>Primeiro, clique em <strong>"🔧 Testar Firebase"</strong> para diagnóstico</li>
            <li>Acesse: <a href="https://console.firebase.google.com" target="_blank" className="text-blue-400 underline">https://console.firebase.google.com</a></li>
            <li>Selecione o projeto: <strong>leadjur-de479</strong></li>
            <li>Vá em <strong>Firestore Database → Regras</strong></li>
            <li>Substitua por: <code className="bg-black px-1 rounded">allow read, write: if true;</code></li>
            <li>Clique em <strong>"Publicar"</strong></li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
          <h3 className="font-bold mb-2">ℹ️ Instruções:</h3>
          <ul className="space-y-1 text-sm">
            <li>1. <strong>Faça login</strong>: Necessário para acessar seus dados pessoais</li>
            <li>2. <strong>Testar Firebase</strong>: Diagnostica problemas de conexão e permissões</li>
            <li>3. <strong>Popular Banco</strong>: Adiciona leads e atividades de exemplo na sua conta</li>
            <li>4. <strong>Verificar Dados</strong>: Mostra quantos registros existem na sua conta</li>
            <li>5. Após popular, acesse o painel principal em <code>/</code></li>
          </ul>
          <p className="text-xs mt-3 text-yellow-300">
            💡 <strong>Importante:</strong> Cada usuário tem seus próprios leads isolados. Os dados são seguros e privados.
          </p>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🏠 Ir para o Painel Principal
          </a>
        </div>
      </div>
    </div>
  );
}