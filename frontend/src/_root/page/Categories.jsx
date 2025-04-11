import React from 'react'
import { useParams } from 'react-router-dom'

const Categories = () => {
  // grab type from url
  const { type, category } = useParams()

  const formatString = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <div className='flex justify-center items-center py-10'>
        <h1 className='text-3xl font-bold text-white'>
          {formatString(type)}{" "} {category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>
      </div>
    </>
  );
}

export default Categories