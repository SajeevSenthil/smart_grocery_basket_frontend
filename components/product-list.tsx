"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Trash2, Package2 } from 'lucide-react'
import { Product } from '@/types/product'

interface ProductListProps {
  products: Product[]
  onUpdateQuantity: (barcode: string, quantity: number) => void
  onRemoveProduct: (barcode: string) => void
}

export default function ProductList({ products, onUpdateQuantity, onRemoveProduct }: ProductListProps) {
  console.log("ProductList component rendered", { productCount: products.length })

  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalPrice = products.reduce((sum, product) => sum + (product.price * product.quantity), 0)

  console.log("Calculated totals:", { totalItems, totalPrice })

  if (products.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-600">
            <ShoppingCart className="h-5 w-5" />
            Shopping Basket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Package2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Your basket is empty</p>
            <p className="text-sm">Scan barcodes to add products</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-600">
          <ShoppingCart className="h-5 w-5" />
          Shopping Basket
          <Badge variant="secondary" className="ml-auto">
            {totalItems} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-3">
          {products.map((product) => (
            <div
              key={product.barcode}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">{product.name}</h3>
                <p className="text-sm text-slate-500">
                  ${product.price.toFixed(2)} each
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {product.barcode}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log("Decreasing quantity for product:", product.barcode)
                      onUpdateQuantity(product.barcode, Math.max(0, product.quantity - 1))
                    }}
                    disabled={product.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center font-medium">
                    {product.quantity}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log("Increasing quantity for product:", product.barcode)
                      onUpdateQuantity(product.barcode, product.quantity + 1)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    console.log("Removing product:", product.barcode)
                    onRemoveProduct(product.barcode)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}