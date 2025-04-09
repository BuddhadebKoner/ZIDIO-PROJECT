import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import SignIn from "./_auth/page/SignIn";
import SignUp from "./_auth/page/SignUp";
import ForgotPassword from "./_auth/page/ForgotPassword";
import { Cart, Home } from "./_root/page";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";

const App = () => {
  return (
    <>
      <header
        className='flex justify-center items-center bg-gray-900 p-3 text-gray-100 border-b border-gray-800'
        style={{
          backgroundImage: `linear-gradient(to right, rgba(40, 40, 40, 0.97), rgba(24, 24, 24, 0.97)), 
                           url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23333333' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
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
    </>
  );
};

export default App;