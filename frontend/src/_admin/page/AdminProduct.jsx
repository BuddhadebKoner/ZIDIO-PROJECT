import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const AdminProduct = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Link
          to="/admin/add-product"
          className="btn-primary flex items-center gap-2"
        >
          <Plus />
          Add Product
        </Link>
      </div>

      <div className="p-4 rounded-lg">
        <p className="text-center text-text-muted">Your product listings will appear here</p>
      </div>
    </div>
  );
};

export default AdminProduct;