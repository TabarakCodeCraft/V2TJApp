import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sideBar';
import TopBar from "../../components/topBar";
import {
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Network,
  Camera
} from 'lucide-react';
import { RiRadioButtonLine } from "react-icons/ri";
import profileImg from "../../assets/images/profile-1.jpg";

export default function AgentProfilePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('allUsers');

  const { agentId } = useParams();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchAgentProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authorization token is missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://192.168.69.50:8069/jt_api/ftth_agent/agent_profile/${agentId}`, {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent profile');
        }

        const result = await response.json();
        setAgentProfile(result.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchAgentProfile();
  }, [agentId]);

  const renderHierarchyTree = (children, level = 0) => {
    return children.map(child => (
      <div className="relative flex items-center mt-4" key={child.id}>
        <div className="flex-none image-fit">
          <RiRadioButtonLine className='text-2xl text-primary' />
        </div>
        <div className="ml-4 mr-auto">
          <a href="" className="font-medium">
            {child.name}
          </a>
          {child.childs && child.childs.length > 0 && (
            <div className="text-slate-500 text-xs mt-0.5">
              ({child.childs.length} sub-agents)
            </div>
          )}
        </div>
        <div className="font-medium text-slate-600 dark:text-slate-500">
          Level {level + 1}
        </div>
        {child.childs && child.childs.length > 0 && (
          <div className="pl-8">
            {renderHierarchyTree(child.childs, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen text-red-500">
      <div className="text-center">
        <p className="text-xl mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
   
      <Sidebar isMobile={false} />

      <div className="content flex-1">
        <TopBar />

        {agentProfile && (
          <div className="intro-y box px-5 pt-5 mt-5">
            <div className="flex flex-col lg:flex-row border-b border-slate-200/60 dark:border-darkmode-400 pb-5 -mx-5">
              <div className="flex flex-1 px-5 items-center justify-center lg:justify-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-none lg:w-32 lg:h-32 image-fit relative">
                  <img
                    alt="Agent Profile"
                    className="rounded-full"
                    src={profileImg}
                  />
                  <div className="absolute mb-1 mr-1 flex items-center justify-center bottom-0 right-0 bg-primary rounded-full p-2">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <div className="w-24 sm:w-40 truncate sm:whitespace-normal font-medium text-lg">
                    {agentProfile.name}
                  </div>
                </div>
              </div>

              <div className="mt-6 lg:mt-0 flex-1 px-5 border-l border-r border-slate-200/60 dark:border-darkmode-400 border-t lg:border-t-0 pt-5 lg:pt-0">
                <div className="font-medium text-center lg:text-left lg:mt-3">
                  Profile Info
                </div>
                <div className="flex flex-col justify-center items-center lg:items-start mt-4">
                  <div className="truncate sm:whitespace-normal flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {agentProfile.firstname}
                  </div>
                  <div className="truncate sm:whitespace-normal flex items-center mt-3">
                    <Mail className="w-4 h-4 mr-2" />
                    {agentProfile.lastname}
                  </div>
                  <div className="truncate sm:whitespace-normal flex items-center mt-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    {agentProfile.address}
                  </div>
                </div>
              </div>
            </div>

            <ul className="nav nav-link-tabs flex-col sm:flex-row justify-center lg:justify-start text-center">
              <li className="nav-item" role="presentation">
                <a
                  href="#"
                  className={`nav-link py-4 ${activeTab === 'allUsers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('allUsers')}
                  role="tab"
                >
                  Info
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  href="#"
                  className={`nav-link py-4 ${activeTab === 'agentHierarchy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('agentHierarchy')}
                  role="tab"
                >
                  Agent Hierarchy
                </a>
              </li>
            </ul>

            {activeTab === 'allUsers' && (
              <div className="intro-y box col-span-12 lg:col-span-6">
                <div className="flex items-center px-5 py-5 sm:py-3 border-b border-slate-200/60 dark:border-darkmode-400">
                  <h2 className="font-medium text-base mr-auto">Performance</h2>
                </div>
                <div className="p-5">
                  <div className="relative flex items-center">
                    <div className="flex-none image-fit">
                      <RiRadioButtonLine className='text-2xl text-success' />
                    </div>
                    <div className="ml-4 mr-auto">
                      <a href="" className="font-medium">
                        Total Users
                      </a>
                    </div>
                    <div className="font-medium text-slate-600 dark:text-slate-500">
                      {agentProfile.current_total_users}
                    </div>
                  </div>

                  <div className="relative flex items-center mt-4">
                    <div className="flex-none image-fit">
                      <RiRadioButtonLine className='text-2xl text-primary' />
                    </div>
                    <div className="ml-4 mr-auto">
                      <a href="" className="font-medium">
                        Online Users
                      </a>
                    </div>
                    <div className="font-medium text-slate-600 dark:text-slate-500">
                      {agentProfile.current_online_users || 0}
                    </div>
                  </div>

                  <div className="relative flex items-center mt-4">
                    <div className="flex-none image-fit">
                      <RiRadioButtonLine className='text-2xl text-warning' />
                    </div>
                    <div className="ml-4 mr-auto">
                      <a href="" className="font-medium">
                        Active Users
                      </a>
                    </div>
                    <div className="font-medium text-slate-600 dark:text-slate-500">
                      {agentProfile.current_active_users}
                    </div>
                  </div>

                  <div className="relative flex items-center mt-4">
                    <div className="flex-none image-fit">
                      <RiRadioButtonLine className='text-2xl text-info' />
                    </div>
                    <div className="ml-4 mr-auto">
                      <a href="" className="font-medium">
                        Allowed Ports
                      </a>
                    </div>
                    <div className="font-medium text-slate-600 dark:text-slate-500">
                      {agentProfile.allowed_ports_limit}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agentHierarchy' && (
              <div className="intro-y box col-span-12 lg:col-span-6">
                <div className="flex items-center px-5 py-5 sm:py-3 border-b border-slate-200/60 dark:border-darkmode-400">
                  <h2 className="font-medium text-base mr-auto">Agent Hierarchy</h2>
                </div>
                <div className="p-5">
                  {agentProfile.parent && (
                    <div className="relative flex items-center">
                      <div className="flex-none image-fit">
                        <RiRadioButtonLine className='text-2xl text-primary' />
                      </div>
                      <div className="ml-4 mr-auto">
                        <a href="" className="font-medium">
                          Parent Agent
                        </a>
                      </div>
                      <div className="font-medium text-slate-600 dark:text-slate-500">
                        {agentProfile.parent.name}
                      </div>
                    </div>
                  )}

                  {agentProfile.children && agentProfile.children.length > 0 ? (
                    renderHierarchyTree(agentProfile.children)
                  ) : (
                    <div className="text-slate-500 text-center mt-4">
                      No sub-agents
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}