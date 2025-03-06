import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("");
  const barcodeDetectorRef = useRef(null);

  useEffect(() => {
    if ("BarcodeDetector" in window) {
      barcodeDetectorRef.current = new BarcodeDetector({
        formats: [
          "code_128", "code_39", "code_93", "codabar",
          "ean_13", "ean_8", "itf", "pdf417",
          "upc_a", "upc_e"
        ] 
      });
    } else {
      setStatus("Barcode Detector API is not supported in this browser.");
    }

    return () => stopScanner(); // Cleanup on unmount
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsScanning(true);
      detectBarcode();
    } catch (error) {
      console.error("Camera Error:", error);
      setStatus("Failed to access the camera.");
    }
  };

  const detectBarcode = async () => {
    if (!barcodeDetectorRef.current || !videoRef.current) return;

    const track = videoRef.current.srcObject.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    const scan = async () => {
      if (!isScanning) return;

      try {
        const bitmap = await imageCapture.grabFrame();
        const barcodes = await barcodeDetectorRef.current.detect(bitmap);

        if (barcodes.length > 0) {
          setScannedData(barcodes[0].rawValue);
          processProductScan(barcodes[0].rawValue);
          setIsScanning(false);
        }
      } catch (error) {
        console.error("Barcode detection error:", error);
      }

      requestAnimationFrame(scan);
    };

    scan();
  };

  const processProductScan = async (productId) => {
    try {
      const productRef = doc(db, "store-products", productId);
      const docSnap = await getDoc(productRef);

      if (docSnap.exists()) {
        const product = docSnap.data();
        onScan(product);
        setStatus(`Product: ${product.name}`);
      } else {
        setStatus(`Unknown ProductId: ${productId}`);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setStatus(`Error fetching product: ${productId}`);
    }

    setTimeout(() => setIsScanning(true), 2000);
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="card">
      <div className="card-body text-center">
        <video ref={videoRef} className="img-fluid rounded mb-3" autoPlay playsInline />
        <h3 className="text-success">{scannedData}</h3>
        <div className="text-danger">{status}</div>
        <button onClick={startScanner} className="btn btn-primary">
          Start Scanning
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
