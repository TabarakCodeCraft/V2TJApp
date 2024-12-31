import React, { useState } from "react";
import {
  Home,
  HardDrive,
  CreditCard,
  Trello,
  Ticket,
  Box,
  ChevronDown,
  X,
  User,
} from "lucide-react";
import "../assets/css/app.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import "./style.css"
const Sidebar = ({ isMobile, isOpen, toggleMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [
    {
      icon: <Home />,
      title: "Home",
      path: "/",
      hasSubmenu: false,
    },
    {
      icon: <CreditCard />,
      title: "Wallets",
      path: "/wallets",
      hasSubmenu: false,
      onClick: () => {
        navigate("/wallets");
        setActiveItem("Wallets");
      },
    },
    {
      icon: <HardDrive />,
      title: "FTTH Agent",
      path: "/ftth_agents",
      hasSubmenu: false,
    },
    {
      icon: <User />,
      title: "FTTH Endusers",
      path: "/ftth_endusers",
      hasSubmenu: false,
    },
    {
      icon: <Trello />,
      title: "Profile",
      path: "/profile",
      hasSubmenu: true,
    },
    {
      icon: <FiLogOut />,
      title: "Log Out",
      onClick: () => {
        // Remove token from localStorage
        localStorage.removeItem("token");
        navigate("/auth/login"); // or '/home'
      },
    },
  ];

  const handleMenuItemClick = (item) => {
    // Set active item
    setActiveItem(item.title);

    // Navigate if there's a path and an onClick handler
    if (item.path) {
      navigate(item.path);
    }

    // If there's a custom onClick, call it
    if (item.onClick) {
      item.onClick();
    }
  };

  const renderMenuItem = (item, index) => {
    // Determine if this item should be active
    const isActive =
      activeItem === item.title || location.pathname === item.path;

    return (
      <li key={index}>
        <a
          onClick={() => handleMenuItemClick(item)}
          className={`side-menu cursor-pointer ${
            isActive ? "side-menu--active" : ""
          }`}
        >
          <div className={`side-menu__icon ${isActive ? "text-blue-500" : ""}`}>
            {item.icon}
          </div>
          <div className="side-menu__title">
            {item.title}
            {item.hasSubmenu && (
              <div
                className={`side-menu__sub-icon ${
                  isActive ? "transform rotate-180" : ""
                }`}
              >
                <ChevronDown />
              </div>
            )}
          </div>
        </a>
      </li>
    );
  };

  if (isMobile) {
    return (
      <div className="relative">
        <div
          className={`fixed top-0 left-0 w-1/2 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out z-50 
                    ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:hidden`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
            <a href="" className="flex items-center">
              <img
                alt="Admin Template"
                className="w-6"
                src="https://www.jt.iq/images/logo.svg"
              />
            </a>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Box className="w-6 h-6" />}
            </button>
          </div>
          {isOpen && (
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              <ul className="py-2 space-y-1">
                {menuItems.map(renderMenuItem)}
              </ul>
            </div>
          )}
        </div>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          ></div>
        )}
      </div>
    );
  }

  return (
    <nav className="side-nav hidden md:block">
      <a href="" className="intro-x flex items-center pl-5 pt-4">
        <img
          alt="Admin Template"
          className="w-6"
          src="https://www.jt.iq/images/logo.svg"
        />
        <span className="hidden xl:block text-white text-lg ml-3">JT APP</span>
      </a>
      <div className="side-nav__devider my-6"></div>
      <ul>{menuItems.map(renderMenuItem)}</ul>
    </nav>
  );
};

export default Sidebar;
