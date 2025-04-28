import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import SignIn from "./_auth/page/SignIn";
import SignUp from "./_auth/page/SignUp";
import ForgotPassword from "./_auth/page/ForgotPassword";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import { useEffect, useRef, createContext, useContext, useState } from "react";
import Lenis from '@studio-freight/lenis';
import { useAuth } from "./context/AuthContext";
import FullPageLoader from "./components/loaders/FullPageLoader";
import AdminLayout from "./_admin/AdminLayout";
import AuthCallback from "./_auth/page/AuthCallback";

// pages
import { AccountDetails, Address, Cart, Categories, Collections, Home, Offers, Orders, Product, Profile, Search, SosCallBack, Wishlist } from "./_root/page";
import { AdminAddCollection, AdminAddOffer, AdminAddProduct, AdminCategory, AdminCollection, AdminCustomers, AdminDashboard, AdminOffer, AdminOrders, AdminProduct, AdminReviews, AdminSettings, AdminUpdateCollection, AdminUpdateOffer, AdminUpdateProduct } from "./_admin/page";

export const SmoothScrollContext = createContext();

export const useSmoothScroll = () => useContext(SmoothScrollContext);

const App = () => {
  const lenis = useRef(null);
  // Add a new state for application readiness
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    lenis.current = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: true,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    const animate = (time) => {
      lenis.current.raf(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      lenis.current?.destroy();
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element && lenis.current) {
      lenis.current.scrollTo(element, {
        offset: 0,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  const {
    isAuthenticated,
    isLoading,
    error,
    currentUser,
    cartItemsCount,
    wishlistItemsCount,
    hasNotifications,
  } = useAuth();

  useEffect(() => {
    const documentReady = document.readyState === 'complete';

    const setReady = () => {
      // console.log({
      //   isAuthenticated,
      //   error,
      //   currentUser,
      //   cartItemsCount,
      //   wishlistItemsCount,
      //   hasNotifications,
      // });
      setAppIsReady(true);
    };

    if (!isLoading && documentReady) {
      const minLoadTimer = setTimeout(() => {
        setReady();
      }, 800);

      return () => clearTimeout(minLoadTimer);
    } else if (!documentReady) {
      const handleLoad = () => {
        if (!isLoading) {
          const minLoadTimer = setTimeout(() => {
            setReady();
          }, 800);

          return () => clearTimeout(minLoadTimer);
        }
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [isLoading, isAuthenticated, error, currentUser, cartItemsCount, wishlistItemsCount, hasNotifications]);

  if (!appIsReady) {
    return <FullPageLoader />;
  }

  return (
    <SmoothScrollContext.Provider value={{ scrollToSection }}>
      <div className="star-dots"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/auth-callback' element={<AuthCallback />} />
        </Route>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path="/category" element={<Categories />} />
          <Route path="/category/:slug" element={<Categories />} />
          <Route path="/collections/:collections" element={<Collections />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<Profile />} >
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/profile/address" element={<Address />} />
            <Route path="/profile/account-details" element={<AccountDetails />} />
          </Route>
          <Route path="/search" element={<Search />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/sso-callback" element={<SosCallBack />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          {/*admin dashbord  */}
          <Route index element={<AdminDashboard />} />
          {/* product edit and update */}
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
          <Route path="/admin/products/:slug" element={<AdminUpdateProduct />} />
          {/* edit update collections */}
          <Route path="/admin/collection" element={<AdminCollection />} />
          <Route path="/admin/collection/:slug" element={<AdminUpdateCollection />} />
          <Route path="/admin/add-collection" element={<AdminAddCollection />} />
          {/* edit update category */}
          <Route path="/admin/category" element={<AdminCategory />} />
          <Route path="/admin/category/:slug" element={<AdminCategory />} />
          {/* add offer */}
          <Route path="/admin/offer" element={<AdminOffer />} />
          <Route path="/admin/offer/:slug" element={<AdminUpdateOffer />} />
          <Route path="/admin/add-offer" element={<AdminAddOffer />} />
          {/* admin settings */}
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* orders */}
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:slug" element={<AdminOrders />} />
          {/* customers */}
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/customers/:slug" element={<AdminCustomers />} />
          {/* reviews */}
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/reviews/:slug" element={<AdminReviews />} />
        </Route>
      </Routes>
      {/* Toast notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={10000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </SmoothScrollContext.Provider>
  );
};

export default App;