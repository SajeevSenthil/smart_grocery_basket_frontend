"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, CameraOff, Package, Info, CheckCircle } from 'lucide-react'

interface RealTimeScannerProps {
  onScan: (productId: string) => void
}

export default function RealTimeScanner({ onScan }: RealTimeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scannedData, setScannedData] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [status, setStatus] = useState("Ready to scan. Click 'Start Scanning'")
  const barcodeDetectorRef = useRef<any>(null)
  const scanningRef = useRef(false)
  const scannedProductsRef = useRef(new Set())

  console.log("RealTimeScanner initialized", { isScanning, status })

  useEffect(() => {
    // Check if BarcodeDetector is supported
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new (window as any).BarcodeDetector({
          formats: [
            'code_128', 'code_39', 'code_93', 'codabar',
            'ean_13', 'ean_8', 'itf', 'pdf417',
            'upc_a', 'upc_e', 'qr_code'
          ]
        })
        setStatus("Ready to scan. Click 'Start Scanning'")
        console.log("BarcodeDetector initialized")
      } catch (error) {
        console.error("Error initializing BarcodeDetector:", error)
        setStatus("BarcodeDetector initialization failed")
      }
    } else {
      console.warn("BarcodeDetector API not supported")
      setStatus("Barcode Detector API is not supported in this browser.")
    }

    return () => stopScanner()
  }, [])

  const startScanner = async () => {
    console.log("Starting scanner...")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        scanningRef.current = true
        setStatus("Scanning... Hold barcode in view")
        console.log("Video stream started")
        detectBarcode()
      }
    } catch (error) {
      console.error("Camera Error:", error)
      setStatus("Failed to access the camera.")
    }
  }

  const detectBarcode = async () => {
    if (!barcodeDetectorRef.current || !videoRef.current || !videoRef.current.srcObject) {
      console.log("Detection requirements not met")
      return
    }

    const stream = videoRef.current.srcObject as MediaStream
    const track = stream.getVideoTracks()[0]
    
    if (!track) {
      console.log("No video track available")
      return
    }

    const imageCapture = new (window as any).ImageCapture(track)

    const scan = async () => {
      if (!scanningRef.current) return

      try {
        const bitmap = await imageCapture.grabFrame()
        const barcodes = await barcodeDetectorRef.current.detect(bitmap)

        if (barcodes.length > 0) {
          const productId = barcodes[0].rawValue
          console.log("Barcode detected:", productId)

          if (!scannedProductsRef.current.has(productId)) {
            scannedProductsRef.current.add(productId)
            setScannedData(productId)
            setStatus(`Detected: ${productId}`)
            onScan(productId)

            // Remove from scanned set after 3 seconds to allow re-scanning
            setTimeout(() => {
              console.log("Removing from scanned set:", productId)
              scannedProductsRef.current.delete(productId)
            }, 3000)
          }
        }
      } catch (error) {
        console.error("Barcode detection error:", error)
      }

      if (scanningRef.current) {
        requestAnimationFrame(scan)
      }
    }

    scan()
  }

  const stopScanner = () => {
    console.log("Stopping scanner...")
    scanningRef.current = false
    setIsScanning(false)

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setStatus("Scanner stopped")
    setScannedData("")
  }

  const toggleScanner = () => {
    console.log("Toggle scanner clicked", { isScanning })
    if (isScanning) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-white py-3">
        <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
          <Camera className="h-5 w-5 text-green-600" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Video Preview */}
        <div className="relative w-full">
          <div 
            className={`relative rounded-lg overflow-hidden ${
              isScanning ? 'border border-slate-300' : 'bg-slate-100 border border-slate-200'
            }`}
            style={{ minHeight: "200px", aspectRatio: "4/3" }}
          >
            <video 
              ref={videoRef} 
              className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
              autoPlay 
              playsInline 
              muted 
            />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col justify-center items-center text-slate-400">
                <Camera className="h-12 w-12 mb-3" />
                <p className="text-sm">Camera inactive</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Alert */}
        <Alert className={`${scannedData ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div>
              {scannedData ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Info className="h-5 w-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1">
              <AlertDescription className="text-sm">
                {status}
                {scannedData && (
                  <div className="mt-1 text-green-700 font-medium">
                    Last scanned: {scannedData}
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Control Button */}
        <Button 
          onClick={toggleScanner} 
          className={`w-full ${
            isScanning 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}