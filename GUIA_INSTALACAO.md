# Guia de Instalação e Uso - Stock Master

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm
- Conta Firebase (para produção)

### Passo 1: Extrair o Projeto
```bash
unzip studio-melhorado.zip
cd studio-main
```

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Configurar Firebase (Opcional)

Se você quiser usar seu próprio projeto Firebase:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Ative Authentication (método anônimo)
4. Copie as credenciais do Firebase
5. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

**Nota:** O projeto já vem com configuração Firebase de desenvolvimento. Você pode testar sem configurar seu próprio Firebase.

### Passo 4: Executar em Desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em: http://localhost:3000

### Passo 5: Build para Produção
```bash
npm run build
npm start
```

## 🚀 Primeiro Uso

### 1. Acesso Inicial
- Ao acessar o sistema pela primeira vez, você será autenticado automaticamente (autenticação anônima)
- Os dados de exemplo (32 produtos de filtros para caminhões) serão carregados automaticamente

### 2. Navegação

#### Dashboard (/)
- Visualize estatísticas gerais do estoque
- Total de produtos
- Itens com baixo estoque
- Valor total do estoque (calculado com preços reais)
- Saídas dos últimos 30 dias (calculado de movimentações reais)
- Gráfico de visão geral
- Movimentações recentes

#### Inventário (/inventory)
- **Adicionar Produto**: Clique no botão "Adicionar Produto"
  - Preencha: Nome, SKU, Categoria, Quantidade, Nível de Reposição, Preço, Localização
  - Todos os campos são validados
  
- **Editar Produto**: No menu de ações (⋮), selecione "Editar"
  
- **Excluir Produto**: No menu de ações (⋮), selecione "Excluir"
  
- **Registrar Entrada**: No menu de ações (⋮), selecione "Registrar Entrada"
  - Informe a quantidade
  - Adicione observações (opcional)
  
- **Registrar Saída**: No menu de ações (⋮), selecione "Registrar Saída"
  - Informe a quantidade
  - Adicione observações (opcional)
  - Sistema valida se há estoque suficiente
  
- **Ver Histórico**: No menu de ações (⋮), selecione "Ver Histórico"
  - Visualize todas as movimentações do produto
  - Veja totais de entradas e saídas

#### Relatórios (/reports)
- Visualize gráficos:
  - Estoque por categoria
  - Movimentações dos últimos 7 dias
  
- **Exportar Relatório**: Clique em "Exportar Relatório"
  - Arquivo HTML será baixado automaticamente
  - Contém todos os dados do estoque
  - Formatação profissional pronta para impressão

#### Recomendações (/recommendations)
- Gere plano de reposição com IA
- Informe o nível de serviço desejado (80-99%)
- Sistema analisa dados e sugere quantidades para reposição

#### Configurações (/settings)
- **Notificações**:
  - Alertas de estoque baixo por email
  - Relatórios semanais por email
  
- **Aparência**:
  - Modo escuro/claro
  
- Clique em "Salvar Preferências" para persistir as alterações

## 💡 Dicas de Uso

### Gestão de Estoque
1. Mantenha o campo "Nível de Reposição" atualizado para cada produto
2. Produtos com estoque igual ou abaixo do nível de reposição aparecem em destaque
3. Use observações nas movimentações para rastrear motivos (venda, ajuste, etc.)

### Preços
- Sempre informe o preço unitário ao adicionar produtos
- O valor total do estoque é calculado automaticamente
- Atualize preços regularmente para manter relatórios precisos

### Relatórios
- Exporte relatórios regularmente para backup
- Use o relatório HTML para apresentações ou impressão
- Arquivo pode ser convertido para PDF usando o navegador (Ctrl+P → Salvar como PDF)

### Histórico
- Consulte o histórico de produtos para auditorias
- Identifique padrões de consumo
- Rastreie movimentações suspeitas

## 🔧 Solução de Problemas

### Dados não aparecem
- Limpe o localStorage do navegador
- Recarregue a página (F5)
- Os dados serão re-carregados automaticamente

### Erro ao salvar configurações
- Verifique se está conectado à internet
- Verifique as credenciais do Firebase
- Veja o console do navegador para mais detalhes

### Erro de autenticação
- Limpe cookies e cache do navegador
- Recarregue a página
- Sistema fará login automático

## 📱 Compatibilidade

### Navegadores Suportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- Desktop (recomendado)
- Tablet (responsivo)
- Mobile (responsivo)

## 🔐 Segurança

### Dados
- Todos os dados são armazenados no Firestore
- Autenticação anônima ativa por padrão
- Para produção, implemente autenticação com email/senha

### Regras de Firestore Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if request.auth != null;
    }
    match /stockMovements/{movementId} {
      allow read, write: if request.auth != null;
    }
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação no `README_MELHORIAS.md`
2. Verifique o arquivo `VALIDACAO_MELHORIAS.md` para detalhes técnicos
3. Revise os logs do console do navegador

## 🎯 Próximos Passos

Após dominar o básico:
1. Configure seu próprio Firebase
2. Personalize categorias de produtos
3. Ajuste níveis de reposição
4. Configure notificações por email (requer serviço externo)
5. Adicione mais usuários (implemente autenticação completa)

---

**Stock Master** - Sistema de Gerenciamento de Estoque de Peças para Caminhões
Versão com Melhorias - Novembro 2025
