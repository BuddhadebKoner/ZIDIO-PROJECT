import React from 'react'
import { LoaderCircle } from 'lucide-react'

const ElementLoader = ({ className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <LoaderCircle size={24} className="animate-spin text-primary-500" />
    </div>
  )
}

export default ElementLoader