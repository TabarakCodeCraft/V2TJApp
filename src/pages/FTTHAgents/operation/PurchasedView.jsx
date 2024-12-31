import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import Sidebar from "../../../components/sideBar";
import TopBar from "../../../components/topBar";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { IoIosRefresh } from "react-icons/io";
import "../operation/modal.css";
import { AnimatePresence, motion } from "framer-motion";
import { BsSendFill } from "react-icons/bs";
import { AlertCircle } from "lucide-react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";


const ReverseFormModal = ({ isOpen, onClose, onSubmit, type, isLoading }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(reason);
        setReason("");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="modal-content relative z-50">
                <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg p-6 transform transition-all duration-300 ease-out ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        {type} Reverse
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="text"
                                className="form-control w-full py-3 px-4 bg-gray-100 border-gray-300 rounded-lg"
                                placeholder="Enter reason..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4 justify-end">
                            <button type="button" className="btn btn-secondary w-24" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary w-24" disabled={isLoading}>
                                {isLoading ? "Loading..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};



const VoucherDetailsModal = ({ isOpen, onClose, voucherData, onReverse, isReversing }) => {
    if (!isOpen) return null;

    const formatAmount = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const canReverse = !voucherData?.reversed && !voucherData?.is_used;

    const handleReverse = () => {
        onClose(); // Close the voucher details modal before opening reverse modal
        onReverse(); // Call the reverse handler
    };
    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="modal-content relative z-50">
                <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-medium">Voucher Details</h2>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-gray-600">Series :</div>
                            <div>{voucherData?.series}</div>

                            <div className="text-gray-600">PIN :</div>
                            <div>{voucherData?.pin}</div>

                            <div className="text-gray-600">Price :</div>
                            <div>{formatAmount(voucherData?.value)} IQD</div>

                            <div className="text-gray-600">used : </div>
                            <div>{formatAmount(voucherData?.is_used ? "Used" : "unUsed")}</div>

                            <div className="text-gray-600">Status :</div>
                            <div>
                                {voucherData?.reversed ? "Reversed" : voucherData?.is_used ? "Used" : "Active"}
                            </div>

                            <div className="text-gray-600">Package :</div>
                            <div>{voucherData?.voucher_details?.name}</div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
                        <button
                            className="btn btn-secondary w-24"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            className="btn btn-primary w-24"
                            onClick={handleReverse}
                            disabled={!canReverse || isReversing}
                        >
                            {isReversing ? "Loading..." : "Reverse"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ErrorAlert = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center mb-4">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{message}</span>
    </div>
);

const PurchaseView = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const [purchase] = useState(state?.purchase || null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [selectedVoucherDetails, setSelectedVoucherDetails] = useState(null);
    const [isLoadingVoucherDetails, setIsLoadingVoucherDetails] = useState(false);

    useEffect(() => {
        const fetchVoucherData = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authorization token is missing. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const headers = new Headers({
                    "Authorization": token
                });

                const response = await fetch(
                    `http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/purchase_view?purchase_id=${id}`,
                    {
                        method: "GET",
                        headers: headers,
                        redirect: "follow"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch purchase details");
                }

                const data = await response.json();

                if (data.status === "success" && data.data) {
                    setVouchers(data.data);
                } else {
                    throw new Error(data.message || "Failed to fetch purchase details");
                }
            } catch (err) {
                setError(err.message || "An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchVoucherData();
        }
    }, [id]); // Only re-run if id changes

    const fetchVoucherDetails = useCallback(async (voucherId) => {
        const token = localStorage.getItem("token");
        setIsLoadingVoucherDetails(true);

        try {
            const response = await fetch(
                `http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/state?purchase_id=${id}&voucher_id=${voucherId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch voucher details");
            }

            const data = await response.json();

            if (data.status === "success") {
                setSelectedVoucherDetails(data.data);
                setIsVoucherModalOpen(true);
            } else {
                throw new Error(data.message || "Failed to fetch voucher details");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingVoucherDetails(false);
        }
    }, [id]); // Add id to dependencies

    const handleViewVoucher = useCallback((voucherId) => {
        fetchVoucherDetails(voucherId);
    }, [fetchVoucherDetails]);

    const handleReverseSubmit = async (reason) => {
        if (!reason.trim()) {
            setError("Please provide a reason for reversal");
            return;
        }

        const token = localStorage.getItem("token");
        setIsSubmitting(true);

        try {
            const endpoint = modalType === "Purchase"
                ? "http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/purchase_reverse"
                : "http://192.168.69.50:8069/jt_api/ftth_agent/vouchers/purchase_voucher_reverse";

            const payload = {
                reason,
                purchase_id: id,
                ...(modalType === "Voucher" && { voucher_id: selectedVoucherId })
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Reverse operation failed");
            }

            setTimeout(() => {
                setShowSuccessAlert(true);
                // window.location.reload();
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            setIsModalOpen(false);
        }
    };

    const handlePurchaseReverseClick = () => {
        setModalType("Purchase");
        setIsModalOpen(true);
    };

    const handleVoucherReverseClick = (voucherId) => {
        setModalType("Voucher");
        setSelectedVoucherId(voucherId);
        setIsModalOpen(true);
        setIsVoucherModalOpen(false); // Close the voucher details modal

    };

    if (error) {
        return (
            <div className="flex py-5 pr-10 pl-5 pb-20">
                <Sidebar isMobile={false} />
                <div className="content flex-1">
                    <TopBar />
                    <div className="intro-y mt-10">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p className="font-medium">{error}</p>
                            {error?.includes("token") && (
                                <p className="mt-2">Please try logging in again to continue.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Format the amount
    const formatAmount = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            <Sidebar isMobile={false} />
            <div className="content flex-1">
                <TopBar />
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
                            Reverse Operation Completed Successfully!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-12 gap-6">
                    {/* Purchase Details */}
                    <div className="col-span-12 lg:col-span-12 xl:col-span-8 mt-2">
                        <div className="intro-y block sm:flex items-center h-10">
                            <h2 className="text-lg font-medium truncate mt-3 mr-5">Purchase Details</h2>
                        </div>
                        {purchase && (
                            <div className="report-box-2 intro-y mt-12 sm:mt-5">
                                <div className="box sm:flex">
                                    <div className="px-8 py-12 flex flex-col justify-center flex-1">
                                        <RiShoppingBag4Fill className="w-10 h-10 text-warning" />
                                        <div className="relative text-3xl font-medium mt-10">
                                            {formatAmount(purchase.amount)}
                                            <span className="text-2xl font-medium ml-12">IQD</span>
                                        </div>
                                        <div className="mt-4 text-slate-500 mb-8">
                                            Purchase made by {purchase.agent_id}
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handlePurchaseReverseClick}
                                            disabled={purchase.reversed}
                                        >
                                            <IoIosRefresh className="text-xl mr-1 " />  {purchase.reversed ? "Reversed" : "Reverse"}
                                        </button>
                                    </div>
                                    <div className="px-8 py-12 flex flex-col justify-center flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-darkmode-300 border-dashed">
                                        <div className="text-slate-500 text-xs">TITLE</div>
                                        <div className="mt-1.5 flex items-center">
                                            <div className="text-base">{purchase.name}</div>
                                        </div>
                                        <div className="text-slate-500 text-xs mt-5">QUANTITY</div>
                                        <div className="mt-1.5 flex items-center">
                                            <div className="text-base">{purchase.quantity}</div>
                                        </div>
                                        <div className="text-slate-500 text-xs mt-5">STATUS</div>
                                        <div className="mt-1.5 flex items-center">
                                            <div className="text-base">{purchase.reversed ? "Reversed" : "Active"}</div>
                                        </div>
                                        <div className="text-slate-500 text-xs mt-5">DATE AND TIME</div>
                                        <div className="mt-1.5 flex items-center">
                                            <div className="text-base">{new Date(purchase.create_date).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vouchers List */}
                    <div className="col-span-4 mt-6">
                        <div className="intro-y flex items-center h-10">
                            <h2 className="text-lg font-medium truncate mr-5">Vouchers List</h2>
                        </div>
                        <div className="intro-y overflow-auto lg:overflow-visible mt-8 sm:mt-0">
                            {loading ? (
                                <div className="intro-y">
                                    <div className="box px-4 py-4 mb-3 flex items-center zoom-in">
                                        Loading voucher details...
                                    </div>
                                </div>
                            ) : vouchers.length > 0 ? (
                                <table className="table table-report sm:mt-2">
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Value</th>
                                            <th >Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vouchers.map((voucher) => (
                                            <tr className="intro-x" key={voucher.id}>
                                                <td>
                                                    <a href="" className="font-medium whitespace-nowrap">
                                                        {voucher.name}
                                                    </a>
                                                    <div className="text-black whitespace-nowrap">
                                                        {voucher.voucher_id}
                                                    </div>

                                                </td>
                                                <td className="text-black">{formatAmount(voucher.value)} IQD</td>

                                                <td className="">
                                                    <div className="flex justify-center">
                                                        <button
                                                            className="btn btn-primary w-24 mr-1 mb-2"
                                                            onClick={() => handleViewVoucher(voucher.voucher_id)}
                                                        >
                                                            View<MdOutlineKeyboardArrowRight className='text-xl'
                                                                onClick={() => handleViewVoucher(voucher.voucher_id)}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="intro-y">
                                    <div className="box px-4 py-4 mb-3">
                                        No vouchers available
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ReverseFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleReverseSubmit}
                    type={modalType}
                    isLoading={isSubmitting}
                />
                <VoucherDetailsModal
                    isOpen={isVoucherModalOpen}
                    onClose={() => { setIsVoucherModalOpen(false) }}
                    voucherData={selectedVoucherDetails}
                    onReverse={() => { handleVoucherReverseClick(selectedVoucherDetails?.voucher_id) }}
                    isReversing={isSubmitting}
                />
            </div>

        </div>
    );
};

export default PurchaseView;