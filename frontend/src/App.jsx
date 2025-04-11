import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import SignIn from "./_auth/page/SignIn";
import SignUp from "./_auth/page/SignUp";
import ForgotPassword from "./_auth/page/ForgotPassword";
import { AccountDetails, Address, Cart, Categories, Collections, Home, Offers, Orders, Profile, Search } from "./_root/page";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import { useEffect, useRef, createContext, useContext } from "react";
import Lenis from '@studio-freight/lenis';

export const SmoothScrollContext = createContext();

export const useSmoothScroll = () => useContext(SmoothScrollContext);

const App = () => {
  const lenis = useRef(null);

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

  return (
    <SmoothScrollContext.Provider value={{ scrollToSection }}>
      <header
        className='flex justify-center items-center bg-gray-900 p-3 text-gray-100 border-b border-gray-800'>
        <p className="text-sm font-normal">Use code <span className="text-primary-300 font-semibold">SAVE350</span> & get ₹350/- off on order value of ₹3000</p>
      </header>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
        </Route>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path="/categories/:category/:type" element={<Categories />} />
          <Route path="/collections/:collections/:type" element={<Collections />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<Profile />} >
            <Route path="/profile/orders" element={<Orders />} />
            <Route path="/profile/address" element={<Address />} />
            <Route path="/profile/account-details" element={<AccountDetails />} />
          </Route>
          <Route path="/search" element={<Search />} />
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