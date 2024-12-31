import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import { RiLightbulbFlashFill } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitPurchases() {
    // State variables
    const [vouchers, setVouchersData] = useState([]);
    const [agents, setAgentsData] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [title, setTitle] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token is missing. Please log in again.');
                return;
            }

            try {
                // Prepare headers
                const myHeaders = new Headers();
                myHeaders.append("Authorization", token);

                // Fetch Profile Data
                const profileResponse = await fetch("http://192.168.69.50:8069/jt_api/ftth_agent/profile", {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                });

                if (!profileResponse.ok) {
                    throw new Error('Error fetching profile data');
                }

                const profileResult = await profileResponse.json();

                // Fetch Vouchers Data
                const vouchersResponse = await fetch("http://192.168.69.50:8069/jt_api/ftth_agent/vouchers", {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                });

                if (!vouchersResponse.ok) {
                    throw new Error('Error fetching vouchers data');
                }

                const vouchersResult = await vouchersResponse.json();

                // Fetch Wallet Profile - with improved error handling
                try {
                    const walletResponse = await fetch("http://192.168.69.50:8069/wallets/profile", {
                        method: "GET",
                        headers: myHeaders,
                        redirect: "follow"
                    });

                    if (walletResponse.ok) {
                        const walletResult = await walletResponse.json();
                        setWalletBalance(walletResult.data?.balance || 0);
                    } else {
                        // Log the error but don't throw - allow other data to load
                        console.warn('Error fetching wallet data:', walletResponse.statusText);
                        setWalletBalance(0);
                    }
                } catch (walletError) {
                    console.warn('Wallet fetch error:', walletError);
                    setWalletBalance(0);
                }

                // Update state with fetched data
                setAgentsData(profileResult.data.agents);
                setVouchersData(vouchersResult.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(error.message);
            }
        };

        fetchData();
    }, []);

    // Calculate total price when voucher or quantity changes
    useEffect(() => {
        if (selectedVoucher && quantity) {
            const selectedVoucherObj = vouchers.find(v => v.id.toString() === selectedVoucher);
            if (selectedVoucherObj) {
                const price = selectedVoucherObj.price * parseInt(quantity);
                setTotalPrice(price);
            }
        } else {
            setTotalPrice(0);
        }
    }, [selectedVoucher, quantity, vouchers]);

    // Handle purchase submission
    const handleSubmit = async () => {
        // Validate inputs
        if (!selectedVoucher || !selectedAgent || !title || !quantity) {
            toast.error('Please fill in all fields');
            return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authorization token is missing. Please log in again.');
            return;
        }

        setIsLoading(true);

        try {
            // Prepare headers
            const myHeaders = new Headers();
            myHeaders.append("Authorization", token);
            myHeaders.append("Content-Type", "application/json");

            // Prepare request body
            const requestBody = JSON.stringify({
                name: title,
                agent_id: parseInt(selectedAgent),
                voucher_id: parseInt(selectedVoucher),
                quantity: parseInt(quantity)
            });

            // Submit purchase
            const response = await fetch("http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/purchase_submit", {
                method: "POST",
                headers: myHeaders,
                body: requestBody,
                redirect: "follow"
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Error submitting purchase');
            }

            const result = await response.json();
            toast.success('Purchase submitted successfully!');

            // Show success alert
            setShowSuccessAlert(true);

            // Hide success alert after 3 seconds
            setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);

            // Reset form
            setSelectedVoucher('');
            setSelectedAgent('');
            setTitle('');
            setQuantity('');

            // Optional: Update wallet balance
            if (walletBalance !== null) {
                setWalletBalance(prevBalance =>
                    prevBalance !== null ? prevBalance - totalPrice : prevBalance
                );
            }
        } catch (error) {
            console.error("Error submitting purchase:", error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const formatAmount = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            <Sidebar isMobile={false} />
            <div className="content flex-1">
                <TopBar />

                {/* Success Alert with Animation */}
                <AnimatePresence>
                    {showSuccessAlert && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="alert alert-primary show flex items-center mb-2"
                            role="alert"
                        >
                            <BsSendFill className="w-6 h-6 mr-2" />
                            Purchase Submitted Successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col lg:flex-row gap-5 mt-5">
                    {/* Forma Card */}
                    <motion.div
                        className="w-full lg:w-1/4 bg-white dark:bg-darkmode-600 p-5 rounded-lg shadow"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col sm:flex-row items-center pb-5 border-b border-gray-200 dark:border-darkmode-400">
                            <h1 className="font-medium text-xl mr-auto">Purchases Voucher</h1>
                        </div>
                        <div id="basic-select" className="pt-5">
                            <div className="preview">
                                {/* Voucher Select */}
                                <div>
                                    <label>Vouchers</label>
                                    <div className="mt-2">
                                        <select
                                            className="tom-select w-full"
                                            value={selectedVoucher}
                                            onChange={(e) => setSelectedVoucher(e.target.value)}
                                        >
                                            <option value="" disabled>Select a Voucher</option>
                                            {vouchers.map((voucher) => (
                                                <option
                                                    key={voucher.id}
                                                    value={voucher.id}
                                                >
                                                    {voucher.name} - ${formatAmount(voucher.price)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Agents Select */}
                                <div className="mt-3">
                                    <label>Agents</label>
                                    <div className="mt-2">
                                        <select
                                            className="tom-select w-full"
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                        >
                                            <option value="" disabled>Select an Agent</option>
                                            {agents.map((agent) => (
                                                <option
                                                    key={agent.id}
                                                    value={agent.id}
                                                >
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Form Inputs */}
                                <div className="mt-5">
                                    <label htmlFor="vertical-form-1" className="form-label">
                                        Title
                                    </label>
                                    <input
                                        id="vertical-form-1"
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <label htmlFor="vertical-form-2" className="form-label">
                                        Quantity
                                    </label>
                                    <input
                                        id="vertical-form-2"
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>

                                {/* Total Price Display */}
                                {totalPrice > 0 && (
                                    <motion.div
                                        className="mt-3 text-right font-semibold text-blue-600"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        Total Price: ${formatAmount(totalPrice.toFixed(2))}
                                    </motion.div>
                                )}

                                <button
                                    type="button"
                                    className="btn py-3 btn-primary w-full md:w-52 mt-6"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tips Card */}
                    <motion.div
                        className="lg:w-1/2 bg-warning/20 dark:bg-darkmode-600 border border-warning dark:border-0 rounded-md p-5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <RiLightbulbFlashFill className="text-3xl " />
                            <h1 className="text-lg font-medium">How to Submit a Purchase</h1>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="font-medium text-base mb-2 text-primary">1. Select a Voucher</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Choose from available vouchers in the dropdown menu. Each voucher displays its name and price.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2  text-primary">2. Choose an Agent</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Select the agent who will be responsible for managing these vouchers.
                                    Make sure to choose the correct agent.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2  text-primary">3. Enter Purchase Details</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    • Title: Enter a descriptive name for this purchase<br />
                                    • Quantity: Enter the number of vouchers you want to purchase. Your total price will update automatically.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2  text-primary">4. Check Your Balance</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Ensure you have sufficient funds in your wallet before submitting.
                                    The total purchase amount will be deducted from your wallet balance immediately upon successful submission.
                                </p>
                            </div>

                            <div className="pt-2">
                                <div className="font-medium text-sm text-danger">Important Notes:</div>
                                <ul className="list-disc pl-4 mt-2 text-sm text-slate-600 dark:text-slate-500 space-y-1">
                                    <li>All fields are required to submit a purchase</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>


            </div>
        </div>
    );
}