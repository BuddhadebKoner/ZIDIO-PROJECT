import React from 'react'

const Card = ({ children, className, radius = "md", shadow = "sm" }) => {
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  };
  
  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
    xl: "shadow-xl"
  };
  
  return (
    <div className={`bg-surface border border-gray-800 ${radiusClasses[radius] || ""} ${shadowClasses[shadow] || ""} ${className || ""}`}>
      {children}
    </div>
  )
}

export default Card