import React from 'react'
import { LoaderCircle } from 'lucide-react'

const LoadItems = ({ className = "" }) => {
  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <LoaderCircle size={40} className="animate-spin text-primary-500" />
    </div>
  )
}

export default LoadItems