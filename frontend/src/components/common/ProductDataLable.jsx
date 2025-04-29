import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const ProductDataLable = ({ 
  product, 
  isSelected = false, 
  onClick = () => {},
  className = "" 
}) => {
  return (
    <div
      className={`p-3 border ${isSelected ? 'border-primary-500' : 'border-gray-700'} 
        rounded-md cursor-pointer hover:bg-surface/70 transition-all ${
          isSelected ? 'ring-2 ring-primary-500 bg-surface/70' : ''
        } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={product.images?.[0]?.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100?text=Product';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{product.title}</h3>
          <p className="text-xs text-text-muted truncate">{product.subTitle || `$${product.price}`}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
            isSelected ? 'bg-primary-500' : 'border border-gray-500'
          }`}>
            {isSelected && <Check size={14} />}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductDataLable.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subTitle: PropTypes.string,
    price: PropTypes.number,
    bannerImageUrl: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string
      })
    )
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default ProductDataLable;