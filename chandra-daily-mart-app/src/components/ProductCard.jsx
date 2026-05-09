import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

import { CATEGORY_IMAGES, cleanCategoryName } from '../utils/format';

export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateQty, getQty, getCartItem } = useCart();

  const qty = getQty(product.id);
  const cartItem = getCartItem(product.id);
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const catName = product.categories?.name || '';

  async function handleAdd(e) {
    e.stopPropagation();
    await addToCart(product);
  }

  function handleUpdate(e, newQty) {
    e.stopPropagation();
    updateQty(cartItem.id, newQty);
  }

  return (
    <div 
      className={compact ? "product-card-scroll" : "product-card"} 
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <img src={CATEGORY_IMAGES[cleanCategoryName(catName)] || '/categories/vegetables.png'} alt={catName} />
        )}
        {discount > 0 && <span className="product-badge">{discount}% OFF</span>}
      </div>
      <div className="product-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 10, background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>30 MINS</span>
        </div>
        <div className="product-name" style={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          minHeight: 34
        }}>
          {product.name}
        </div>
        <div className="product-unit">
          {product.weight_value ? `${product.weight_value} ${product.weight_unit}` : (product.unit_label || '1 unit')}
        </div>
        <div className="product-price-row">
          <div>
            <div className="product-price">₹{product.price}</div>
            {product.mrp > product.price && <div className="product-mrp">₹{product.mrp}</div>}
          </div>
          {qty === 0 ? (
            <button className="add-btn" onClick={handleAdd}>ADD</button>
          ) : (
            <div className="stepper">
              <button onClick={(e) => handleUpdate(e, qty - 1)}>−</button>
              <span>{qty}</span>
              <button onClick={(e) => handleUpdate(e, qty + 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
