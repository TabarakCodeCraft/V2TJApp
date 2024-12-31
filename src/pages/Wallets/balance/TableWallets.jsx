import React, { useEffect, useState } from 'react';
import {
    CheckSquare,
    X,
    Clock,
    CreditCard,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const STATE_CONFIG = {
    recharge: {
        icon: ArrowUpRight,
        label: 'Recharge'
    },
    transfer: {
        icon: ArrowRight,
        color: 'text-primary/80',
        label: 'Transfer'
    },
    completed: {
        icon: CheckSquare,
        color: 'text-success',
        label: 'Completed'
    },
    failed: {
        icon: X,
        color: 'text-danger',
        label: 'Failed'
    },
    reverse_vouchers: {
        icon: Clock,
        color: 'text-primary',
        label: 'Reverse Vouchers'
    },
    purchase: {
        icon: CreditCard,
        color: 'text-slate',
        label: 'Purchase'
    }
};

const StateBadge = ({ state, isType = false }) => {
    const getStateConfig = () => {
        if (isType) {
            // Handle type display
            const normalizedType = state?.toLowerCase();
            return STATE_CONFIG[normalizedType] || STATE_CONFIG.purchase;
        } else {
            // Handle state display
            const normalizedState = state?.toLowerCase();
            return STATE_CONFIG[normalizedState] || STATE_CONFIG.failed;
        }
    };

    const config = getStateConfig();
    const { icon: StateIcon, color, label } = config;

    return (
        <div className={`flex items-center ${color} px-2 py-1 rounded-full text-xs`}>
            <StateIcon className="w-4 h-4 mr-1" />
            {isType ? label : config.label}
        </div>
    );
};

// Pagination Component with blue color changes
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
                className="px-3 py-1 rounded border border-blue-500 text-blue-700 hover:bg-blue-600 disabled:opacity-50"
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
                            ? 'bg-blue-500 text-blue-600 border-blue-500'
                            : 'border-blue-500 text-blue-500 hover:bg-blue-800'
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


export default function TransactionsList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authorization token is missing. Please log in again.');
                setError(new Error('Authorization token is missing.'));
                setLoading(false);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", token);

            try {
                const response = await fetch(`http://192.168.69.50:8069/jt_api/wallets/balance/index/page/${currentPage}`, {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow",
                });

                if (!response.ok) {
                    throw new Error('Error fetching transaction data.');
                }

                const data = await response.json();

                // Adjust to match your API's response structure
                const transactionData = Array.isArray(data.data)
                    ? data.data
                    : data.data?.transactions || [];

                setTransactions(transactionData);

                // Set total pages from API response
                setTotalPages(data.last_page || Math.ceil(transactionData.length / itemsPerPage));
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [currentPage]);

    const navigate = useNavigate();

    const navigateGatway = () => {
        navigate("/gateways")
    }

    const navigateTransfer = () => {
        navigate("/transfer")
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        // Navigate to the wallet view page with the transaction/wallet data
        navigate(`/wallet/${transaction.id}`, {
            state: {
                walletData: transaction
            }
        });
    };


    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error.message}</div>;

    return (
        <div>

            <h2 className="intro-y text-lg font-medium mt-10">Transactions List</h2>
            <div className="grid grid-cols-12 gap-6 mt-5">
                <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
                    <button
                        className="btn btn-primary shadow-md mr-2"
                        onClick={navigateGatway}>
                        Recharge <FaPlus className='ml-2' />
                    </button>
                    <div className="dropdown">
                        <button className="btn bg-slate-100 shadow-md mr-2"
                            data-tw-toggle="dropdown"
                            onClick={navigateTransfer}
                        >
                            Transfer
                            <MdOutlineKeyboardArrowRight className='text-xl' />
                        </button>
                    </div>
                    <div className="hidden md:block mx-auto text-slate-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} entries
                    </div>
                </div>

                <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                    <table className="table table-report -mt-2 w-full">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap">ID</th>
                                <th className="whitespace-nowrap">GATEWAY</th>
                                <th className="whitespace-nowrap">TRANSACTION DETAILS</th>
                                <th className="text-center whitespace-nowrap">AMOUNT</th>
                                <th className="text-center whitespace-nowrap">TYPE</th>
                                <th className="text-center whitespace-nowrap">STATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="intro-x cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleTransactionClick(transaction)}
                                    >
                                        <td className="font-medium">#{transaction.id}</td>
                                        <td className="w-40">
                                            <div className="flex">
                                                <div className="w-10 h-10 image-fit zoom-in">
                                                    {transaction.gateway_payment?.icon ? (
                                                        <img
                                                            alt={transaction.gateway_payment.name}
                                                            className="tooltip rounded-full"
                                                            src={transaction.gateway_payment.icon}
                                                            title={`${transaction.gateway_payment.name} Gateway`}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium whitespace-nowrap">
                                                {transaction.name || 'Unknown'}
                                            </div>
                                            <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                                                {transaction.create_date
                                                    ? new Date(transaction.create_date).toLocaleString()
                                                    : 'Unknown Date'}
                                            </div>
                                        </td>
                                        <td className="text-center font-medium">
                                            {transaction.amount?.toLocaleString() || 'N/A'} IQD
                                        </td>
                                        <td className="w-44">
                                            <StateBadge
                                                state={transaction.type}
                                                isType={true}
                                            />
                                        </td>
                                        <td className="w-40">
                                            <StateBadge
                                                state={transaction.state}
                                                isType={false}
                                            />
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <div className="col-span-12">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};