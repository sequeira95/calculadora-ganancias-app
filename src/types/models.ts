export interface Product {
  id?: number;
  nombre: string;
  cantidadInventario: number;
  costoUnitario: number;
  precioVentaUnitario: number;
  cantidadVendida?: number;
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
