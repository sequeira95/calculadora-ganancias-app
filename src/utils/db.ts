// src/utils/db.ts

import Dexie, { type Table } from 'dexie';
// 1. Importa 'Transaction' y mantén 'SoldProduct' temporalmente
import type { Product, SoldProduct, Expense, Transaction } from 'src/types/models';

class AppDatabase extends Dexie {
  public products!: Table<Product, number>;
  public soldProducts!: Table<SoldProduct, number>; // Se mantiene para migración
  public expenses!: Table<Expense, number>;
  public transactions!: Table<Transaction, number>; // 2. Declara la nueva tabla

  public constructor() {
    super('ProductDatabaseQuasar');
    // 3. Incrementa la versión a 5 y define la nueva tabla
    this.version(5).stores({
      products: '++id, nombre',
      soldProducts: '++id, saleDate',
      expenses: '++id, nombre',
      transactions: '++id, date, type', // Nueva tabla con índices en fecha y tipo
    });
    // Mantenemos las versiones anteriores para una actualización segura
    this.version(4).stores({
      products: '++id, nombre',
      soldProducts: '++id, saleDate',
      expenses: '++id, nombre',
    });
    this.version(3).stores({
      products: '++id, nombre',
      soldProducts: '++id, saleDate',
    });
  }
}

export const db = new AppDatabase();
