import { Plus } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const AdminOffer = () => {
  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Offer Management</h1>
          <Link
            to="/admin/add-offer"
            className="btn-primary flex items-center gap-2"
          >
            <Plus />
            Add Offer
          </Link>
        </div>

        <div className="p-4 rounded-lg">
          <p className="text-center text-text-muted">Your Offer listings will appear here</p>
        </div>
      </div>
    </>
  )
}

export default AdminOffer