import Dexie, { type Table } from 'dexie';
import type { Product, SoldProduct } from 'src/types/models';

class AppDatabase extends Dexie {
  public products!: Table<Product, number>;
  public soldProducts!: Table<SoldProduct, number>;

  public constructor() {
    super('ProductDatabaseQuasar');
    this.version(3).stores({
      products: '++id, nombre',
      soldProducts: '++id, saleDate',
    });
  }
}

// Se crea una única instancia de la base de datos para toda la aplicación
export const db = new AppDatabase();
