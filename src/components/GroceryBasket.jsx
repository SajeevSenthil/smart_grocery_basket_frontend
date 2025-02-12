import React, { useState } from 'react';

const GroceryBasket = ({ onProductScanned }) => {
  const [items, setItems] = useState([]);

  const handleProductScanned = (product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setItems(currentItems => {
      const updatedItems = currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0);
      return updatedItems;
    });
  };

  const handleClearBasket = () => {
    setItems([]);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Effect to handle new products scanned
  React.useEffect(() => {
    if (onProductScanned) {
      onProductScanned(handleProductScanned);
    }
  }, [onProductScanned]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="h4 text-primary mb-0">Grocery Basket</h2>
        <button onClick={handleClearBasket} className="btn btn-outline-danger">
          <i className="fas fa-trash"></i>
        </button>
      </div>
      <div className="card-body">
        <div>
          {items.map(item => (
            <div key={item.id} className="d-flex align-items-center border-bottom py-2">
              <img src={item.image} alt={item.name} className="me-4" style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
              <div className="flex-grow-1">
                <h3 className="mb-1">{item.name}</h3>
                <p className="text-muted">₹{item.price}</p>
              </div>
              <div className="d-flex align-items-center">
                <button 
                  onClick={() => handleUpdateQuantity(item.id, -1)} 
                  className="btn btn-sm btn-outline-secondary me-2"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQuantity(item.id, 1)} 
                  className="btn btn-sm btn-outline-secondary ms-2"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-end mt-3">
          <h3 className="h5">Total: ₹{calculateTotal()}</h3>
        </div>
      </div>
    </div>
  );
};

export default GroceryBasket;