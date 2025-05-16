import React from 'react'
import { useGetDashboardStats, useGetOrdersWithQuery } from '../../lib/query/queriesAndMutation'
import { DollarSign, Package, Users, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatIndianCurrency } from '../../utils/amountFormater'
import FullPageLoader from '../../components/loaders/FullPageLoader'
import OrderCard from '../../components/cards/OrderCard'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const {
    data: dashboardStats,
    isLoading,
    isError,
    error,
  } = useGetDashboardStats()

  const {
    data: processingOrdersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError
  } = useGetOrdersWithQuery({ status: 'Processing', sort: '-createdAt', limit: 5 })

  // Format large numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  }

  if (isLoading) {
    return (
      <>
        <FullPageLoader />
      </>
    )
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="bg-surface p-6 rounded-lg comic-border max-w-md">
          <h2 className="text-error text-xl mb-2">Error Loading Stats</h2>
          <p className="text-text-muted">{error?.message || "Failed to load dashboard statistics"}</p>
        </div>
      </div>
    )
  }

  const stats = dashboardStats?.stats || {};

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-text">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-surface p-6 rounded-lg comic-border glass-morphism">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-800 flex items-center justify-center">
              <DollarSign size={24} className="text-bg-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">Revenue</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-text">{formatIndianCurrency(stats.revenueInLast30Days || 0)}</p>
            <p className="text-sm text-text-muted">Last 30 days</p>
          </div>
        </div>

        {/* Delivered Products Card */}
        <div className="bg-surface p-6 rounded-lg comic-border glass-morphism">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-secondary-700 flex items-center justify-center">
              <Package size={24} className="text-bg-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">Delivered</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-text">{stats.productsDeliveredInLast30Days || 0}</p>
            <p className="text-sm text-text-muted">Products in last 30 days</p>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-surface p-6 rounded-lg comic-border glass-morphism">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-accent-700 flex items-center justify-center">
              <Users size={24} className="text-bg-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">Customers</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-text">{formatNumber(stats.totalCustomers || 0)}</p>
            <p className="text-sm text-text-muted">Total registered users</p>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="bg-surface p-6 rounded-lg comic-border glass-morphism">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
              <ShoppingBag size={24} className="text-bg-white" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-text">Inventory</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-text">{formatNumber(stats.totalInventoryStock || 0)}</p>
            <p className="text-sm text-text-muted">Items in stock</p>
          </div>
        </div>
      </div>

      {/* Processing Orders Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text">Processing Orders</h2>
          <Link 
            to="/admin/orders?status=Processing" 
            className="flex items-center gap-1 text-primary hover:text-primary-600 transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isOrdersLoading && (
          <div className="h-40 flex justify-center items-center">
            <p className="text-text-muted">Loading orders...</p>
          </div>
        )}

        {isOrdersError && (
          <div className="bg-error/10 p-4 rounded-lg comic-border">
            <p className="text-error">Failed to load processing orders: {ordersError?.message}</p>
          </div>
        )}

        {!isOrdersLoading && !isOrdersError && processingOrdersData?.pages?.[0]?.orders?.length === 0 && (
          <div className="bg-surface p-6 rounded-lg comic-border glass-morphism text-center">
            <p className="text-lg text-text">No processing orders at the moment</p>
          </div>
        )}

        {!isOrdersLoading && !isOrdersError && processingOrdersData?.pages?.[0]?.orders?.length > 0 && (
          <div className="space-y-4">
            {processingOrdersData.pages[0].orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard