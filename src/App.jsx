import React, { useCallback } from 'react';
import GroceryBasket from './components/GroceryBasket';
import QRScanner from './components/QRScanner';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [handleScannedProduct, setHandleScannedProduct] = React.useState(null);

  const handleScan = useCallback((handler) => {
    setHandleScannedProduct(() => handler);
  }, []);

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-8">
          <GroceryBasket onProductScanned={handleScan} />
        </div>
        <div className="col-md-4">
          <QRScanner onScan={handleScannedProduct} />
        </div>
      </div>
    </div>
  );
};

export default App;