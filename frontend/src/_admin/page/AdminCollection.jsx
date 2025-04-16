import { Plus } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const AdminCollection = () => {
  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Collection Management</h1>
          <Link
            to="/admin/add-collection"
            className="btn-primary flex items-center gap-2"
          >
            <Plus />
            Add Collection
          </Link>
        </div>

        <div className="p-4 rounded-lg">
          <p className="text-center text-text-muted">Your Collection listings will appear here</p>
        </div>
      </div>
    </>
  )
}

export default AdminCollection