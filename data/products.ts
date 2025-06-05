import { ProductDatabase } from '@/types/product'

// Sample product database with common barcodes
export const productDatabase: ProductDatabase = {
  // Common grocery items
  "012345678901": {
    barcode: "012345678901",
    name: "Coca Cola 330ml",
    price: 45.00,
    category: "Beverages",
    brand: "Coca Cola"
  },
  "012345678902": {
    barcode: "012345678902", 
    name: "Bread Loaf White",
    price: 25.00,
    category: "Bakery",
    brand: "Wonder"
  },
  "012345678903": {
    barcode: "012345678903",
    name: "Milk 1L Whole",
    price: 60.00,
    category: "Dairy",
    brand: "Amul"
  },
  "012345678904": {
    barcode: "012345678904",
    name: "Bananas 1kg",
    price: 40.00,
    category: "Fruit",
    brand: "Fresh"
  },
  "012345678905": {
    barcode: "012345678905",
    name: "Maggi Noodles 2min",
    price: 12.00,
    category: "Instant Food",
    brand: "Nestle"
  },
  // Common UPC codes for testing
  "123456789012": {
    barcode: "123456789012",
    name: "Parle-G Biscuits",
    price: 10.00,
    category: "Snacks",
    brand: "Parle"
  },
  "789123456012": {
    barcode: "789123456012", 
    name: "Tata Tea Premium",
    price: 85.00,
    category: "Beverages",
    brand: "Tata"
  },
  "456789123012": {
    barcode: "456789123012",
    name: "Sunflower Oil 1L", 
    price: 120.00,
    category: "Cooking Oil",
    brand: "Fortune"
  }
}

export function getProductByBarcode(barcode: string) {
  console.log("Looking up product for barcode:", barcode)
  const product = productDatabase[barcode]
  
  if (product) {
    console.log("Product found:", product)
    return product
  }
  
  console.log("Product not found, creating generic product")
  // Return a generic product if not found in database
  return {
    barcode,
    name: `Unknown Product (${barcode})`,
    price: 0.00,
    category: "Unknown",
    brand: "Unknown"
  }
}