import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext';
import { Plus, Loader2, MapPin, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import LoadItems from '../../components/loaders/LoadItems';
import Addressform from '../../components/forms/Addressform';

const Address = () => {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const {
    isAuthenticated,
    isLoading,
    error,
    currentUser,
  } = useAuth();

  const handleUpdateClick = () => {
    setShowUpdateForm(true);
    setErrorMessage("");
    setFormSuccess(false);
  };

  const handleFormSubmitStart = () => {
    setFormSubmitting(true);
    setErrorMessage("");
  };

  const handleFormSubmitEnd = (success, error) => {
    setFormSubmitting(false);
    
    if (success) {
      setFormSuccess(true);
      setTimeout(() => {
        setShowUpdateForm(false);
        setFormSuccess(false);
      }, 1500);
    } else if (error) {
      setErrorMessage(error.message || "Failed to save address. Please try again.");
    } else {
      setShowUpdateForm(false);
    }
  };

  if (isLoading) {
    return <LoadItems />;
  }

  if (!isAuthenticated) {
    return (
      <div className="error-container flex-center flex-col h-[400px] bg-dark-2 rounded-lg p-8 animate-fadeIn">
        <AlertTriangle className="h-12 w-12 text-error mb-4" />
        <h3 className="heading3 text-light-1 mb-2">Authentication Required</h3>
        <p className="text-light-2 text-center">Please login to view and manage your address details</p>
      </div>
    );
  }

  const hasAddress = currentUser?.address && 
    Object.keys(currentUser.address).length > 0;

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
      {errorMessage && (
        <div className="bg-dark-2 border border-error rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-error" />
          <p className="text-error">{errorMessage}</p>
        </div>
      )}
      
      {hasAddress && !showUpdateForm ? (
        <div className="bg-dark-2 rounded-lg p-6">
          <div className="address-details flex flex-col gap-3">
            <p className="flex items-center"><span className="text-light-3 w-28">Address 1:</span> <span className="font-medium">{currentUser.address.addressLine1 || "—"}</span></p>
            <p className="flex items-center"><span className="text-light-3 w-28">Address 2:</span> <span className="font-medium">{currentUser.address.addressLine2 || "—"}</span></p>
            <p className="flex items-center"><span className="text-light-3 w-28">City:</span> <span className="font-medium">{currentUser.address.city || "—"}</span></p>
            <p className="flex items-center"><span className="text-light-3 w-28">State:</span> <span className="font-medium">{currentUser.address.state || "—"}</span></p>
            <p className="flex items-center"><span className="text-light-3 w-28">Postal Code:</span> <span className="font-medium">{currentUser.address.postalCode || "—"}</span></p>
            <p className="flex items-center"><span className="text-light-3 w-28">Country:</span> <span className="font-medium">{currentUser.address.country || "—"}</span></p>
          </div>
          <button
            onClick={handleUpdateClick}
            aria-label="Update address information"
            className="btn mt-6 bg-primary-500 text-white px-5 py-2.5 rounded hover:bg-primary-600 transition-all flex items-center gap-2"
          >
            <Edit size={18} />
            Update Address
          </button>
        </div>
      ) : showUpdateForm ? (
        <div className="form-container bg-dark-2 rounded-lg relative">
          {formSubmitting && (
            <div className="absolute inset-0 bg-dark-1 bg-opacity-70 flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
                <p className="mt-4 text-light-2">Saving your address...</p>
              </div>
            </div>
          )}
          
          {formSuccess && (
            <div className="absolute inset-0 bg-dark-1 bg-opacity-70 flex items-center justify-center rounded-lg z-10">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-success animate-fadeIn" />
                <p className="mt-4 text-light-2">Address saved successfully!</p>
              </div>
            </div>
          )}
          
          <Addressform
            initialData={hasAddress ? currentUser.address : null}
            action={hasAddress ? "update" : "add"}
            onCancel={() => setShowUpdateForm(false)}
            onSubmitStart={handleFormSubmitStart}
            onSubmitEnd={handleFormSubmitEnd}
          />
        </div>
      ) : (
        <div className="bg-dark-2 rounded-lg flex flex-col items-center justify-center p-10 min-h-[300px]">
          <MapPin className="h-16 w-16 text-primary-500/30 mb-4" />
          <h3 className="heading4 text-light-2 mb-6">No address information found</h3>
          <button
            onClick={() => setShowUpdateForm(true)}
            aria-label="Add a new address"
            className="add-address-btn bg-primary-500 hover:bg-primary-600 text-white rounded-lg p-4 flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={20} />
            <span>Add New Address</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Address