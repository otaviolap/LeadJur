# 🔧 Configuração das Regras do Firebase Firestore

O erro "Missing or insufficient permissions" indica que as regras do Firestore estão bloqueando as operações. Siga os passos abaixo para corrigir:

## 🚀 Solução Rápida (Recomendada)

### **Passo 1: Acesse o Console do Firebase**
1. Vá para: https://console.firebase.google.com
2. Selecione o projeto: **leadjur-de479**
3. No menu lateral, clique em **"Firestore Database"**
4. Clique na aba **"Regras"** (Rules)

### **Passo 2: Substitua as Regras**
Substitua o conteúdo atual pelas regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para desenvolvimento
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **Passo 3: Publique as Regras**
1. Clique no botão **"Publicar"** (Publish)
2. Confirme a publicação

### **Passo 4: Teste Novamente**
1. Volte para: http://localhost:3001/setup
2. Clique em **"� Testar Firebase"** para verificar
3. Clique em **"�🚀 Popular Banco"** para adicionar dados
4. Agora deve funcionar!

---

## 🛡️ Explicação das Regras

### **Regras Atuais (Para Desenvolvimento):**
```javascript
allow read, write: if true;
```
- ✅ Permite qualquer operação
- ⚠️ **ATENÇÃO**: Apenas para desenvolvimento!

### **Para Produção (Implementar Depois):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem acessar
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔍 Verificação das Regras

### **Como Verificar se as Regras Estão Corretas:**

1. **No Console Firebase:**
   - Vá em Firestore Database → Regras
   - Deve mostrar: `allow read, write: if true;`

2. **Teste no Simulador:**
   - Clique em "Simular" no console
   - Teste operações de leitura/escrita
   - Deve retornar "Permitir"

3. **Use a Página de Setup:**
   - Acesse: http://localhost:3001/setup
   - Clique em "🔧 Testar Firebase"
   - Veja o diagnóstico completo

---

## 🚨 Solução Alternativa (Se Ainda Não Funcionar)

Se mesmo após alterar as regras ainda der erro, tente:

### **1. Verificar o Projeto:**
- Certifique-se de estar no projeto correto: `leadjur-de479`
- Verifique se o Firestore está habilitado

### **2. Recriar o Banco:**
- No console Firebase, vá em Firestore
- Se necessário, delete e recrie o banco
- Certifique-se de escolher o modo "Teste" (permite todas as operações)

### **3. Verificar Configurações:**
- Confirme se as variáveis de ambiente estão corretas no `.env.local`
- Reinicie o servidor Next.js: `npm run dev`

### **4. Limpar Cache:**
- Feche e reabra o navegador
- Ou use o modo incógnito

---

## ✅ Após Corrigir as Regras

Quando as regras estiverem configuradas corretamente:

1. **Teste a Conexão:** http://localhost:3001/setup → "🔧 Testar Firebase"
2. **Popule o Banco:** http://localhost:3001/setup → "🚀 Popular Banco"
3. **Acesse o Painel:** http://localhost:3001
4. **Teste as Funcionalidades:**
   - Busca de advogados
   - Drag & drop de leads
   - Adição de novos leads
   - Visualização de estatísticas

---

## 📋 Lista de Verificação

- [ ] Regras do Firestore alteradas para `allow read, write: if true;`
- [ ] Regras publicadas no console Firebase
- [ ] Servidor Next.js funcionando (localhost:3001)
- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Teste na página /setup executado com sucesso
- [ ] Dados visíveis no painel principal

---

## 📞 Suporte

Se ainda estiver com problemas:

1. **Verifique os logs do console** do navegador (F12)
2. **Use o diagnóstico** na página `/setup`
3. **Confirme o projeto** no Firebase Console
4. **Teste com dados simples** primeiro

---

**🎯 Resultado Esperado:** Após seguir esses passos, o banco será populado automaticamente e você verá as estatísticas reais no painel em português brasileiro!