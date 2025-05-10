import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("");
  const barcodeDetectorRef = useRef(null);
  const scanningRef = useRef(false);
  const scannedProductsRef = useRef(new Set()); // Fix: Use ref instead of state

  useEffect(() => {
    if ("BarcodeDetector" in window) {
      barcodeDetectorRef.current = new BarcodeDetector({
        formats: [
          "code_128", "code_39", "code_93", "codabar",
          "ean_13", "ean_8", "itf", "pdf417",
          "upc_a", "upc_e", "qr_code"
        ]
      });
      setStatus("Ready to scan. Click 'Start Scanning'");
    } else {
      setStatus("Barcode Detector API is not supported in this browser.");
    }

    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsScanning(true);
      scanningRef.current = true;
      setStatus("Scanning... Hold barcode in view");
      detectBarcode();
    } catch (error) {
      console.error("Camera Error:", error);
      setStatus("Failed to access the camera.");
    }
  };

  const detectBarcode = async () => {
    if (!barcodeDetectorRef.current || !videoRef.current || !videoRef.current.srcObject) return;

    const track = videoRef.current.srcObject.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);

    const scan = async () => {
      if (!scanningRef.current) return;

      try {
        const bitmap = await imageCapture.grabFrame();
        const barcodes = await barcodeDetectorRef.current.detect(bitmap);

        if (barcodes.length > 0) {
          const productId = barcodes[0].rawValue;

          if (!scannedProductsRef.current.has(productId)) {
            scannedProductsRef.current.add(productId);
            setScannedData(productId);
            setStatus(`Detected: ${productId}`);
            await processProductScan(productId);
          }
        }
      } catch (error) {
        console.error("Barcode detection error:", error);
      }

      if (scanningRef.current) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const processProductScan = async (productId) => {
    try {
      const response = await fetch("http://localhost:5001/api/products");
      const products = await response.json();
      const product = products.find((p) => p.productId === productId);

      if (product) {
        onScan(product);
        setStatus(`Product: ${product.name}`);
      } else {
        setStatus(`Unknown ProductId: ${productId}`);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setStatus(`Error fetching product: ${productId}`);
    }

    setTimeout(() => {
      console.log("Removing", productId);
      scannedProductsRef.current.delete(productId);
    }, 3000);
  };

  const stopScanner = () => {
    scanningRef.current = false;
    setIsScanning(false);

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setStatus("Scanner stopped");
  };

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white py-3">
        <h3 className="h4 text-dark mb-0">
          <i className="fas fa-camera me-2" style={{ color: '#00a76f' }}></i>
          Barcode Scanner
        </h3>
      </div>

      <div className="card-body d-flex flex-column align-items-center">
        <div className="position-relative mb-3 w-100">
          <div className={`position-relative ${isScanning ? '' : 'bg-light rounded border'}`} style={{ minHeight: "200px" }}>
            <video 
              ref={videoRef} 
              className={`w-100 rounded ${isScanning ? 'border' : 'd-none'}`}
              style={{ maxHeight: "300px", objectFit: "cover" }} 
              autoPlay 
              playsInline 
              muted 
            />

            {!isScanning && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
                <div className="text-center text-muted">
                  <i className="fas fa-camera fa-3x mb-3"></i>
                  <p>Camera inactive</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`alert ${scannedData ? 'alert-success' : 'alert-secondary'} w-100 mb-3`}>
          <div className="d-flex align-items-center">
            <div className="me-3">
              {scannedData ? (
                <i className="fas fa-check-circle fa-2x"></i>
              ) : (
                <i className="fas fa-info-circle fa-2x"></i>
              )}
            </div>
            <div>
              <p className="mb-0">{status}</p>
              {scannedData && <p className="mb-0 text-success">Last scanned: {scannedData}</p>}
            </div>
          </div>
        </div>
        <button 
          onClick={toggleScanner} 
          className={`btn w-100 ${isScanning ? 'btn-stop-scan' : 'btn-start-scan'}`}
        >
          {isScanning ? (
            <><i className="fas fa-stop me-2"></i>Stop Scanning</>
          ) : (
            <><i className="fas fa-play me-2"></i>Start Scanning</>
          )}
        </button>
      </div>
    </div>
  );
};

QRScanner.propTypes = {
  onScan: PropTypes.func
};

export default QRScanner;
