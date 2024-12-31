import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import axios from "axios";
import { motion } from "framer-motion";
import "./index.css"
import { AlertCircle } from 'lucide-react';


export default function Index() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [gateways, setGateways] = useState([]);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Fetch Payment Gateways
    useEffect(() => {
        const fetchGateways = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authorization token is missing. Please log in again.');
                setError(new Error('Authorization token is missing.'));
                setLoading(false);
                return;
            }

            const headers = {
                Authorization: token,
            };

            try {
                const response = await axios.get(
                    "http://192.168.69.50:8069/jt_api/wallets/payment_gateways",
                    { headers }
                );
                console.log("API Response:", response.data);
                if (response.data && Array.isArray(response.data.data)) {
                    setGateways(response.data.data);
                } else {
                    throw new Error("Invalid response structure");
                }
                setError(null);
            } catch (err) {
                setError("Failed to fetch payment gateways");
                console.error("Error fetching gateways:", err);
                setGateways([]);
            }
        };

        fetchGateways();
    }, []);

    const handlePreparePayment = async () => {
        if (!selectedGateway || isNaN(amount) || parseFloat(amount) <= 0) {
            setError("Please select a gateway and enter a valid amount greater than 0");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authorization token found');
            }

            const response = await fetch(
                "http://192.168.69.50:8069/jt_api/wallets/payment_gateways/recharge/prepare",
                {
                    method: "POST",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        gateway_id: selectedGateway,
                        amount: parseFloat(amount)
                    }),
                    redirect: "follow"
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Payment preparation failed');
            }

            const result = await response.json();
            console.log('Payment prepared successfully:', result);
            setError(null);
            if (result?.status === "success" && result.data) {
                window.open(result.data, "_blank");
            } else {
                throw new Error("Invalid response data");
            }
        } catch (error) {
            console.error('Payment preparation error:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const GatewayButton = ({ gateway, isSelected, onClick }) => (
        <motion.button
            onClick={onClick}
            className={`gateway-button ${isSelected ? "selected" : ""}`}
        >
            <img
                src={gateway.icon || '/default-icon.png'}
                alt={gateway.name}
                className="icon"
            />
            <span>{gateway.name}</span>
        </motion.button>
    );

    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
        
            <Sidebar isMobile={false} />

            {/* Main Content */}
            <motion.div
                className="content flex-1"
                initial="hidden"
                animate="visible"
            >
                <TopBar />

                <div className="flex lg:flex-row gap-5 mt-5">

                    <div className="flex w-full max-w-5xl">
                        <motion.div
                            className="w-full bg-white dark:bg-darkmode-600 p-5 rounded-lg shadow" >
                            <div className="flex flex-col sm:flex-row items-center pb-5 border-b border-gray-200 dark:border-darkmode-400">
                                <h1 className="font-medium text-xl mr-auto">Select Payment Gateway To Recharge</h1>
                            </div>

                            {error && (
                                <div id="basic-alert" className="p-5">
                                    <div className="alert alert-danger show flex justify-between items-center" role="alert">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-6 h-6 mr-2" />
                                            <h2>{error}</h2>

                                            <button
                                                className="ml-4 text-red-700 text-xl hover:text-red-900"
                                                onClick={() => setError(null)}
                                                aria-label="Close alert"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loading Indicator */}
                            {loading && !gateways.length && (
                                <div className="text-gray-500 text-center mb-4">
                                    Loading gateways...
                                </div>
                            )}

                            {/* Payment Gateways in Two Columns */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {gateways.length > 0 ? (
                                    gateways.map((gateway) => (
                                        <GatewayButton
                                            key={gateway.id}
                                            gateway={gateway}
                                            isSelected={selectedGateway === gateway.id}
                                            onClick={() => setSelectedGateway(gateway.id)}
                                        />
                                    ))
                                ) : (
                                    !loading && (
                                        <p className="text-gray-500 col-span-2">
                                            No payment gateways available.
                                        </p>
                                    )
                                )}
                            </div>

                            {/* Amount Input */}
                            <div className="mb-4">
                                <label htmlFor="amount" className="block mb-2">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter amount"
                                />
                            </div>

                            {/* Prepare Payment Button */}
                            <button
                                onClick={handlePreparePayment}
                                disabled={loading || !selectedGateway || !amount}
                                className="btn btn-primary w-30"
                            >
                                {loading ? "Preparing..." : "Prepare Payment"}
                            </button>
                        </motion.div>


                    </div>
                </div>
            </motion.div>
        </div>
    );
}