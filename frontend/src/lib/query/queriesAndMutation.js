import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";
import { getAddAddress, getCartProducts, getExtreamSearch, getHomeContentDetails, getUpdateAddress, getUpdateAvatar, getUpdateUser } from "../api/user.api";
import { toast } from "react-toastify";
import { addProduct, getCustomers, getDashboardStats, getInventorys, getOrdersForAdmin, getReviews } from "../api/admin.api";
import { getAllCollections, getCollectionById, getProductsByCollectionSlug, searchCollections } from "../api/collection.api";
import { addReview, addToCart, addToWishlist, filterProducts, getAllProducts, getProductById, getReviewsById, removeFromCart, removeFromWishlist, searchProducts, updateCart } from "../api/product.api";
import { getAllOffers, searchOffers } from "../api/offer.api";
import { getOrderById, getOrders, verifyPayment } from "../api/order.api";
import { placeOrderOnlinePayment, placeOrderCashOnDelivery, placeOrderCashAndOnlineMixed } from "../api/payment/order";
import { isAuthenticated } from "../api/auth.api";
import { useAuth } from "../../context/AuthContext";

// isAuthenticated query
export const useIsAuthenticated = (enabled = true, getToken = null) => {
   return useQuery({
      queryKey: [QUERY_KEYS.AUTH.IS_AUTHENTICATED],
      queryFn: async () => {
         console.log('Auth Query - Enabled:', enabled);
         console.log('Auth Query - GetToken function:', getToken ? 'Present' : 'Not present');

         let token = null;
         if (getToken) {
            try {
               token = await getToken();
               console.log('Auth Query - Token retrieved:', token ? 'Present' : 'Not present');
            } catch (error) {
               console.error('Auth Query - Error getting token:', error);
            }
         }
         return isAuthenticated(token);
      },
      enabled: !!enabled,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
      throwOnError: false,
   });
};

// Updated to use mutation for avatar update
export const useUpdateAvatar = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (avatarName) => {
         const token = await getToken();
         return getUpdateAvatar(avatarName, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
      },
   });
}

// update user deatils
export const useUpdateUserDetails = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (updateProfile) => {
         const token = await getToken();
         return getUpdateUser(updateProfile, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Profile updated successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error updating user details";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};

// add address
export const useAddAddress = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (address) => {
         const token = await getToken();
         return getAddAddress(address, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Address added successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding address";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}

// update address
export const useUpdateAddress = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (address) => {
         const token = await getToken();
         return getUpdateAddress(address, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
         toast.success("Address updated successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error updating address";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}

// add prodct
export const useAddProduct = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (product) => {
         const token = await getToken();
         return addProduct(product, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.PRODUCTS.GET_PRODUCTS]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding product";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
}

// get all collections
export const useGetAllCollections = (limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.COLLECTIONS.GET_ALL_COLLECTIONS, limit],
      queryFn: ({ pageParam = 1 }) => getAllCollections(pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
};
// search collections
export const useSearchCollections = (searchTerm = '', limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.COLLECTIONS.SEARCH_COLLECTIONS, searchTerm, limit],
      queryFn: ({ pageParam = 1 }) => searchCollections(searchTerm, pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      enabled: searchTerm.length > 0,
      refetchOnWindowFocus: false,
   });
};

// get all products 
export const useGetAllProducts = (limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.GET_ALL_PRODUCTS, limit],
      queryFn: ({ pageParam = 1 }) => getAllProducts(pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
};

// search products
export const useSearchProducts = (searchTerm = '', limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.SEARCH_PRODUCTS, searchTerm, limit],
      queryFn: ({ pageParam = 1 }) => searchProducts(searchTerm, pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      enabled: searchTerm.length > 0,
      refetchOnWindowFocus: false,
   });
}

// filter products
export const useFilterProducts = (filterParams) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.FILTER_PRODUCTS, filterParams],
      queryFn: () => filterProducts(filterParams),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}

// get all offers
export const useGetAllOffers = (limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.OFFERS.GET_ALL_OFFERS, limit],
      queryFn: ({ pageParam = 1 }) => getAllOffers(pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
};

// search offers
export const useSearchOffers = (searchTerm = '', limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.OFFERS.SEARCH_OFFERS, searchTerm, limit],
      queryFn: ({ pageParam = 1 }) => searchOffers(searchTerm, pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      enabled: searchTerm.length > 0,
      refetchOnWindowFocus: false,
   });
}

// get home content
export const useGetHomeContent = () => {

   return useQuery({
      queryKey: [QUERY_KEYS.HOME.GET_HOME_CONTENT],
      queryFn: async () => {
         return getHomeContentDetails();
      },
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
   });
}

export const useGetProductById = (slug) => {
   return useQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.GET_PRODUCT_BY_ID, slug],
      queryFn: () => getProductById(slug),
      refetchOnWindowFocus: false,
      // meoised for 10 minutes
      staleTime: 10 * 60 * 1000,
   });
};

export const useGetCollectionById = (slug) => {
   return useQuery({
      queryKey: [QUERY_KEYS.COLLECTIONS.GET_COLLECTIONS_BY_ID, slug],
      queryFn: () => getCollectionById(slug),
      refetchOnWindowFocus: false,
      // meoised for 10 minutes
      staleTime: 10 * 60 * 1000,
   });
}

export const useExtreamSearch = (search) => {
   return useQuery({
      queryKey: [QUERY_KEYS.EXTREAM_SEARCH, search],
      queryFn: () => getExtreamSearch(search),
      refetchOnWindowFocus: false,
      enabled: !!search,
   });
};

export const useGetCollectionProducts = (slug, page = 1, limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.COLLECTIONS.GET_COLLECTION_PRODUCTS, slug, page, limit],
      queryFn: ({ pageParam = 1 }) => getProductsByCollectionSlug(slug, pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}

// add to wishlist
export const useAddToWishlist = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (productId) => {
         const token = await getToken();
         return addToWishlist(productId, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding product to wishlist";
      },
   });
}

// remove from wishlist
export const useRemoveFromWishlist = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (productId) => {
         const token = await getToken();
         return removeFromWishlist(productId, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error removing product from wishlist";
      },
   });
}

// add to cart
// add to cart
export const useAddToCart = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (data) => {
         const token = await getToken();
         return addToCart(data, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error adding product to cart";
      },
   });
}
// remove from cart
export const useRemoveFromCart = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (productId) => {
         const token = await getToken();
         return removeFromCart(productId, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error removing product from cart";
      },
   });
}


// get cart products
export const useGetCartProducts = () => {
   const { getToken } = useAuth();

   return useQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS],
      queryFn: async () => {
         const token = await getToken();
         return getCartProducts(token);
      },
      refetchOnWindowFocus: false,
   });
}

// update cart quantity and size
export const useUpdateCart = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (data) => {
         const token = await getToken();
         return updateCart(data, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS,
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error updating cart";
      },
   });
}

// get all inventorys
export const useGetAllInventorys = (pageParam = 1, limit = 10) => {
   const { getToken } = useAuth();

   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.INVENTORY.GET_ALL_INVENTORY, limit],
      queryFn: async ({ pageParam }) => {
         const token = await getToken();
         return getInventorys(pageParam, limit, token);
      },
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
};

// get all orders infinite pagination
export const useGetAllOrders = (pageParam = 1, limit = 10) => {
   const { getToken } = useAuth();

   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.ORDERS.GET_ALL_ORDERS, limit],
      queryFn: async ({ pageParam }) => {
         const token = await getToken();
         return getOrders(pageParam, limit, token);
      },
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}


// get order by id
export const useGetOrderById = (trackId) => {
   const { getToken } = useAuth();

   return useQuery({
      queryKey: [QUERY_KEYS.ORDERS.GET_ORDER_BY_ID, trackId],
      queryFn: async () => {
         const token = await getToken();
         return getOrderById(trackId, token);
      },
      refetchOnWindowFocus: false,
   });
}

// place order online payment
export const usePlaceOrderOnlinePayment = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (orderData) => {
         const token = await getToken();
         return placeOrderOnlinePayment(orderData, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS,
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
            QUERY_KEYS.ORDERS.GET_ALL_ORDERS,
         ]);
         toast.success("Order placed successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error placing order";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};

// place order cash on delivery
export const usePlaceOrderCashOnDelivery = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (orderData) => {
         const token = await getToken();
         return placeOrderCashOnDelivery(orderData, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS,
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
            QUERY_KEYS.ORDERS.GET_ALL_ORDERS,
         ]);
         toast.success("Order placed successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error placing order";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};

// place order cash and online mixed
export const usePlaceOrderCashAndOnlineMixed = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (orderData) => {
         const token = await getToken();
         return placeOrderCashAndOnlineMixed(orderData, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS,
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
            QUERY_KEYS.ORDERS.GET_ALL_ORDERS,
         ]);
         toast.success("Order placed successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error placing order";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};

// verify payment
export const useVerifyPayment = () => {
   const queryClient = useQueryClient();
   const { getToken } = useAuth();

   return useMutation({
      mutationFn: async (verifyOrder) => {
         const token = await getToken();
         return verifyPayment(verifyOrder, token);
      },
      onSuccess: () => {
         queryClient.invalidateQueries([
            QUERY_KEYS.ORDERS.GET_ALL_ORDERS,
            QUERY_KEYS.AUTH.IS_AUTHENTICATED,
         ]);
         toast.success("Payment verified successfully!");
      },
      onError: (error) => {
         const errorMessage = error?.response?.data?.message || "Error verifying payment";
         toast.error(errorMessage, {
            position: toast.POSITION.TOP_RIGHT,
         });
      },
   });
};

// get order by query
export const useGetOrdersWithQuery = (filters) => {
   const { getToken } = useAuth();

   // Build query string from filters
   const buildQueryString = (pageParam) => {
      const params = new URLSearchParams();

      // Add pagination
      params.append('page', pageParam);
      params.append('limit', '10');

      // Add filters (only if they have values)
      if (filters) {
         Object.entries(filters).forEach(([key, value]) => {
            if (value) {
               params.append(key, value);
            }
         });
      }

      return params.toString();
   };

   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.ORDERS.GET_ORDERS_WITH_QUERY, filters],
      queryFn: async ({ pageParam = 1 }) => {
         const queryString = buildQueryString(pageParam);
         const token = await getToken();
         return getOrdersForAdmin(queryString, token);
      },
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
      enabled: true, // The query will execute immediately
   });
};

// add review 
export const useAddReview = () => {
   try {
      const queryClient = useQueryClient();
      const { getToken } = useAuth();

      return useMutation({
         mutationFn: async (reviewData) => {
            const token = await getToken();
            return addReview(reviewData, token);
         },
         onSuccess: () => {
            queryClient.invalidateQueries([QUERY_KEYS.ORDERS.GET_ORDER_BY_ID]);
            toast.success("Review added successfully!");
         },
         onError: (error) => {
            const errorMessage = error?.response?.data?.message || "Error adding review";
            toast.error(errorMessage, {
               position: toast.POSITION.TOP_RIGHT,
            });
         },
      });
   } catch (error) {
      console.error("Error adding review:", error);
      throw error;
   }
};

// get all reviews by product id infinite pagination
export const useGetReviewsById = (slug, page = 1, limit = 5) => {
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.GET_REVIEWS_BY_ID, slug, page, limit],
      queryFn: ({ pageParam = 1 }) => getReviewsById(slug, pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}

// get all reviews
export const useGetAllReviews = (page = 1, limit = 5) => {
   const { getToken } = useAuth();

   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.REVIEWS.GET_ALL_REVIEWS, page, limit],
      queryFn: async ({ pageParam = 1 }) => {
         const token = await getToken();
         return getReviews(pageParam, limit, token);
      },
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}

// get all customers
export const useGetAllCustomers = (page = 1, limit = 5) => {
   const { getToken } = useAuth();

   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.CUSTOMERS.GET_ALL_CUSTOMERS, page, limit],
      queryFn: async ({ pageParam = 1 }) => {
         const token = await getToken();
         return getCustomers(pageParam, limit, token);
      },
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}

// get dashboard stats
export const useGetDashboardStats = () => {
   const { getToken } = useAuth();

   return useQuery({
      queryKey: [QUERY_KEYS.DASHVOARD.GET_DASHBOARD_DATA],
      queryFn: async () => {
         const token = await getToken();
         return getDashboardStats(token);
      },
      refetchOnWindowFocus: false,
   });
}