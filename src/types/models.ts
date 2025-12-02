// src/types/models.ts

export interface Product {
  id?: number;
  nombre: string;
  cantidadInventario: number;
  costoUnitario: number;
  precioVentaUnitario: number;
  cantidadVendida?: number;
  comment?: string;
  isCustom?: boolean;
}

export interface Expense {
  id?: number;
  nombre: string;
  valor: number;
  cantidad?: number;
  comment?: string;
}

export interface SoldProduct {
  id?: number;
  productId: number;
  nombre: string;
  cantidadVendida: number;
  costoUnitario: number;
  precioVentaUnitario: number;
  ganancia: number;
  saleDate: number;
}

export interface Transaction {
  id?: number;
  type: 'sale' | 'expense'; // Para diferenciar el tipo
  date: number; // Timestamp de la transacción
  name: string; // Nombre del producto o gasto
  quantity: number; // Cantidad vendida o incurrida
  unitCost: number; // Costo unitario (para productos) o valor (para gastos)
  unitPrice?: number; // Precio de venta (solo para ventas)
  profit?: number; // Ganancia (solo para ventas)
  total: number; // Monto total (positivo para ventas, negativo para gastos)
  comment?: string; // Comentario opcional de la transacción
  isCustom?: boolean; // Indica si es un producto personalizado
}
