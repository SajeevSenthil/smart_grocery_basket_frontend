"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBasket, CreditCard, Package } from 'lucide-react'
import { Product } from '@/types/product'

interface BasketItem extends Product {
  quantity: number
}

interface GroceryBasketProps {
  items: BasketItem[]
  onUpdateQuantity: (productId: string, change: number) => void
  onClearBasket: () => void
}

export default function GroceryBasket({ items, onUpdateQuantity, onClearBasket }: GroceryBasketProps) {
  console.log("GroceryBasket rendered", { itemCount: items.length })

  const calculateTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [items])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = calculateTotal()

  console.log("Basket calculations:", { totalItems, totalPrice })

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-white py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
            <ShoppingBasket className="h-5 w-5 text-green-600" />
            Smart Grocery Basket
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalItems} items
              </Badge>
            )}
          </CardTitle>
          <Button 
            onClick={() => {
              console.log("Clear basket clicked")
              onClearBasket()
            }}
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Your basket is empty</p>
            <p className="text-sm mt-1">Scan a product to add items</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.barcode} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  {/* Product Image Placeholder */}
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-slate-400" />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-600">₹{item.price.toFixed(2)}</p>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log("Decreasing quantity for:", item.barcode)
                        onUpdateQuantity(item.barcode, -1)
                      }}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log("Increasing quantity for:", item.barcode)
                        onUpdateQuantity(item.barcode, 1)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-slate-800">Total</span>
                <span className="text-xl font-bold text-slate-900">₹{totalPrice.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}