import { useState } from 'react';
import GroceryBasket from './components/GroceryBasket';
import QRScanner from './components/QRScanner';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const App = () => {
  const [productCallback, setProductCallback] = useState(null);
  
  const handleScannedCallback = (handler) => {
    setProductCallback(() => handler);
  };
  
  const handleProductScanned = (product) => {
    if (productCallback && typeof productCallback === 'function') {
      productCallback(product);
    }
  };
  
  return (
    <>
      <div className="navbar-container py-4 text-white">
        <header className="text-center">
          <h1 className="display-6 mb-0">Smart Grocery Basket</h1>
          <p>Scan products to add them to your basket</p>
        </header>
      </div>

      {/* Main App Container */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-4">
            <QRScanner onScan={handleProductScanned} />
          </div>
          <div className="col-lg-8">
            <GroceryBasket onProductScanned={handleScannedCallback} />
          </div>
        </div>

        <footer className="mt-5 pt-3 text-center text-muted border-top">
          <p className="small">© 2025 Smart Grocery App</p>
        </footer>
      </div>
    </>
  );
};

export default App;
