# Stock Master - Sistema de Gerenciamento de Estoque

## 🚀 Melhorias Implementadas

### 1. ✅ Campo de Preço nos Produtos
- Adicionado campo `price` ao modelo de dados `Product`
- Todos os produtos iniciais agora possuem preços realistas (R$ 65,40 a R$ 142,30)
- Campo de preço adicionado ao formulário de adicionar/editar produto
- Validação de preço implementada (não pode ser negativo)
- Coluna de preço adicionada à tabela de inventário com formatação em BRL

### 2. ✅ Cálculo Real do Valor Total do Estoque
- Substituído o cálculo mockado (preço fixo de R$50) por cálculo real
- Agora usa: `quantidade × preço` para cada produto
- Valor total exibido no dashboard reflete o estoque real

### 3. ✅ Cálculo Real de Saídas (30 dias)
- Substituído valor hardcoded ("1,204") por cálculo dinâmico
- Filtra movimentações do tipo "Saída" dos últimos 30 dias
- Soma as quantidades reais de saídas do período
- Atualiza automaticamente conforme novas movimentações

### 4. ✅ Histórico de Movimentações por Produto
- Novo componente `ProductHistoryDialog` criado
- Opção "Ver Histórico" adicionada ao menu de ações de cada produto
- Exibe:
  - Estoque atual
  - Total de entradas
  - Total de saídas
  - Tabela completa de movimentações com data/hora, tipo, quantidade e observações
- Ordenação por data mais recente

### 5. ✅ Exportação de Relatórios
- Botão "Exportar Relatório" adicionado à página de relatórios
- Gera arquivo HTML completo com:
  - Resumo geral (estatísticas principais)
  - Estoque por categoria
  - Inventário completo (todos os produtos)
  - Movimentações recentes (últimos 20 registros)
- Formatação profissional com cores do tema da aplicação
- Destaque visual para itens com baixo estoque
- Data de geração incluída no relatório

### 6. ✅ Persistência de Configurações
- Implementado salvamento de preferências no Firestore
- Configurações salvas:
  - Notificações de estoque baixo por email
  - Relatórios semanais por email
  - Tema (claro/escuro/sistema)
- Carregamento automático das configurações ao acessar a página
- Feedback visual ao salvar (toast de confirmação)
- Estados de loading durante carregamento e salvamento

### 7. ✅ Validações e Melhorias de UX
- Todos os formulários validados com Zod
- Mensagens de erro claras e em português
- Estados de loading em operações assíncronas
- Feedback visual para todas as ações (toasts)
- Badges coloridos para status de estoque (verde/amarelo/vermelho)

## 📊 Estrutura de Dados Atualizada

### Product
```typescript
{
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  location: string;
  price: number; // ✨ NOVO
}
```

### UserSettings
```typescript
{
  id: string;
  userId: string;
  notifications: {
    lowStockEmail: boolean;
    weeklyReportsEmail: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  updatedAt?: Date | string;
}
```

## 🎯 Funcionalidades Completas

### Dashboard
- ✅ Total de produtos (dinâmico)
- ✅ Itens com baixo estoque (calculado em tempo real)
- ✅ Valor total do estoque (baseado em preços reais)
- ✅ Saídas dos últimos 30 dias (calculado de movimentações reais)
- ✅ Gráfico de visão geral do estoque
- ✅ Lista de movimentações recentes

### Inventário
- ✅ Listagem completa de produtos
- ✅ Adicionar novo produto (com preço)
- ✅ Editar produto existente
- ✅ Excluir produto
- ✅ Registrar entrada de estoque
- ✅ Registrar saída de estoque
- ✅ Ver histórico de movimentações por produto
- ✅ Filtros e busca
- ✅ Badges de status (estoque baixo, zero, normal)

### Relatórios
- ✅ Gráfico de estoque por categoria
- ✅ Gráfico de movimentações (últimos 7 dias)
- ✅ Exportação de relatório completo em HTML

### Recomendações
- ✅ Formulário para gerar plano de reposição
- ✅ Integração com IA (Google Genkit)
- ✅ Exibição de plano sugerido
- ✅ Fundamentação da recomendação

### Configurações
- ✅ Preferências de notificações (persistidas)
- ✅ Modo escuro/claro (persistido)
- ✅ Salvamento no Firestore

## 🔧 Como Usar

### Instalação
```bash
cd studio-main
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 📝 Notas Técnicas

- **Framework**: Next.js 15 com App Router
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **Backend**: Firebase Firestore
- **Autenticação**: Firebase Auth (anônima)
- **IA**: Google Genkit
- **Validação**: Zod
- **Formulários**: React Hook Form

## 🎨 Guia de Estilo

- **Cor Primária**: Azul Suave (#6699CC)
- **Cor de Fundo**: Cinza Claro (#F0F0F0)
- **Cor de Destaque**: Teal Suave (#77B9B9)
- **Fonte**: PT Sans

## 🚀 Próximos Passos Sugeridos

1. **Notificações por Email** (requer serviço externo como SendGrid)
2. **Upload de Imagens de Produtos**
3. **Data de Validade** para produtos perecíveis
4. **Gráficos Avançados** (tendências, previsões)
5. **Sistema Multi-tenant** (múltiplos usuários/empresas)
6. **App Mobile** (React Native)
7. **Relatórios em PDF** (usando biblioteca de PDF)
8. **Código de Barras/QR Code** para produtos
9. **Integração com APIs de Fornecedores**
10. **Dashboard de Analytics Avançado**

## 📄 Licença

Este projeto foi desenvolvido como um sistema de gerenciamento de estoque para peças de caminhões.
