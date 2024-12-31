import React, { useEffect, useState } from 'react';
import "../assets/css/app.css";
// import "../assets/js/app.js";

import { CgProfile } from 'react-icons/cg';
import { RiLockPasswordFill } from 'react-icons/ri';
import { IoIosLogOut } from 'react-icons/io';

const TopBar = () => {
  const [profile, setProfile] = useState({ name: '', image: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authorization token is missing. Please log in again.');
        return;
      }

      const myHeaders = new Headers();
      myHeaders.append("Authorization", token);

      try {
        const response = await fetch("http://192.168.69.50:8069/jt_api/auth/profile", {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error('Error fetching profile data.');
        }

        const data = await response.json();
        setProfile({
          name: data.data.name,
          image: data.data.profile_image,
        });
      } catch (err) {
        console.error('Error fetching profile data:', err.message);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="top-bar">
      <nav aria-label="breadcrumb" className="-intro-x mr-auto hidden sm:flex">
        <ul className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="#" >Application</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Dashboard
          </li>
        </ul>
      </nav>

      <div className="intro-x dropdown w-8 h-8">
        <div
          className="dropdown-toggle w-8 h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in"
          role="button"
          aria-expanded="false"
          data-tw-toggle="dropdown"
        >
          <img alt={profile.name} src={profile.image || "../assets/images/default-profile.png"} />
          <div>{profile.name}</div>
        </div>
        <div className="dropdown-menu w-56">
          <ul className="dropdown-content bg-primary text-white">
            <li className="p-2">
              <div className="font-medium">{profile.name || 'User'}</div>
              <div className="text-xs text-white/70 mt-0.5 dark:text-slate-500">
                User Role
              </div>
            </li>
            <li>
              <hr className="dropdown-divider border-white/[0.08]" />
            </li>
            <li>
              <a href="" className="dropdown-item hover:bg-white/5">
                <CgProfile className="w-4 h-4 mr-2" /> Profile
              </a>
            </li>
            <li>
              <a href="" className="dropdown-item hover:bg-white/5">
                <RiLockPasswordFill className="w-4 h-4 mr-2" /> Reset Password
              </a>
            </li>
            <li>
              <hr className="dropdown-divider border-white/[0.08]" />
            </li>
            <li>
              <a href="" className="dropdown-item hover:bg-white/5">
                <IoIosLogOut className="w-4 h-4 mr-2 " /> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
