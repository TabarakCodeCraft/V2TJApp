import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import Sidebar from "../../components/sideBar";
import TopBar from "../../components/topBar";
import { SlNote } from "react-icons/sl";
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiUserX, FiUserMinus, FiWifi } from "react-icons/fi";
import { Box, MenuItem, Select, Typography, InputLabel, FormControl } from '@mui/material';

const Index = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [dashboardData, setDashboardData] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    const SelectAgent = ({ dashboardData, selectedAgent, handleAgentChange }) => {
        return (
            <Box className="intro-y p-5 border-b border-slate-200/60 dark:border-darkmode-400 ">
                <Box display="flex" alignItems="center" mb={4}>
                    <Box className="p-2 rounded-full bg-purple-100 mr-2">
                        <FiUsers className="w-5 h-5" />
                    </Box>
                    <Typography variant="h6" className="font-medium text-base">Select Agent</Typography>
                </Box>
                <FormControl fullWidth>
                    <Select
                        labelId="select-agent-label"
                        value={selectedAgent?.agent_username || ''}
                        onChange={(event) => handleAgentChange(event)}
                        displayEmpty
                        className="bg-white rounded-lg"
                    >
                        <MenuItem value="" disabled>
                            Select an agent
                        </MenuItem>
                        {dashboardData.map((agent) => (
                            <MenuItem key={agent.agent_id} value={agent.agent_username}>
                                {agent.agent_username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        );
    };


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

                const response = await fetch("http://192.168.69.50:8069/jt_api/ftth_enduser/endusers_home", {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                });

                if (!response.ok) {
                    throw new Error('Error fetching dashboard data');
                }

                const result = await response.json();
                setDashboardData(result.data);
                setSelectedAgent(result.data[0]); // Select first agent by default
                setIsLoading(false);
            } catch (error) {
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedAgent) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active Users', 'Expired Users',],
                datasets: [{
                    data: [
                        selectedAgent.users_active,
                        selectedAgent.users_expired,
                        // selectedAgent.users_expiring_soon,
                        // selectedAgent.online_users
                    ],
                    backgroundColor: ['#10B981', '#F43F5E', ],
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 20, // Add margin at the top
                        bottom: 20, // Add margin at the bottom
                    },
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 16,
                            },

                        },
                    },
                    tooltip: {
                        bodyFont: {
                            size: 14, // Adjust font size for tooltip content
                        },
                        titleFont: {
                            size: 16, // Adjust font size for tooltip title
                        },
                    },
                },
            },
        });


        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [selectedAgent]);

    const handleAgentChange = (event) => {
        const agent = dashboardData.find(a => a.agent_username === event.target.value);
        setSelectedAgent(agent);
    };

    const naviagte = useNavigate();
    const naviagteProvision = () => { naviagte("/provision") }
    const naviagteEndUser = () => { naviagte("/endusers") }

    const naviagteUsers = (filterType) => {
        naviagte("/endusers", {
            state: {
                filterType,
                // Add any additional filter parameters if needed
                condition: {
                    key: getFilterKey(filterType),
                    value: getFilterValue(filterType)
                }
            }
        });
    };

    const getFilterKey = (filterType) => {
        switch (filterType) {
            case 'active':
                return 'enabled';
            case 'expired':
                return 'expiration';
            case 'expiring':
                return 'expiration';
            case 'online':
                return 'online';
            default:
                return '';
        }
    };
    const getFilterValue = (filterType) => {
        switch (filterType) {
            case 'active':
                return 'yes';
            case 'expired':
                return 'expired'; // Assuming this is the API value for expired users
            case 'expiring':
                return 'expiring_soon'; // Assuming this is the API value for expiring soon
            case 'online':
                return 'yes';
            default:
                return '';
        }
    };


    if (isLoading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            <Sidebar isMobile={false} />
            <div className="content flex-1">
                <TopBar />


                <div className="w-full space-y-6">
                    {/* Chart Section */}
                    <div className="flex flex-wrap lg:flex-nowrap space-y-6 lg:space-y-0 intro-y">
                        <div className="intro-y box p-5 w-full lg:w-2/3">
                            <Typography variant="h6" className="font-medium text-base">
                                User Status Distribution
                            </Typography>

                            <div className="h-[300px] mt-10">
                                <canvas ref={chartRef} />
                            </div>
                        </div>



                        <div className="intro-y w-full lg:w-1/3 space-y-4">
                            <div className="box p-5">
                                {/* Agent Selection */}
                                <SelectAgent
                                    dashboardData={dashboardData}
                                    selectedAgent={selectedAgent}
                                    handleAgentChange={handleAgentChange}
                                />

                                {/* <h2 className="font-medium text-base">Statistics</h2> */}
                                <div className="grid grid-cols-2 gap-4 intro-y ">
                                    {/* Statistics Cards */}
                                    {[
                                        {
                                            label: "Active Users",
                                            count: selectedAgent?.users_active,
                                            bgColor: "text-success",
                                            textColor: "text-success",
                                            icon: <FiUserCheck className="text-success w-6 h-6" />,
                                            filterType: 'active'

                                        },
                                        {
                                            label: "Expired Users",
                                            count: selectedAgent?.users_expired,
                                            bgColor: "text-danger",
                                            textColor: "text-danger",
                                            icon: <FiUserX className="text-danger w-6 h-6" />,
                                            filterType: 'expired'

                                        },
                                        {
                                            label: "Expiring Soon",
                                            count: selectedAgent?.users_expiring_soon,
                                            bgColor: "text-pending",
                                            textColor: "text-pending",
                                            icon: <FiUserMinus className="text-pending w-6 h-6" />,
                                            filterType: 'expiring'

                                        },
                                        {
                                            label: "Online Users",
                                            count: selectedAgent?.online_users,
                                            bgColor: "text-primary",
                                            textColor: "text-primary",
                                            icon: <FiWifi className="text-primary w-6 h-6" />,
                                            filterType: 'online'

                                        },
                                    ].map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className={`box p-5 ${stat.bgColor} hover:shadow-md cursor-pointer transition-shadow duration-200 rounded-lg intro-y`}
                                            onClick={() => naviagteUsers(stat.filterType)}
                                            >
                                            <div className="flex items-center">
                                                <div className="rounded-full">{stat.icon}</div>
                                                <span className="ml-2 text-sm font-medium text-slate-700">
                                                    {stat.label}
                                                </span>
                                            </div>
                                            <div className={`text-2xl font-bold mt-2 ${stat.textColor}`}>
                                                {stat.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>


                <div className="grid grid-cols-2 gap-6 mt-10">
                    <div className="report-box hover:shadow-lg transition-shadow duration-200 intro-y" >
                        <div class="report-box zoom-in" onClick={naviagteEndUser}>
                            <div class="box p-5">
                                <div class="flex">
                                    <FiUsers class="report-box__icon text-primary" />

                                    <div class="ml-auto">
                                        <div class="" >ItemList </div>
                                    </div>
                                </div>
                                <h2 class="text-xl font-medium leading-8 mt-6">EndUsers</h2>
                            </div>
                        </div>
                    </div>

                    <div className="report-box hover:shadow-lg transition-shadow duration-200 intro-y" >
                        <div class="report-box zoom-in" onClick={naviagteProvision}>
                            <div class="box p-5">
                                <div class="flex">
                                    <SlNote class="report-box__icon text-primary text-pending" />
                                    <div class="ml-auto">
                                        <div class="" >ItemList </div>
                                    </div>
                                </div>
                                <h2 class="text-xl font-medium leading-8 mt-6">Provision</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;


