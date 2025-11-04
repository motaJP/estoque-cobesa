"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Product, StockMovement } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface ExportReportButtonProps {
  products: Product[];
  stockMovements: StockMovement[];
}

function formatDate(timestamp: StockMovement['timestamp']): string {
  if (!timestamp) return 'Data indisponível';
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp as Date;
  }
  return date.toLocaleDateString('pt-BR');
}

export function ExportReportButton({ products, stockMovements }: ExportReportButtonProps) {
  const handleExport = () => {
    // Calcular estatísticas
    const totalProducts = products.length;
    const totalStockValue = products.reduce((acc, p) => acc + (p.quantity * (p.price || 0)), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const exitsLast30Days = stockMovements
      .filter(m => {
        if (!m.timestamp) return false;
        let date: Date;
        if (typeof m.timestamp === 'object' && 'toDate' in m.timestamp) {
          date = (m.timestamp as any).toDate();
        } else if (typeof m.timestamp === 'string') {
          date = new Date(m.timestamp);
        } else {
          date = m.timestamp as Date;
        }
        return m.type === 'Saída' && date >= thirtyDaysAgo;
      })
      .reduce((acc, m) => acc + m.quantity, 0);

    // Agrupar por categoria
    const categoryData = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { quantity: 0, value: 0 };
      }
      acc[product.category].quantity += product.quantity;
      acc[product.category].value += product.quantity * (product.price || 0);
      return acc;
    }, {} as Record<string, { quantity: number; value: number }>);

    // Criar conteúdo HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Estoque - Stock Master</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #6699CC;
      border-bottom: 3px solid #6699CC;
      padding-bottom: 10px;
    }
    h2 {
      color: #77B9B9;
      margin-top: 30px;
      border-bottom: 2px solid #77B9B9;
      padding-bottom: 5px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .stat-card {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 8px;
      background: #f9f9f9;
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    .stat-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #6699CC;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #6699CC;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .low-stock {
      color: #dc2626;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Relatório de Estoque - Stock Master</h1>
  <p><strong>Data de Geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  
  <h2>Resumo Geral</h2>
  <div class="stats">
    <div class="stat-card">
      <h3>Total de Produtos</h3>
      <div class="value">${totalProducts}</div>
    </div>
    <div class="stat-card">
      <h3>Valor Total do Estoque</h3>
      <div class="value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalStockValue)}</div>
    </div>
    <div class="stat-card">
      <h3>Itens com Baixo Estoque</h3>
      <div class="value" style="color: ${lowStockItems > 0 ? '#dc2626' : '#16a34a'}">${lowStockItems}</div>
    </div>
    <div class="stat-card">
      <h3>Saídas (30 dias)</h3>
      <div class="value">${exitsLast30Days}</div>
    </div>
  </div>

  <h2>Estoque por Categoria</h2>
  <table>
    <thead>
      <tr>
        <th>Categoria</th>
        <th>Quantidade Total</th>
        <th>Valor Total</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(categoryData).map(([category, data]) => `
        <tr>
          <td>${category}</td>
          <td>${data.quantity}</td>
          <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Inventário Completo</h2>
  <table>
    <thead>
      <tr>
        <th>Produto</th>
        <th>SKU</th>
        <th>Categoria</th>
        <th>Estoque</th>
        <th>Preço</th>
        <th>Valor Total</th>
        <th>Localização</th>
      </tr>
    </thead>
    <tbody>
      ${products.map(product => `
        <tr>
          <td>${product.name}</td>
          <td>${product.sku}</td>
          <td>${product.category}</td>
          <td ${product.quantity <= product.reorderLevel ? 'class="low-stock"' : ''}>${product.quantity}</td>
          <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price || 0)}</td>
          <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.quantity * (product.price || 0))}</td>
          <td>${product.location}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Movimentações Recentes (Últimos 20 registros)</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Produto</th>
        <th>Tipo</th>
        <th>Quantidade</th>
        <th>Observações</th>
      </tr>
    </thead>
    <tbody>
      ${stockMovements.slice(0, 20).map(movement => `
        <tr>
          <td>${formatDate(movement.timestamp)}</td>
          <td>${movement.productName}</td>
          <td style="color: ${movement.type === 'Entrada' ? '#16a34a' : '#dc2626'}">${movement.type}</td>
          <td>${movement.quantity}</td>
          <td>${movement.notes || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Stock Master - Sistema de Gerenciamento de Estoque de Peças para Caminhões</p>
    <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>
    `;

    // Criar blob e fazer download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
}
