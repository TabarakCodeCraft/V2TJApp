import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sideBar";
import TopBar from "../../components/topBar";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const total = Math.max(totalPages, 1);
        const pages = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (currentPage > 3) pages.push(1, '...');
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(total, currentPage + 2); i++) {
                pages.push(i);
            }
            if (currentPage < total - 2) pages.push('...', total);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-100 disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) =>
                page === '...' ? (
                    <span key={index} className="px-2 text-gray-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded border ${page === currentPage
                            ? 'bg-blue-500  border-blue-500'
                            : 'border-blue-800 text-blue-500 hover:bg-blue-100'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-100 disabled:opacity-50"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function Purchases() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    const fetchPurchases = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authorization token is missing. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", token);

            const purchasesResponse = await fetch(
                `http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/purchases?page=${currentPage}`,
                {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow",
                }
            );

            if (!purchasesResponse.ok) {
                throw new Error("Error fetching purchases data");
            }

            const result = await purchasesResponse.json();
            console.log("API Response:", result);

            if (result.status === "success") {
                setPurchases(result.data);
                // Update this section to use last_page instead
                if (result.last_page) {
                    setTotalPages(result.last_page);
                    setCurrentPage(result.current_page);

                } else {
                    console.error("No pagination information in API response");
                    setTotalPages(1);
                }
                setIsLoading(false);
            } else {
                throw new Error("Failed to fetch purchases");
            }
        } catch (err) {
            setError(err.message || "An unknown error occurred");
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPurchases();
    }, [currentPage]);

    const handleCreatePurchases = () => {
        navigate("/purchases_voucher");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
        };
    };

    // Format the amount
    const formatAmount = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            <Sidebar isMobile={true} isOpen={isMobileMenuOpen} />
            <Sidebar isMobile={false} />
            <div className="content flex-1">
                <TopBar />
                <h2 className="intro-y text-lg font-medium mt-10">Transaction List</h2>
                <div className="grid grid-cols-12 gap-6 mt-5">

                    <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
                        <button
                            className="btn btn-primary shadow-md mr-2 flex items-center space-x-2"
                            onClick={handleCreatePurchases}
                        >
                            <span className="mr-2">Purchases</span>
                            <FaPlus />
                        </button>
                    </div>
                    <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                        <table className="table table-report -mt-2 w-full">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>TITLE </th>
                                    <th>QUANTITY</th>
                                    <th className="text-center">AMOUNT</th>
                                    <th className="text-center">STATUS</th>
                                    <th className="text-center">DATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr
                                        key={purchase.id}
                                        className="intro-x cursor-pointer hover:bg-gray-100"
                                        onClick={() =>
                                            navigate(`/purchases/${purchase.id}`, {
                                                state: { purchase }, // Pass the full purchase object as state
                                            })
                                        }
                                    >
                                        <td className="font-medium">#{purchase.id}</td>
                                        <td className="font-medium">{purchase.name}</td>
                                        <td className="font-medium">{purchase.quantity}</td>
                                        <td className="text-center font-medium">{formatAmount(purchase.amount)}</td>
                                        <td className="text-center">
                                            <span
                                                className={`badge ${purchase.reversed ? "text-danger" : "text-success"
                                                    }`}
                                            >
                                                {purchase.reversed ? "Reversed" : "Active"}
                                            </span>
                                        </td>
                                        <td>
                                            {formatDate(purchase.create_date).date}
                                            <div className="text-slate-500 text-xs mt-0.5">
                                                {formatDate(purchase.create_date).time}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="intro-y col-span-12 flex items-center justify-center mt-5">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}
