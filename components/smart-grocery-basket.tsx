"use client"

import React, { useState, useCallback } from 'react'
import RealTimeScanner from './real-time-scanner'
import GroceryBasket from './grocery-basket'
import { Product } from '@/types/product'
import { getProductByBarcode } from '@/data/products'
import { toast } from 'sonner'

interface BasketItem extends Product {
  quantity: number
}

export default function SmartGroceryBasket() {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([])

  console.log("SmartGroceryBasket rendered", { basketCount: basketItems.length })

  const handleProductScanned = useCallback((productId: string) => {
    console.log("Product scanned:", productId)
    
    const productData = getProductByBarcode(productId)
    console.log("Product data retrieved:", productData)

    setBasketItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.barcode === productId)
      
      if (existingItemIndex !== -1) {
        console.log("Product already exists, increasing quantity")
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        }
        console.log("Updated basket items:", updatedItems)
        toast.success(`Added another ${productData.name} to basket`)
        return updatedItems
      } else {
        console.log("Adding new product to basket")
        const newItem: BasketItem = { ...productData, quantity: 1 }
        const updatedItems = [...prevItems, newItem]
        console.log("Updated basket items:", updatedItems)
        toast.success(`Added ${productData.name} to basket`)
        return updatedItems
      }
    })
  }, [])

  const handleUpdateQuantity = useCallback((productId: string, change: number) => {
    console.log("Updating quantity:", { productId, change })
    
    setBasketItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.barcode === productId) {
          const newQuantity = Math.max(0, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
      
      console.log("Updated basket after quantity change:", updatedItems)
      return updatedItems
    })
  }, [])

  const handleClearBasket = useCallback(() => {
    console.log("Clearing basket")
    setBasketItems([])
    toast.success("Basket cleared")
  }, [])

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Smart Grocery Basket</h1>
          <p className="text-green-100 text-lg">Scan products to add them to your basket</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div>
            <RealTimeScanner onScan={handleProductScanned} />
          </div>
          
          {/* Basket Section */}
          <div>
            <GroceryBasket
              items={basketItems}
              onUpdateQuantity={handleUpdateQuantity}
              onClearBasket={handleClearBasket}
            />
          </div>
        </div>

        {/* Footer with test codes */}
        <div className="mt-8 text-center text-sm text-slate-600">
          <p className="mb-2">Test with these barcodes:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["012345678901", "012345678902", "012345678903", "123456789012"].map(code => (
              <code key={code} className="px-3 py-1 bg-white rounded border text-xs font-mono">
                {code}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}