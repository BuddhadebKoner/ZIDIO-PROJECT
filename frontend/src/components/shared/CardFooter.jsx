import React from 'react'

const CardFooter = ({ children, className }) => {
  return (
    <div className={`p-4 ${className || ""}`}>
      {children}
    </div>
  )
}

export default CardFooter