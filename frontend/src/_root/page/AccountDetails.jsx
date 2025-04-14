import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FullPageLoader from "../../components/loaders/FullPageLoader";
import { toast } from "react-toastify";
import { useUpdateUserDetails } from '../../lib/query/queriesAndMutation';

const AccountDetails = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  const {
    mutate: updateUser,
    isPending: isUpdating,
    error: updateError
  } = useUpdateUserDetails();

  // Add API error state
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phone: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  // Track changes per field
  const [changedFields, setChangedFields] = useState({
    fullName: false,
    phone: false
  });

  useEffect(() => {
    if (currentUser) {
      const nameParts = currentUser.fullName ? currentUser.fullName.split(" ") : ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      let countryCode = "+91";
      let phoneNumber = "";

      if (currentUser.phone) {
        const phoneMatch = currentUser.phone.match(/^(\+\d+)?\s*(.*)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1] || "+91";
          phoneNumber = phoneMatch[2] || "";
        } else {
          phoneNumber = currentUser.phone;
        }
      }

      setFormData({
        firstName,
        lastName,
        email: currentUser.email || "",
        countryCode,
        phone: phoneNumber,
      });
    }
  }, [currentUser]);

  // Enhanced validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      phone: ""
    };

    // Validate first name
    if (formData.firstName.trim() === "") {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = "First name is too long (max 50 characters)";
      isValid = false;
    }

    // Validate last name
    if (formData.lastName.length > 50) {
      newErrors.lastName = "Last name is too long (max 50 characters)";
      isValid = false;
    }

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate phone number (enhanced version)
  const validatePhone = (phoneNumber) => {
    if (!phoneNumber) return ""; // Empty is valid

    // Remove spaces, dashes, and parentheses
    const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, '');

    // Check if it contains only digits
    if (!/^\d+$/.test(cleanedNumber)) {
      return "Phone number should contain only digits";
    }

    // Check length
    if (cleanedNumber.length < 10) {
      return "Phone number must be at least 10 digits";
    }

    if (cleanedNumber.length > 15) {
      return "Phone number is too long (max 15 digits)";
    }

    return ""; // No error
  };

  // Check if a specific field has changed
  const checkFieldChange = (field, newValue, originalValue) => {
    const hasChanged = newValue !== originalValue;

    setChangedFields(prev => ({
      ...prev,
      [field]: hasChanged
    }));

    return hasChanged;
  };

  // Handle input changes with better validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Field-specific validation
    if (name === 'phone') {
      const phoneError = validatePhone(value);
      setErrors(prev => ({
        ...prev,
        phone: phoneError
      }));

      // Check if phone has changed
      const currentPhone = value ? `${formData.countryCode} ${value}`.trim() : "";
      const originalPhone = currentUser?.phone || "";
      checkFieldChange('phone', currentPhone, originalPhone);
    } else if (name === 'countryCode') {
      // Check if phone has changed due to country code change
      const currentPhone = formData.phone ? `${value} ${formData.phone}`.trim() : "";
      const originalPhone = currentUser?.phone || "";
      checkFieldChange('phone', currentPhone, originalPhone);
    } else if (name === 'firstName') {
      // Validate first name
      let firstNameError = "";
      if (!value.trim()) {
        firstNameError = "First name is required";
      } else if (value.length > 50) {
        firstNameError = "First name is too long (max 50 characters)";
      }

      setErrors(prev => ({
        ...prev,
        firstName: firstNameError
      }));

      // Check if full name has changed
      const currentFullName = `${value} ${formData.lastName}`.trim();
      const originalFullName = currentUser?.fullName || "";
      checkFieldChange('fullName', currentFullName, originalFullName);
    } else if (name === 'lastName') {
      // Validate last name
      let lastNameError = "";
      if (value.length > 50) {
        lastNameError = "Last name is too long (max 50 characters)";
      }

      setErrors(prev => ({
        ...prev,
        lastName: lastNameError
      }));

      // Check if full name has changed
      const currentFullName = `${formData.firstName} ${value}`.trim();
      const originalFullName = currentUser?.fullName || "";
      checkFieldChange('fullName', currentFullName, originalFullName);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError(null);

    // Full form validation before submission
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Create updated field values
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const phone = formData.phone ? `${formData.countryCode} ${formData.phone}` : "";

    // Only include fields that have actually changed
    const updates = {};

    if (changedFields.fullName) {
      updates.fullName = fullName;
    }

    if (changedFields.phone) {
      updates.phone = phone;
    }

    // Only call API if there are actual changes
    if (Object.keys(updates).length > 0) {
      
      updateUser(updates, {
        onSuccess: () => {
          // Success toast is now handled in the mutation hook
          setApiError(null);
          setChangedFields({
            fullName: false,
            phone: false
          });
        },
        onError: (error) => {
          const errorMessage = error?.response?.data?.message ||
            error?.message ||
            "Failed to update profile. Please try again.";
          setApiError(errorMessage);
          // Show error toast
          toast.error(`Error updating profile: ${errorMessage}`);
        }
      });
    } else {
      toast.info("No changes to update");
    }
  };

  // Check if any field has changed to enable the submit button and if any errors exist
  const hasAnyChange = changedFields.fullName || changedFields.phone;
  const hasErrors = Object.values(errors).some(error => error !== "");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-text-muted mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-surface border ${errors.firstName ? 'border-accent-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-accent-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-text-muted mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-surface border ${errors.lastName ? 'border-accent-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-accent-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-text-muted mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-3 bg-surface border border-gray-700 rounded-md focus:outline-none text-text cursor-not-allowed opacity-80"
            />
          </div>

          <div className="mb-6">
            <label className="block text-text-muted mb-2">Phone Number</label>
            <div className="flex flex-col">
              <div className="flex">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="w-24 p-3 mr-2 bg-surface border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted"
                >
                  <option>+91</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-surface border ${errors.phone ? 'border-accent-500' : 'border-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-text placeholder-text-muted`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-accent-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!hasAnyChange || hasErrors || isUpdating}
            className={`btn-primary w-full py-3 ${(!hasAnyChange || hasErrors || isUpdating)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary-600'}`}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountDetails;