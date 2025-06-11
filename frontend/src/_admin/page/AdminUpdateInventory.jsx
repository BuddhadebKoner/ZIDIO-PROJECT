import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInventoryBySlug, updateInventory } from '../../lib/api/admin.api';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminUpdateInventory = () => {
  // catch slug from params
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getToken } = useAuth();

  // State management
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stocks, setStocks] = useState([]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          setError('You must be logged in to view inventory.');
          return;
        }

        const response = await getInventoryBySlug(slug, token);

        if (response.success) {
          setInventory(response.inventory);
          setStocks(response.inventory.stocks.map(item => ({
            ...item,
            quantity: Number(item.quantity)
          })));
        } else {
          setError(response.message || 'Failed to fetch inventory');
        }
      } catch (err) {
        setError('Error fetching inventory: ' + (err.message || 'Unknown error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [slug]);

  // Handle quantity change for a specific size
  const handleQuantityChange = (id, newValue) => {
    // Ensure value is a number and not negative
    const quantity = Math.max(0, parseInt(newValue) || 0);

    setStocks(prev =>
      prev.map(stock =>
        stock._id === id ? { ...stock, quantity } : stock
      )
    );
  };

  // Calculate total quantity based on all sizes
  const calculateTotalQuantity = () => {
    return stocks.reduce((total, stock) => total + stock.quantity, 0);
  };

  // Handle form submission
  const handleUpdateInventory = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // Prepare data for API
      const updatedInventory = {
        stocks: stocks.map(({ _id, size, quantity }) => ({
          _id,
          size,
          quantity
        })),
        totalQuantity: calculateTotalQuantity()
      };

      const token = await getToken();
      if (!token) {
        setError('You must be logged in to update inventory.');
        return;
      }

      // Call the API
      const response = await updateInventory(slug, updatedInventory, token);

      if (response.success) {
        setSuccess('Inventory updated successfully!');
        // Update local state with the response
        setInventory({
          ...inventory,
          ...updatedInventory
        });
      } else {
        setError(response.message || 'Failed to update inventory');
      }
    } catch (err) {
      setError('Error updating inventory: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <LoaderCircle className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      </>
    )
  }

  if (error && !inventory) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-surface p-6 rounded-lg comic-border max-w-md w-full">
          <h2 className="text-error text-xl font-bold mb-2">Error</h2>
          <p className="text-text-muted">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <div className="rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text">
            Update Inventory: {inventory?.productId?.title}
          </h1>
          <span className="px-3 py-1 rounded-full bg-primary-800 text-text-muted text-sm">
            {inventory?.productId?.slug}
          </span>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-error rounded p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateInventory}>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-muted">Stock Quantities</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => (
                <div
                  key={stock._id}
                  className="p-4 rounded-lg glass-morphism border border-primary-800/30"
                >
                  <label className="block text-text-muted font-medium mb-2">
                    Size {stock.size}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-l-md bg-primary-800 text-white"
                      onClick={() => handleQuantityChange(stock._id, Math.max(0, stock.quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={stock.quantity}
                      onChange={(e) => handleQuantityChange(stock._id, e.target.value)}
                      className="w-full h-8 px-2 py-1 text-center bg-gray-800 border border-primary-700 text-text"
                    />
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-r-md bg-primary-800 text-white"
                      onClick={() => handleQuantityChange(stock._id, stock.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg glass-morphism border border-accent-700/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-text">Total Quantity:</span>
                <span className="text-xl font-bold text-primary-400">{calculateTotalQuantity()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md bg-gray-800 text-text-muted hover:bg-gray-700 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Inventory'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdateInventory;