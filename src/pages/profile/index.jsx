import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sideBar";
import TopBar from "../../components/topBar";
import { FiMail, FiInstagram, FiTwitter, FiLogOut } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";

export default function Index() {
  const [profile, setProfile] = useState({
    name: "",
    image: "",
    email: "",
    login: "",
    timezone: "",
  });

    const [isMobile, setIsMobile] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
  
      // Check if screen is mobile
      useEffect(() => {
          const checkMobile = () => {
              setIsMobile(window.innerWidth < 768);
          };
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
      }, []);
  
      const toggleMobileMenu = () => {
          setIsOpen(!isOpen);
      };
      
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authorization token is missing. Please log in again.");
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", token);

      try {
        const response = await fetch(
          "http://192.168.69.50:8069/jt_api/auth/profile",
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
          }
        );

        if (!response.ok) {
          throw new Error("Error fetching profile data.");
        }

        const data = await response.json();
        setProfile({
          name: data.data.name,
          image: data.data.profile_image,
          email: data.data.email,
          login: data.data.login,
          timezone: data.data.tz,
        });
      } catch (err) {
        console.error("Error fetching profile data:", err.message);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Optionally, you can redirect to a login page
  };

  return (
    <div className="flex py-5 pr-10 pl-5 pb-20">
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-5 left-5 z-50 md:hidden bg-white p-2 rounded-lg"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <Sidebar
        isMobile={isMobile}
        isOpen={isOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      <div className="content flex-1">
        <TopBar />

        <div className="intro-y box px-5 pt-5 mt-5">
          <div className="flex flex-col lg:flex-row border-b border-slate-200/60 dark:border-darkmode-400 pb-5 -mx-5">
            <div className="flex flex-1 px-5 items-center justify-center lg:justify-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-none lg:w-32 lg:h-32 image-fit relative">
                <img
                  alt="Profile Image"
                  className="rounded-full"
                  src={profile.image || "default-image.jpg"} // Use default if no image is provided
                />
              </div>
              <div className="ml-5">
                <div className="w-24 sm:w-40 truncate sm:whitespace-normal font-medium text-lg">
                  {profile.name || "Loading..."}
                </div>
                {/* <div className="text-slate-500">Owner</div> */}
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex-1 px-5 border-l border-r border-slate-200/60 dark:border-darkmode-400 border-t lg:border-t-0 pt-5 lg:pt-0">
              <div className="font-medium text-center lg:text-left lg:mt-3">
                Contact Details
              </div>
              <div className="flex flex-col justify-center items-center lg:items-start mt-4">
                <div className="truncate sm:whitespace-normal flex items-center">
                  <FiMail className="w-4 h-4 mr-2" />{" "}
                  {profile.email || "Loading..."}
                </div>
                <div className="truncate sm:whitespace-normal flex items-center mt-3">
                  <FiInstagram className="w-4 h-4 mr-2" /> Instagram{" "}
                  {profile.login || "Loading..."}
                </div>

                <div className="truncate sm:whitespace-normal flex items-center mt-3">
                  <IoLocationOutline className="w-4 h-4 mr-2" /> Timezone:{" "}
                  {profile.timezone || "Loading..."}
                </div>
              </div>
            </div>
          </div>

          <ul
            className="nav nav-link-tabs flex-col sm:flex-row justify-center lg:justify-start text-center"
            role="tablist"
          >
            <li id="profile-tab" className="nav-item" role="presentation">
              <a
                href="#"
                className="nav-link py-4 flex items-center active"
                data-tw-target="#profile"
                aria-controls="profile"
                aria-selected="true"
                role="tab"
              >
                <i className="w-4 h-4 mr-2" data-lucide="user" /> Profile
              </a>
            </li>
            <li id="account-tab" className="nav-item" role="presentation">
              <a
                href="#"
                className="nav-link py-4 flex items-center"
                data-tw-target="#account"
                aria-selected="false"
                role="tab"
              >
                <i className="w-4 h-4 mr-2" data-lucide="shield" /> Account
              </a>
            </li>
            <li
              id="change-password-tab"
              className="nav-item"
              role="presentation"
            >
              <a
                href="#"
                className="nav-link py-4 flex items-center"
                data-tw-target="#change-password"
                aria-selected="false"
                role="tab"
              >
                <i className="w-4 h-4 mr-2" data-lucide="lock" /> Change
                Password
              </a>
            </li>
            <li id="settings-tab" className="nav-item" role="presentation">
              <a
                href="#"
                className="nav-link py-4 flex items-center"
                data-tw-target="#settings"
                aria-selected="false"
                role="tab"
              >
                <i className="w-4 h-4 mr-2" data-lucide="settings" /> Settings
              </a>
            </li>
          </ul>
        </div>

        <div className="intro-y tab-content mt-5">
          <div
            id="dashboard"
            className="tab-pane active"
            role="tabpanel"
            aria-labelledby="dashboard-tab"
          ></div>
        </div>
        <div className="intro-y tab-content mt-5">
          <div
            id="dashboard"
            className="tab-pane active"
            role="tabpanel"
            aria-labelledby="dashboard-tab"
          >
            <div className="grid grid-cols-12 gap-6">
              {/* BEGIN: Top Categories */}
              <div className="intro-y box col-span-12 lg:col-span-6">
                <div className="flex items-center p-5 border-b border-slate-200/60 dark:border-darkmode-400">
                  <h2 className="font-medium text-base mr-auto">Top Works</h2>
                  <div className="dropdown ml-auto">
                    <a
                      className="dropdown-toggle w-5 h-5 block"
                      href="#"
                      aria-expanded="false"
                      data-tw-toggle="dropdown"
                    >
                      {" "}
                      <i
                        data-lucide="more-horizontal"
                        className="w-5 h-5 text-slate-500"
                      />{" "}
                    </a>
                    <div className="dropdown-menu w-40">
                      <ul className="dropdown-content">
                        <li>
                          <a href="" className="dropdown-item">
                            {" "}
                            <i
                              data-lucide="plus"
                              className="w-4 h-4 mr-2"
                            />{" "}
                            Add{" "}
                          </a>
                        </li>
                        <li>
                          <a href="" className="dropdown-item">
                            {" "}
                            <i
                              data-lucide="settings"
                              className="w-4 h-4 mr-2"
                            />{" "}
                            Settings{" "}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row">
                    <div className="mr-auto">
                      <a href="" className="font-medium">
                        Wordpress Template
                      </a>
                      <div className="text-slate-500 mt-1">ftth Agents</div>
                    </div>
                    <div className="flex">
                      <div className="w-32 -ml-2 sm:ml-0 mt-5 mr-auto sm:mr-5">
                        <div className="h-[30px]">
                          <canvas
                            className="simple-line-chart-1"
                            data-random="true"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">6.5k</div>
                        <div className="bg-success/20 text-success rounded px-2 mt-1.5">
                          +150
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row mt-5">
                    <div className="mr-auto">
                      <a href="" className="font-medium">
                        Bootstrap HTML Template
                      </a>
                      <div className="text-slate-500 mt-1">wallets, ftth</div>
                    </div>
                    <div className="flex">
                      <div className="w-32 -ml-2 sm:ml-0 mt-5 mr-auto sm:mr-5">
                        <div className="h-[30px]">
                          <canvas
                            className="simple-line-chart-1"
                            data-random="true"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">2.5k</div>
                        <div className="bg-pending/10 text-pending rounded px-2 mt-1.5">
                          +150
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row mt-5">
                    <div className="mr-auto">
                      <a href="" className="font-medium">
                        Tailwind HTML Templa
                      </a>
                      <div className="text-slate-500 mt-1">wallets, ftth</div>
                    </div>
                    <div className="flex">
                      <div className="w-32 -ml-2 sm:ml-0 mt-5 mr-auto sm:mr-5">
                        <div className="h-[30px]">
                          <canvas
                            className="simple-line-chart-1"
                            data-random="true"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">3.4k</div>
                        <div className="bg-primary/10 text-primary rounded px-2 mt-1.5">
                          +150
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* END: Top Categories */}
              {/* BEGIN: Work In Progress */}
              <div className="intro-y box col-span-12 lg:col-span-6">
                <div className="flex items-center px-5 py-5 sm:py-0 border-b border-slate-200/60 dark:border-darkmode-400">
                  <h2 className="font-medium text-base mr-auto">
                    Work In Progress
                  </h2>
                  <div className="dropdown ml-auto sm:hidden">
                    <a
                      className="dropdown-toggle w-5 h-5 block"
                      href="#"
                      aria-expanded="false"
                      data-tw-toggle="dropdown"
                    >
                      {" "}
                      <i
                        data-lucide="more-horizontal"
                        className="w-5 h-5 text-slate-500"
                      />{" "}
                    </a>
                    <div
                      className="nav nav-tabs dropdown-menu w-40"
                      role="tablist"
                    >
                      <ul className="dropdown-content">
                        <li>
                          {" "}
                          <a
                            id="work-in-progress-mobile-new-tab"
                            href="#"
                            data-tw-toggle="tab"
                            data-tw-target="#work-in-progress-new"
                            className="dropdown-item"
                            role="tab"
                            aria-controls="work-in-progress-new"
                            aria-selected="true"
                          >
                            New
                          </a>{" "}
                        </li>
                        <li>
                          {" "}
                          <a
                            id="work-in-progress-mobile-last-week-tab"
                            href="#"
                            data-tw-toggle="tab"
                            data-tw-target="#work-in-progress-last-week"
                            className="dropdown-item"
                            role="tab"
                            aria-selected="false"
                          >
                            Last Week
                          </a>{" "}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <ul
                    className="nav nav-link-tabs w-auto ml-auto hidden sm:flex"
                    role="tablist"
                  >
                    <li
                      id="work-in-progress-new-tab"
                      className="nav-item"
                      role="presentation"
                    >
                      {" "}
                      <a
                        href="#"
                        className="nav-link py-5 active"
                        data-tw-target="#work-in-progress-new"
                        aria-controls="work-in-progress-new"
                        aria-selected="true"
                        role="tab"
                      >
                        {" "}
                        New{" "}
                      </a>{" "}
                    </li>
                    <li
                      id="work-in-progress-last-week-tab"
                      className="nav-item"
                      role="presentation"
                    >
                      {" "}
                      <a
                        href="#"
                        className="nav-link py-5"
                        data-tw-target="#work-in-progress-last-week"
                        aria-selected="false"
                        role="tab"
                      >
                        {" "}
                        Last Week{" "}
                      </a>{" "}
                    </li>
                  </ul>
                </div>
                <div className="p-5">
                  <div className="tab-content">
                    <div
                      id="work-in-progress-new"
                      className="tab-pane active"
                      role="tabpanel"
                      aria-labelledby="work-in-progress-new-tab"
                    >
                      <div>
                        <div className="flex">
                          <div className="mr-auto">Pending Tasks</div>
                          <div>20%</div>
                        </div>
                        <div className="progress h-1 mt-2">
                          <div
                            className="progress-bar w-1/2 bg-primary"
                            role="progressbar"
                            aria-valuenow={0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="flex">
                          <div className="mr-auto">Completed Tasks</div>
                          <div>2 / 20</div>
                        </div>
                        <div className="progress h-1 mt-2">
                          <div
                            className="progress-bar w-1/4 bg-primary"
                            role="progressbar"
                            aria-valuenow={0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="flex">
                          <div className="mr-auto">Tasks In Progress</div>
                          <div>42</div>
                        </div>
                        <div className="progress h-1 mt-2">
                          <div
                            className="progress-bar w-3/4 bg-primary"
                            role="progressbar"
                            aria-valuenow={0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <a
                        href=""
                        className="btn btn-secondary block w-40 mx-auto mt-5"
                      >
                        View More Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* END: Work In Progress */}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-5 bg-red-500 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <FiLogOut className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
}
