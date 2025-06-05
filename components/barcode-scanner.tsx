"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff, Package, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BarcodeScannerProps {
  onScan: (result: string) => void
  isActive: boolean
  onToggle: () => void
}

export default function BarcodeScanner({ onScan, isActive, onToggle }: BarcodeScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  console.log("BarcodeScanner component initialized", { isActive, isScanning })

  useEffect(() => {
    if (isActive && !scanner && scannerRef.current) {
      console.log("Initializing barcode scanner")
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      )

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log("Barcode scan successful:", decodedText, decodedResult)
        onScan(decodedText)
        toast.success(`Product scanned: ${decodedText}`)
      }

      const onScanFailure = (error: any) => {
        // Silent fail for continuous scanning
        console.log("Scan attempt failed (normal):", error)
      }

      try {
        html5QrcodeScanner.render(onScanSuccess, onScanFailure)
        setScanner(html5QrcodeScanner)
        setIsScanning(true)
        console.log("Scanner rendered successfully")
      } catch (error) {
        console.error("Error initializing scanner:", error)
        toast.error("Failed to initialize camera")
      }
    }

    return () => {
      if (scanner && isScanning) {
        console.log("Cleaning up scanner")
        scanner.clear().catch((error) => {
          console.error("Error clearing scanner:", error)
        })
        setIsScanning(false)
      }
    }
  }, [isActive, scanner, onScan])

  const handleToggle = () => {
    console.log("Toggle scanner button clicked", { isActive })
    if (isActive && scanner) {
      scanner.clear().then(() => {
        console.log("Scanner cleared successfully")
        setScanner(null)
        setIsScanning(false)
        onToggle()
      }).catch((error) => {
        console.error("Error clearing scanner:", error)
        onToggle()
      })
    } else {
      onToggle()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-600">
          <Package className="h-6 w-6" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={handleToggle}
            variant={isActive ? "destructive" : "default"}
            size="lg"
            className="w-full"
          >
            {isActive ? (
              <>
                <CameraOff className="h-5 w-5 mr-2" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Start Scanner
              </>
            )}
          </Button>
        </div>

        {isActive && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
            <div id="reader" ref={scannerRef} className="w-full"></div>
            {!isScanning && (
              <div className="text-center text-blue-600 mt-4">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Initializing camera...</p>
              </div>
            )}
          </div>
        )}

        {!isActive && (
          <div className="text-center py-8 text-slate-500">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Click "Start Scanner" to begin scanning barcodes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}