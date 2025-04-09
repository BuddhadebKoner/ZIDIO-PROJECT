import React from 'react'

const AddToCart = ({ children, className, isIconOnly, radius, variant, onPress }) => {
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  };

  const variantClasses = {
    solid: "bg-primary-500 text-white hover:bg-primary-600",
    outlined: "bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-500/10",
    flat: "bg-primary-500/10 text-primary-500 hover:bg-primary-500/20"
  };

  return (
    <button 
      className={`
        ${isIconOnly ? 'p-2' : 'px-4 py-2'} 
        ${radiusClasses[radius] || 'rounded-md'} 
        ${variantClasses[variant] || variantClasses.solid}
        transition-colors duration-200 ease-in-out
        ${className || ''}
      `}
      onClick={onPress}
    >
      {children}
    </button>
  )
}

export default AddToCart