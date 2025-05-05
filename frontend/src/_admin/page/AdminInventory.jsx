import React, { useState, useRef, useCallback } from 'react';
import { useGetAllInventorys } from '../../lib/query/queriesAndMutation';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import InventoryDataTable from '../../components/common/InventoryDataTable';

const AdminInventory = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllInventorys();

  // Extract actual inventory data from the nested structure
  const inventoryItems = data?.pages?.[0]?.inventory || [];
  const totalItems = data?.pages?.[0]?.totalItems || 0;
  const currentPage = data?.pages?.[0]?.currentPage || 1;
  const totalPages = data?.pages?.[0]?.totalPages || 1;

  const observer = useRef();
  const lastItemRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, currentPage, totalPages]
  );

  const handleRowClick = (slug) => {
    navigate(`/admin/inventory/${slug}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  console.log('Inventory Items:', inventoryItems);

  return (
    <div className="px-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Inventory</h1>
        <div className="flex gap-2 items-center text-text-muted text-sm">
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <InventoryDataTable
        inventoryItems={inventoryItems}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        lastItemRef={lastItemRef}
        isLoadingMore={isLoading && page > 1}
        firstPageLoading={isLoading && page === 1}
        emptyStateMessage="No inventory items found"
      />

      <div className="mt-4 text-text-muted text-sm">
        Showing {inventoryItems.length} of {totalItems} items
      </div>
    </div>
  );
};

export default AdminInventory;