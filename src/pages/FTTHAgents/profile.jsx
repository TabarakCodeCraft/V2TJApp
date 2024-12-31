import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/sideBar'
import TopBar from "../../components/topBar";
import { SiTicktick } from "react-icons/si";
import profileImg from "../../assets/images/profile-1.jpg";
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { PiShoppingCart } from "react-icons/pi";
import { motion, AnimatePresence } from 'framer-motion';
import { RiLightbulbFlashFill } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";


export default function ProfileFTTHAgents() {
  const [agentsData, setAgentsData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [vouchersData, setVouchersData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization token is missing. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", token);

        const profileResponse = await fetch("http://192.168.69.50:8069/jt_api/ftth_agent/profile", {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        });

        if (!profileResponse.ok) {
          throw new Error('Error fetching profile data');
        }

        const profileResult = await profileResponse.json();

        const vouchersResponse = await fetch("http://192.168.69.50:8069/jt_api/ftth_agent/vouchers", {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        });

        if (!vouchersResponse.ok) {
          throw new Error('Error fetching vouchers data');
        }

        const vouchersResult = await vouchersResponse.json();

        setUserData(profileResult.data);
        setAgentsData(profileResult.data.agents);
        setVouchersData(vouchersResult.data);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const NavigateToPurchases = () => {
    navigate("/purchases")
  };
  


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl text-red-500">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      <Sidebar isMobile={false} />

      <div className="content flex-1">
        <TopBar />
        <div className="intro-y flex items-center mt-8 mb-6">
          <h2 className="text-lg font-medium mr-auto">
            FTTH Control
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Voucher Purchase Button */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y"
            onClick={NavigateToPurchases}>
            <div className="report-box zoom-in">
              <div className="box p-5">
                <div className="flex">
                  <PiShoppingCart className="report-box__icon text-primary" />
                </div>
                <div className="flex items-center space-x-2 mt-6 text-primary">
                  <div className="text-xl font-medium leading-8 ">Voucher purchase</div>
                  <MdOutlineKeyboardArrowRight className='text-3xl' />
                </div>
              </div>
            </div>
          </div>

     {/* My Agents Section */}
<div className="intro-y box col-span-12 xl:col-span-6">
  <div className="flex items-center px-5 py-5 sm:py-3 border-b border-slate-200/60 dark:border-darkmode-400">
    <h2 className="font-medium text-base mr-auto">My Agents</h2>
  </div>
  <div className="p-5">
    <div className="flex flex-col space-y-4">
      {agentsData && agentsData.length > 0 ? (
        agentsData.map((agent) => (
          <div key={agent.id} className="intro-y w-full">
            <div className="box">
              <div className="flex flex-col sm:flex-row items-center p-5">
                <div className="sm:w-12 sm:h-12 image-fit sm:mr-1">
                  <FaUserCircle className='text-4xl text-primary' />
                </div>
                <div className="sm:ml-2 sm:mr-auto text-center sm:text-left mt-3 sm:mt-0">
                  <a href="#" className="font-medium">
                    {agent.firstname} {agent.lastname}
                  </a>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {agent.name}
                  </div>
                </div>
                <div className="flex mt-4 sm:mt-0">
                  <button
                    onClick={() => navigate(`/agents/${agent.id}`)}
                    className="btn btn-primary py-1 px-4">
                    View
                    <MdOutlineKeyboardArrowRight className='text-xl' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-slate-500">No agents found</div>
      )}
    </div>
  </div>
</div>

          {/* Tips Section */}
          <div className="intro-y col-span-12 xl:col-span-3">
            <div className="bg-warning/20 dark:bg-darkmode-600 border border-warning dark:border-0 rounded-md relative p-5">
              <div className='flex items-center justify-center'><RiLightbulbFlashFill className="text-3xl" />
                <h2 className="text-lg font-medium">Tips</h2></div>
              <div className="leading-relaxed mt-2 text-slate-600 dark:text-slate-500">
                <div>1.  <strong>Voucher Purchase</strong>: Clicking on this button will take you
                  to a detailed view of all voucher transactions, where you can monitor purchase histories and related data.</div>
                <div className="mt-2">

                  <div>2.Clicking on <strong> View</strong> comprehensive list of all agents under your supervision.
                    .</div>
                  <li> Hierarchy Visualization: Explore the hierarchical structure of agents with an interactive layout.</li> </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}