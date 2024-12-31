import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../../components/sideBar';
import TopBar from '../../../components/topBar';
import { AnimatePresence, motion } from 'framer-motion';
import { FaPhone, FaUser, FaClock, FaUpload, FaDownload, FaRegIdCard, FaRegCalendarAlt } from "react-icons/fa";
import { MdSignalWifiStatusbarNotConnected } from "react-icons/md";
import { FiPlusSquare } from "react-icons/fi";
import { BsSendFill } from "react-icons/bs";
import "./modal.css";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content-wrapper">
        <div className="modal-content">{children}</div>
      </div>
    </>
  );
};

const ModalHeader = ({ title, onClose }) => (
  <div className="modal-header">
    <h2>{title}</h2>
    <button onClick={onClose} className="close-button">
      ×
    </button>
  </div>
);

const ModalBody = ({ children }) => <div className="modal-body">{children}</div>;

const ModalFooter = ({ onCancel, onSubmit }) => (
  <div className="modal-footer">
    <button onClick={onCancel} className="cancel-button btn btn-secondary">
      Cancel
    </button>
    <button onClick={onSubmit} className="submit-button btn btn-primary">
      Activate Offer
    </button>
  </div>
);
export default function ProfileEndUser() {
  const location = useLocation();
  const userData = location.state?.userData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://192.168.69.50:8069/jt_api/ftth_enduser/offers', {
        headers: {
          Authorization: token,
        },
      });
      const result = await response.json();
      setOffers(result.data || []);
    } catch (err) {
      setError("Failed to fetch offers");
    }
  };

  const handleSubmitOffer = async () => {
    if (!selectedOffer) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://192.168.69.50:8069/jt_api/ftth_enduser/offer_submit', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enduser_id: userData.id,
          offer_id: selectedOffer,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setSuccessMessage(`Offer activated successfully. New expiration: ${result.data.new_expiration}`);
        setIsModalOpen(false);

        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError("Failed to submit offer");
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        User data not found
      </div>
    );
  }

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />
      <div className="content flex-1">
        <TopBar />

        {error && (
          <div className="alert alert-error mb-4">{error}</div>
        )}

        <div className="intro-y box px-5 pt-5 mt-5">
          <div className="flex flex-col lg:flex-row border-b pb-5">
            {/* Profile Picture and Details */}
            <div className="flex flex-1 items-center justify-center lg:justify-start px-5">
              <img
                alt="User Profile"
                className="rounded-full w-20 h-20 sm:w-24 sm:h-24"
                src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
              />
              <div className="ml-5">
                <h2 className="font-medium text-lg">
                  <FaUser className="inline mr-2" /> {userData.name || 'No Name'}
                </h2>
                <p className="text-gray-500">
                  <FaRegIdCard className="inline mr-2" /> {userData.username}
                </p>
                <button
                  className="btn btn-secondary mt-4 "
                  onClick={() => setIsModalOpen(true)}
                >
                  Activate Offer <FiPlusSquare className=' text-primary ml-2 text-xl' />
                </button>
              </div>
            </div>
            {/* User Information */}
            <div className="flex-1 px-5 border-1">
              <h3 className="font-medium  text-primary ">User Details</h3>
              <p className='mt-3 mb-1'>
                <FaPhone className="inline mr-2" /> Phone: {userData.phone || 'N/A'}
              </p>
              <p className='mb-1'>
                <FaRegCalendarAlt className="inline mr-2" /> Expiration: {userData.expiration}
              </p>
              <p className='mb-1'>
                <FaClock className="inline mr-2" /> Uptime: {userData.uptime} seconds
              </p>
              <p className='mb-1'>
                <FaUpload className="inline mr-2" /> Upload: {userData.current_upload} bytes
              </p>
              <p className='mb-1'>
                <FaDownload className="inline mr-2" /> Download: {userData.current_download} bytes
              </p>
              <p className='mb-1'>
                <MdSignalWifiStatusbarNotConnected className="inline text-lg mr-2" /> Status: {userData.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader title="Activate Offer" onClose={() => setIsModalOpen(false)} />
          <ModalBody>
            <div className="mb-4">
              <label className="form-label">Select Offer</label>
              <select
                value={selectedOffer || ""}
                onChange={(e) => setSelectedOffer(e.target.value)}
                className="form-select"
              >
                <option value="" disabled>-- Select Offer --</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name}
                  </option>
                ))}
              </select>
            </div>
          </ModalBody>
          <ModalFooter
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleSubmitOffer}
          />
        </Modal>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="alert alert-primary show flex items-center mb-2"
              role="alert"
            >
              <BsSendFill className="w-6 h-6 mr-2" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}