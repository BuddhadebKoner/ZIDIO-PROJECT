import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { isAuthenticated } from "../api/auth.api";
import { QUERY_KEYS } from "./queryKeys";
import { useUser } from "@clerk/clerk-react";
import { getAddAddress, getCartProducts, getExtreamSearch, getHomeContentDetails, getUpdateAddress, getUpdateAvatar, getUpdateUser } from "../api/user.api";
import { toast } from "react-toastify";
import { addProduct, getCustomers, getInventorys, getOrdersForAdmin, getReviews } from "../api/admin.api";
import { getAllCollections, getCollectionById, getProductsByCollectionSlug, searchCollections } from "../api/collection.api";
import { addReview, addToCart, addToWishlist, filterProducts, getAllProducts, getProductById, getReviewsById, removeFromCart, removeFromWishlist, searchProducts, updateCart } from "../api/product.api";
import { getAllOffers, searchOffers } from "../api/offer.api";
import { getOrderById, getOrders } from "../api/order.api";

export const useIsAuthenticated = () => {
   const { user } = useUser();
   const clerkId = user?.id;

   return useQuery({
      queryKey: [QUERY_KEYS.AUTH.IS_AUTHENTICATED],
      queryFn: () => isAuthenticated(),
      enabled: !!clerkId,
   });
};

// Updated to use mutation for avatar update
export const useUpdateAvatar = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (avatarName) => getUpdateAvatar(avatarName),
      onSuccess: () => {
         queryClient.invalidateQueries([QUERY_KEYS.AUTH.IS_AUTHENTICATED]);
      },
   });
}

// update user deatils
export const useUpdateUserDetails = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (updateProfile) => getUpdateUser(updateProfile),
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

   return useMutation({
      mutationFn: (address) => getAddAddress(address),
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

   return useMutation({
      mutationFn: (address) => getUpdateAddress(address),
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

   return useMutation({
      mutationFn: (product) => addProduct(product),
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
      queryFn: () => getHomeContentDetails(),
      refetchOnWindowFocus: false,
      // meoised for 10 minutes
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

   return useMutation({
      mutationFn: (productId) => addToWishlist(productId),
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

   return useMutation({
      mutationFn: (productId) => removeFromWishlist(productId),
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
export const useAddToCart = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (productId, quantity, size) => addToCart(productId, quantity, size),
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

   return useMutation({
      mutationFn: (productId) => removeFromCart(productId),
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

// update cart quantity
export const useUpdateCartQuantity = () => {

}

// get cart products
export const useGetCartProducts = () => {
   return useQuery({
      queryKey: [QUERY_KEYS.PRODUCTS.GET_CART_PRODUCTS],
      queryFn: () => getCartProducts(),
      refetchOnWindowFocus: false,
   });
}

// update cart quantity and size
export const useUpdateCart = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data) => updateCart(data),
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
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.INVENTORY.GET_ALL_INVENTORY, limit],
      queryFn: ({ pageParam }) => getInventorys(pageParam, limit),
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
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.ORDERS.GET_ALL_ORDERS, limit],
      queryFn: ({ pageParam }) => getOrders(pageParam, limit),
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
   return useQuery({
      queryKey: [QUERY_KEYS.ORDERS.GET_ORDER_BY_ID, trackId],
      queryFn: () => getOrderById(trackId),
      refetchOnWindowFocus: false,
   });
}

// get order by query
export const useGetOrdersWithQuery = (filters) => {
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
      queryFn: ({ pageParam = 1 }) => {
         const queryString = buildQueryString(pageParam);
         return getOrdersForAdmin(queryString);
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

      return useMutation({
         mutationFn: (reviewData) => addReview(reviewData),
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
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.REVIEWS.GET_ALL_REVIEWS, page, limit],
      queryFn: ({ pageParam = 1 }) => getReviews(pageParam, limit),
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
   return useInfiniteQuery({
      queryKey: [QUERY_KEYS.CUSTOMERS.GET_ALL_CUSTOMERS, page, limit],
      queryFn: ({ pageParam = 1 }) => getCustomers(pageParam, limit),
      getNextPageParam: (lastPage) => {
         if (lastPage?.success && lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
         }
         return undefined;
      },
      refetchOnWindowFocus: false,
   });
}