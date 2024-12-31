import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import TransactionsList from "./TableWallets"

const Wallets = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />

      <div className="content flex-1">
        <TopBar />

       

        <TransactionsList />
      </div>

    </div>
  );
};

export default Wallets;