import React, { useState } from 'react'
import { useGetAllCustomers } from '../../lib/query/queriesAndMutation'
import { Search, User, Mail, Calendar, Loader, Users, Filter, RefreshCw, Image } from 'lucide-react'
import { avatars } from '../../utils/constant'

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useGetAllCustomers()

  // Get avatar URL by avatar code
  const getAvatarUrl = (avatarCode) => {
    if (!avatarCode) return null
    const avatar = avatars.find(av => av.name === avatarCode)
    return avatar ? avatar.url : null
  }

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Filter customers based on search term
  const getFilteredCustomers = () => {
    if (!data?.pages) return []

    const allCustomers = data.pages.flatMap(page => page.customers || [])

    if (!searchTerm.trim()) return allCustomers

    return allCustomers.filter(customer =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin mr-2">
          <Loader size={24} className="text-primary-500" />
        </div>
        <p className="text-text-muted">Loading customers...</p>
      </div>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <div className="p-6 bg-surface rounded-lg">
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-error text-lg">Error: {error?.message || 'Failed to load customer data'}</p>
          <button
            onClick={refetch}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const filteredCustomers = getFilteredCustomers()

  return (
    <div className="p-4 md:p-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users size={28} className="text-primary-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-text">Customer Management</h1>
        </div>
        <p className="text-text-muted ml-1">View and manage all registered customers</p>
      </div>

      {/* Search and filter bar */}
      <div className="glass-morphism p-4 rounded-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-700 rounded-md text-text focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-md hover:bg-gray-800 transition-all"
            disabled={isRefreshing}
            title="Refresh customer data"
          >
            <RefreshCw size={20} className={`text-primary-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <Filter size={16} />
          <span>Total Customers: <span className="font-semibold text-text">{data?.pages[0]?.totalItems || 0}</span></span>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-surface rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className=" text-left">
                <th className="p-4 font-semibold text-text-muted">Avatar</th>
                <th className="p-4 font-semibold text-text-muted">Name</th>
                <th className="p-4 font-semibold text-text-muted">Email</th>
                <th className="p-4 font-semibold text-text-muted">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const avatarUrl = getAvatarUrl(customer.avatar)

                  return (
                    <tr key={customer._id}>
                      <td className="p-4">
                        {avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-500 shadow-lg shadow-primary-500/20">
                            <img
                              src={avatarUrl}
                              alt={`${customer.fullName}'s avatar`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.parentNode.innerHTML = customer.fullName.substring(0, 2)
                                e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-primary-700', 'text-bg-white', 'font-semibold')
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-bg-white font-semibold shadow-lg shadow-primary-500/20">
                            {customer.fullName.substring(0, 2)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="text-text">{customer.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Mail className="mr-2 text-primary-400" size={18} />
                          <span className="text-text-muted">{customer.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar className="mr-2 text-primary-400" size={18} />
                          <span className="text-text-muted">{formatDate(customer.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-text-muted">
                    {searchTerm
                      ? 'No customers match your search criteria.'
                      : 'No customers available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more button if there are more pages */}
        {hasNextPage && (
          <div className="p-4 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-primary flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Loading more...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Load More Customers
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCustomers