import React, { useState } from 'react';
import {
    Send,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiLightbulbFlashFill } from "react-icons/ri";
import Sidebar from '../../../components/sideBar';
import TopBar from '../../../components/topBar';
import "./confiermModal.css"
import { BsSendFill } from "react-icons/bs"; // Added missing import


export default function Transfer() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        partner_id: '',
        amount: ''
    });
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [transferResult, setTransferResult] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false); // Added missing state



    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear error when input changes

        if (name === 'partner_id' && value) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please login again.');
                    return;
                }

                const response = await fetch("http://192.168.69.50:8069/jt_api/wallets/balance/transfer_receiver_info", {
                    method: "POST",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        partner_id: parseInt(value)
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch partner information');
                }

                const data = await response.json();
                if (!data.data) {
                    throw new Error('Partner not found');
                }
                setPartnerInfo(data.data);
            } catch (error) {
                setError(error.message);
                setPartnerInfo(null);
            }
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found. Please login again.');
            }

            // Basic validation
            if (!formData.partner_id || !formData.amount || !formData.description) {
                throw new Error('Please fill in all required fields');
            }

            if (parseFloat(formData.amount) <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            const response = await fetch("http://192.168.69.50:8069/jt_api/wallets/balance/transfer", {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    description: formData.description,
                    partner_id: parseInt(formData.partner_id),
                    amount: parseFloat(formData.amount)
                })
            });

            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.message || 'Transfer failed. Please try again.');
            }

            // If the response status is "success", display the success alert
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000); // Auto-hide success alert after 5 seconds


            setTransferResult({
                partnerId: formData.partner_id,
                amount: formData.amount,
                description: formData.description,
            });

            setFormData({
                description: '',
                partner_id: '',
                amount: ''
            });

            setIsConfirmationOpen(false);
            setIsSuccessModalOpen(true);

        } catch (error) {
            setError(error.message);
            setIsConfirmationOpen(false);
        } finally {
            setIsLoading(false);
        }
    };



    // const toggleMobileMenu = () => {
    //     setIsMobileMenuOpen(!isMobileMenuOpen);
    // };

    const openConfirmation = (e) => {
        e.preventDefault();
        setIsConfirmationOpen(true);
    };




    // Confirmation Modal (similar to previous implementation)
    const ConfirmationModal = ({
        isOpen,
        onClose,
        onConfirm,
        formData,
        isLoading,
        partnerInfo
    }) => {
        if (!isOpen) return null;
        const formatAmount = (price) => {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };
        return (
            <div className="modal-bg">
                {/* Modal container */}
                <div className="modal-dialog">
                    <div className="modal-content bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="modal-header flex justify-between items-center p-4 border-b">
                            <h2 className="font-medium text-lg">Confirm Transfer</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body p-4 grid grid-cols-12 gap-4 gap-y-3">
                            <div className="col-span-12 sm:col-span-6">
                                <label htmlFor="modal-form-1" className="form-label">
                                    Partner ID:
                                </label>
                                <input
                                    id="modal-form-1"
                                    type="text"
                                    className="form-control"
                                    value={formData.partner_id}
                                    disabled
                                />
                            </div>
                            {partnerInfo && (
                                <div className="col-span-12 sm:col-span-6">
                                    <label htmlFor="modal-form-2" className="form-label">
                                        Partner Name:
                                    </label>
                                    <input
                                        id="modal-form-2"
                                        type="text"
                                        className="form-control"
                                        value={partnerInfo.name}
                                        disabled
                                    />
                                </div>
                            )}
                            <div className="col-span-12 sm:col-span-6">
                                <label htmlFor="modal-form-3" className="form-label">
                                    Amount:
                                </label>
                                <input
                                    id="modal-form-3"
                                    type="text"
                                    className="form-control"
                                    value={`${formatAmount(formData.amount)}`}
                                    disabled
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                                <label htmlFor="modal-form-4" className="form-label">
                                    Description:
                                </label>
                                <input
                                    id="modal-form-4"
                                    type="text"
                                    className="form-control"
                                    value={formData.description}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer flex justify-end p-4 border-t">
                            <button
                                onClick={onClose}
                                type="button"
                                className="btn btn-outline-secondary w-24 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                type="button"
                                className="btn btn-primary w-24"
                            >
                                {isLoading ? 'Processing...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SuccessModal = ({ isOpen, onClose, transferResult }) => {
        if (!isOpen || !transferResult) return null;

        return (
            <div className="modal-bg">
                <div className="modal-dialog">
                    <div className="modal-content bg-white shadow-2xl">
                        <div className="modal-header flex justify-between items-center p-4 border-b">
                            <div className="flex items-center">

                                <div className="ttttt ">Transfer Successful</div>
                                <Check className="cheek " />
                            </div>

                        </div>
                        <div className="modal-body p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-600">From ID:</label>
                                    <p className="font-medium">{transferResult.partnerId}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600">Amount:</label>
                                    <p className="font-medium">${transferResult.amount}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600">Description:</label>
                                    <p className="font-medium">{transferResult.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer flex justify-end p-4 border-t">
                            <button
                                onClick={onClose}
                                className="btn btn-primary w-24"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="flex min-h-screen bg-gray-50 py-5 pr-10 pl-5">
            <Sidebar isMobile={false} />

            <div className="content flex-1">
                <TopBar />

                <div className="flex flex-col lg:flex-row gap-5 mt-5">
                    <motion.div
                        className="w-full lg:w-3/4 bg-white dark:bg-darkmode-600 p-5 rounded-lg shadow"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col sm:flex-row items-center pb-5 border-b border-gray-200 dark:border-darkmode-400">
                            <h1 className="font-medium text-xl mr-auto">Create New Transfer</h1>
                        </div>
                        {error && (
                            <div id="basic-alert" className="p-5">
                                <div className="alert alert-danger show flex items-center" role="alert">
                                    <AlertCircle className="w-6 h-6 mr-2" />
                                    <span>{error}</span>
                                    <button
                                        className="ml-auto text-red-700 hover:text-red-900"
                                        onClick={() => setError(null)}
                                        aria-label="Close alert"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
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
                                    Transfer Completed Successfully!
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <form onSubmit={openConfirmation} className="space-y-6 pt-5">
                            <div>
                                <label className="form-label">Partner ID</label>
                                <input
                                    type="number"
                                    name="partner_id"
                                    value={formData.partner_id}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control mb-4"
                                    placeholder="Enter Partner ID"
                                />
                            </div>

                            <div>
                                <label className="form-label">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    className="form-control mb-4"
                                    placeholder="Enter Transfer Amount"
                                />
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="form-control mb-4"
                                    placeholder="Enter transfer description"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn py-3 btn-primary w-full md:w-52 mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Next'}
                                <Send className="ml-2 w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Tips Section*/}
                    <motion.div
                        className="lg:w-1/2 bg-warning/20 dark:bg-darkmode-600 border border-warning dark:border-0 rounded-md p-5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <RiLightbulbFlashFill className="text-3xl" />
                            <h1 className="text-lg font-medium">How to Create a Transfer</h1>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="font-medium text-base mb-2 text-primary">1. Enter the Partner ID</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Identify the recipient of the transfer by providing their unique Partner ID.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2 text-primary">2. Specify the Amount</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Enter an amount greater than 1,000 IQD to proceed with the transfer.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2 text-primary">3. Provide a Description</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Add a description to explain the purpose of this transfer. This helps with record-keeping.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2 text-primary">4. Review Transfer Details</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    Click the <strong>Next</strong> button to review the details of your transfer before final submission.
                                </p>
                            </div>

                            <div>
                                <div className="font-medium text-base mb-2 text-primary">5. Complete the Transfer</div>
                                <p className="leading-relaxed text-sm text-slate-600 dark:text-slate-500">
                                    After verifying the details, click <strong>Send</strong> to complete the transfer process.
                                </p>
                            </div>

                            <div className="pt-2">
                                <div className="font-medium text-sm text-danger">Important Notes:</div>
                                <ul className="list-disc pl-4 mt-2 text-sm text-slate-600 dark:text-slate-500 space-y-1">
                                    <li>All fields are required to submit a Transfer</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>



                </div>
            </div>


            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isConfirmationOpen}
                onClose={() => setIsConfirmationOpen(false)}
                onConfirm={handleSubmit}
                formData={formData}
                isLoading={isLoading}
                partnerInfo={partnerInfo}
            />

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                transferResult={transferResult} // Pass transfer result here
            />

        </div>

    );
}