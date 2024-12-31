import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/signUp";
import Home from "./pages/Home/home";
import Wallets from "./pages/Wallets/balance/index";
import Gateways from "./pages/Wallets/gateways/index";
import Transfer from "./pages/Wallets/balance/transfer";
import FtthAgent from "./pages/FTTHAgents/profile";
import Purchases from "./pages/FTTHAgents/purchases";
import ProfileAgent from "./pages/FTTHAgents/profileAgent";
import SubmitPurchases from "./pages/FTTHAgents/operation/SubmitPurchases";
import PurchasedView from "./pages/FTTHAgents/operation/purchasedView";
import ViewWallet from "./pages/Wallets/balance/ViewWallet";
import FTTHEndUsers from "./pages/FTTHEndusers/index";
import Profile from "./pages/profile/index";
import EndUsers from "./pages/FTTHEndusers/endusers/index";
import ProfileEndUser from "./pages/FTTHEndusers/endusers/profileEndUser";
import Provision from "./pages/FTTHEndusers/Provision/submissions_index";
import ProvisionView from "./pages/FTTHEndusers/Provision/submission_view";


function App() {
  // Check if the user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token; // Convert to boolean
  };

  // Protected Route Component
  const ProtectedRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/login" replace />;
  };

  // Public Route Component (redirect authenticated users away from auth pages)
  const PublicRoute = () => {
    return !isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<SignUp />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          {/* Wallet Route */}
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/wallet/:id" element={< ViewWallet />} />
          <Route path="/gateways" element={<Gateways />} />
          <Route path="/transfer" element={<Transfer />} />

          {/* ftthAgents Route */}
          <Route path="/ftth_agents" element={<FtthAgent />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/agents/:agentId" element={<ProfileAgent />} />
          <Route path="/purchases_voucher" element={< SubmitPurchases />} />
          <Route path="/purchases/:id" element={< PurchasedView />} />

          {/* ftthEndUsers Route */}
          <Route path="/ftth_endusers" element={< FTTHEndUsers />} />
          <Route path="/provision" element={< Provision />} />
          <Route path="/provision/:id" element={< ProvisionView />} />
          <Route path="/endusers" element={< EndUsers />} />
          <Route path="/enduser/:id" element={< ProfileEndUser />} />



        </Route>


      </Routes>
    </Router>
  );
}

export default App;