import React from 'react';
import PropTypes from 'prop-types';

const CollectionDataLabel = ({ 
  collection, 
  isSelected = false, 
  onClick = null,
  compact = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(collection._id, collection.name);
    }
  };

  return (
    <div
      className={`p-3 border ${isSelected ? 'border-primary-500' : 'border-gray-700'} 
        rounded-md ${onClick ? 'cursor-pointer hover:bg-surface/70' : ''} transition-all 
        ${isSelected ? 'ring-2 ring-primary-500 bg-surface/70' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-gray-800 rounded-md overflow-hidden flex-shrink-0`}>
          <img
            src={collection.bannerImageUrl}
            alt={collection.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100?text=Collection';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${compact ? 'text-xs' : 'text-sm'} font-medium truncate`}>{collection.name}</h3>
          {!compact && <p className="text-xs text-text-muted truncate">{collection.subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

CollectionDataLabel.propTypes = {
  collection: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    bannerImageUrl: PropTypes.string,
    subtitle: PropTypes.string
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  compact: PropTypes.bool
};

export default CollectionDataLabel;