export interface Product {
  barcode: string
  name: string
  price: number
  quantity: number
  category?: string
  brand?: string
  imageUrl?: string
}

export interface ProductDatabase {
  [barcode: string]: Omit<Product, 'quantity'>
}