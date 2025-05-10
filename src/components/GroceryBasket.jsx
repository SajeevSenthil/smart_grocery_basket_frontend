import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const GroceryBasket = ({ onProductScanned }) => {
  const [items, setItems] = useState([]);

  const handleProductScanned = (product) => {
    setItems(currentItems => {
      // Map the backend product to our basket format
      const basketProduct = {
        id: product.productId,
        name: product.name,
        price: product.mrpPrice,
        image: product.image,
        discount: product.discounts,
        category: product.category
      };

      const existingItemIndex = currentItems.findIndex(item => item.id === basketProduct.id);
      
      if (existingItemIndex !== -1) {
        // Create a new array with the updated item
        const newItems = [...currentItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        return newItems;
      }
      
      // Add new item with quantity 1
      return [...currentItems, { ...basketProduct, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleClearBasket = () => {
    setItems([]);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Register the callback to handle product scanning
  useEffect(() => {
    if (onProductScanned) {
      onProductScanned(handleProductScanned);
    }
  }, [onProductScanned]);

  return (
<div className="card shadow-sm">
  <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
    <h2 className="h4 text-dark mb-0">
      <i className="fas fa-shopping-basket me-2" style={{ color: '#00a76f' }}></i>
      Smart Grocery Basket
    </h2>
    <button 
      onClick={handleClearBasket} 
      className="btn btn-outline-danger"
      disabled={items.length === 0}
    >
      <i className="fas fa-trash me-1"></i>
      Clear
    </button>
  </div>
  
  <div className="card-body">
    {items.length === 0 ? (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-shopping-cart fa-3x mb-3"></i>
        <p>Your basket is empty</p>
        <p className="small">Scan a product to add items</p>
      </div>
    ) : (
      <div className="mb-3">
        {items.map(item => (
          <div key={item.id} className="d-flex align-items-center border-bottom py-3">
            <img 
              src={item.image} 
              alt={item.name} 
              className="me-3 rounded" 
              style={{ width: '64px', height: '64px', objectFit: 'cover' }} 
            />
            <div className="flex-grow-1">
              <h3 className="h6 mb-1 fw-bold">{item.name}</h3>
              <div className="d-flex flex-wrap">
                <p className="text-muted mb-0 me-3">₹{item.price}</p>
                {item.discount && (
                  <p className="mb-0 text-success small">
                    <i className="fas fa-tag me-1"></i>
                    {item.discount}
                  </p>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <button 
                onClick={() => handleUpdateQuantity(item.id, -1)} 
                className="btn btn-sm btn-outline-secondary"
                aria-label="Decrease quantity"
              >
                <i className="fas fa-minus"></i>
              </button>
              <span className="mx-3 fw-bold">{item.quantity}</span>
              <button 
                onClick={() => handleUpdateQuantity(item.id, 1)} 
                className="btn btn-sm btn-outline-secondary"
                aria-label="Increase quantity"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    
    {items.length > 0 && (
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center border-top pt-3">
          <h3 className="h5 mb-0">Total</h3>
          <h3 className="h5 mb-0">₹{calculateTotal()}</h3>
        </div>
        
        <div className="d-grid mt-3">
          <button className="btn btn-success text-white">
            <i className="fas fa-credit-card me-2"></i>
            Proceed to Payment
          </button>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

GroceryBasket.propTypes = {
  onProductScanned: PropTypes.func
};

export default GroceryBasket;