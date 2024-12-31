import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sideBar';
import TopBar from "../../components/TopBar";
import Profile from "../Auth/profile_auth";

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Check if screen is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={toggleMobileMenu}
                    className="fixed top-5 left-5 z-50 md:hidden bg-white p-2 rounded-lg"
                >
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            )}
            
            <Sidebar 
                isMobile={isMobile} 
                isOpen={isOpen} 
                toggleMobileMenu={toggleMobileMenu}
            />
            
            <div className="content flex-1">
                <TopBar />
                <Profile />
            </div>
        </div>
    );
}