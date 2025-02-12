import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import jsQR from 'jsqr';
import Quagga from 'quagga';
import { db } from '../firebase';

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const scannerRef = useRef(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', true);
      await videoRef.current.play();
      
      setIsScanning(true);
      scanProductCode();
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatus(`Camera Error: ${error.message}`);
    }
  };

  const scanProductCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
    let lastScannedProductId = null;

    const scan = () => {
      if (!isScanning) return;
      
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        scannerRef.current = requestAnimationFrame(scan);
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qrCode && qrCode.data !== lastScannedProductId) {
        lastScannedProductId = qrCode.data;
        processProductScan(lastScannedProductId);
      } else {
        tryBarcodeScan(imageData);
      }

      scannerRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const tryBarcodeScan = (imageData) => {
    const barcodeCanvas = document.createElement('canvas');
    barcodeCanvas.width = imageData.width;
    barcodeCanvas.height = imageData.height;
    const barcodeContext = barcodeCanvas.getContext('2d');
    barcodeContext.putImageData(imageData, 0, 0);
    const base64Image = barcodeCanvas.toDataURL();

    Quagga.decodeSingle({
      src: base64Image,
      numOfWorkers: 0,
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'upc_reader']
      }
    }, result => {
      if (result && result.codeResult) {
        processProductScan(result.codeResult.code);
      }
    });
  };

  const processProductScan = async (productId) => {
    setIsScanning(false);
    
    try {
      const productRef = doc(db, "store-products", productId);
      const docSnap = await getDoc(productRef);
      
      if (docSnap.exists()) {
        const product = docSnap.data();
        onScan(product);
        setStatus(`Added: ${product.name}`);
      } else {
        setStatus('Unknown Product');
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setStatus('Error fetching product');
    }

    setTimeout(() => {
      setIsScanning(true);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        cancelAnimationFrame(scannerRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="card">
      <div className="card-body text-center">
        <div className="position-relative mb-3">
          <video 
            ref={videoRef}
            className="img-fluid rounded mb-3"
            autoPlay 
            playsInline
          />
          <canvas 
            ref={canvasRef}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ display: isScanning ? 'block' : 'none' }}
          />
        </div>
        <div className="text-danger mb-2">{status}</div>
        <button onClick={startScanning} className="btn btn-primary">
          <i className="fas fa-qrcode me-2"></i> Start Scanning
        </button>
      </div>
    </div>
  );
};

export default QRScanner;