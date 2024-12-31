import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Monitor, User, ChevronUp, ChevronDown, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./style.css";
import { LuRefreshCcwDot } from "react-icons/lu";
import ImagePhone from "../../assets/images/phone-illustration.svg"

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [moduleData, setModuleData] = useState({});
    const [walletData, setWalletData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const MODULE_ICONS = {
        "wallets": {
            icon: <CreditCard className="w-10 h-10" />,
            defaultLabel: "Wallets",
            description: "Financial statistics from the API."
        },
        "ftth_agents": {
            icon: <Monitor className="w-10 h-10" />,
            defaultLabel: "FTTH Agents",
            description: "Overview of field agents."
        },
        "ftth_endusers": {
            icon: <ShoppingCart className="w-10 h-10" />,
            defaultLabel: "FTTH EndUsers",
            description: "Details of end-user operations."
        },
    };

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authorization token is missing. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const profileResponse = await fetch("http://192.168.69.50:8069/jt_api/auth/profile", {
                method: "GET",
                headers: { Authorization: token, "Content-Type": "application/json" },
            });

            if (!profileResponse.ok) {
                const { message } = await profileResponse.json();
                throw new Error(message || 'Error fetching profile data.');
            }

            const profileData = await profileResponse.json();
            setUserData(profileData.data);

            const walletResponse = await fetch("http://192.168.69.50:8069/jt_api/wallets/profile", {
                method: "GET",
                headers: { Authorization: token, "Content-Type": "application/json" },
            });

            if (walletResponse.ok) {
                const walletData = await walletResponse.json();
                setWalletData(walletData.data);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    const prepareModules = () => {
        const modules = [];

        if (walletData) {
            modules.push({
                url: 'wallets',
                icon: MODULE_ICONS.wallets.icon,
                label: MODULE_ICONS.wallets.defaultLabel,
                description: MODULE_ICONS.wallets.description,
                totalValue: walletData.balance || 0,
                walletId: walletData.id,
                percentage: walletData.percentage || 0,
                valueLabel: 'Current Balance'
            });
        }

        userData?.modules.forEach((moduleUrl) => {
            if (moduleUrl === 'wallets') return;

            const moduleStats = moduleData[moduleUrl] || {};
            const moduleInfo = MODULE_ICONS[moduleUrl] || {};

            modules.push({
                url: moduleUrl,
                icon: moduleInfo.icon || <User className="text-primary w-8 h-8" />,
                label: moduleInfo.defaultLabel || moduleUrl,
                description: moduleInfo.description || 'Module Details',
                totalValue: moduleStats.total || 0,
                percentage: moduleStats.percentage || 0,
                valueLabel: moduleUrl === 'ftth_agents' ? 'FTTH Agent' :
                    moduleUrl === 'ftth_endusers' ? 'FTTH Endusers' : 'Total Items'
            });
        });

        return modules;
    };

    const Cards = ({ icon, totalValue, valueLabel, walletId, url }) => {
        const handleNavigation = () => {
            navigate(`/${url}`);
        };

        const handleTransactionClick = () => {
            navigate("/wallets")
        };

        const isWallet = url === 'wallets';
        const isFTTH = url === 'ftth_agents' || url === 'ftth_endusers';

        return (
            <div
                className={`cursor-pointer ${isWallet
                    ? 'w-2/5 wallet-card'
                    : 'col-span-6 sm:col-span-10 xl:col-span-2 intro-y'
                    }`}
                onClick={handleNavigation}
            >
                <div className="report-box zoom-in">
                    <div className="box p-5">
                        {isWallet && (
                            <div className="flex justify-end">
                                

                                <button
                                    onClick={handleTransactionClick}
                                    className="btn btn-primary"
                                >
                                    <LuRefreshCcwDot className='w-6 h-5 mr-2' />
                                    Transaction
                                </button>

                            </div>
                        )}
                        <div className="flex text-primary mb-4">
                            {icon}
                        </div>
                        {!isFTTH && (
                            <div className="text-3xl font-medium leading-8 mt-6">{totalValue.toLocaleString()}</div>
                        )}
                        <div className="text-slate-500 text-xl leading-8 mt-2">{valueLabel}</div>

                        {walletId && (
                            <div className="text-sm text-slate-500 mt-2 truncate">
                                <div className="text-base text-slate-700 mt-1 ">MY_ID {walletId}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const availableModules = prepareModules();

    return (
        <div className="p-6">
            <div className="intro-y mt-2 flex items-center h-10">
                <h2 className="text-lg font-medium truncate">
                    {userData?.name ? `Welcome, ${userData.name}` : "This is Home Module"}
                </h2>
                <button
                    onClick={fetchUserData}
                    className="ml-auto flex items-center text-primary"
                >
                    <RefreshCcw className="w-4 h-4 mr-3" /> Refresh
                </button>
            </div>

            <div className="col-span-12 mt-4">

                {/* Wallet card container */}
                <div className=" intro-y grid grid-cols-2 gap-6 ">
                    {availableModules.filter(module => module.url === 'wallets').map((module, index) => (
                        <Cards
                            key={index}
                            icon={module.icon}
                            percentage={module.percentage}
                            valueLabel={module.valueLabel}
                            totalValue={module.totalValue}
                            label={module.label}
                            walletId={module.walletId}
                            url={module.url}
                        />
                    ))}

                </div>

                <div className="intro-y mt-8 flex items-center justify-between">
                    <h2 className="text-lg font-medium ">
                        Services
                    </h2>

                </div>
                {/* FTTH Agents and End Users in the second line */}
                <div className="grid grid-cols-12 gap-6 mt-[-2]">
                    {availableModules.filter(module =>
                        module.url === 'ftth_agents' || module.url === 'ftth_endusers'
                    ).map((module, index) => (
                        <Cards
                            key={index}
                            icon={module.icon}
                            percentage={module.percentage}
                            valueLabel={module.valueLabel}
                            totalValue={module.totalValue}
                            label={module.label}
                            url={module.url}
                        />
                    ))}
                </div>

                <div className="intro-y mt-8 flex items-center h-10 justify-between">
                    <h2 className="text-lg  font-medium truncate">
                        Install
                    </h2>

                </div>

                <div className="col-span-12 lg:col-span-6 ">
                    <div className="box p-8 relative overflow-hidden intro-y">
                        <div className="leading-[2.15rem] w-full sm:w-52 text-primary dark:text-white text-xl -mt-3">
                        Install Application for your <span className="font-medium">PHONE</span>!
                        </div>
                        <div className="w-full sm:w-60 leading-relaxed text-slate-500 mt-2">
                        To enjoy new features in the application and subscribe to Al-Jazeera Telecom Internet                        </div>
                        <div className="w-48 relative mt-6 cursor-pointer tooltip" title="Copy referral link">
                            <input
                                type="text"
                                className="form-control"
                                defaultValue="https://dashboard.in"
                            />
                            <i
                                data-lucide="copy"
                                className="absolute right-0 top-0 bottom-0 my-auto mr-4 w-4 h-4"
                            />
                        </div>
                        <img
                            className="hidden sm:block absolute top-0 right-0 mt-1 -mr-12"
                            alt="Phone Illustration"
                            src={ImagePhone}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

