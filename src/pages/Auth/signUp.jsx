import React, { useState } from 'react';
import axios from 'axios';
import illustrationImg from "../../assets/images/illustration.svg";

import "../../assets/css/app.css";
// import "../../assets/js/app.js";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    otp: ['', '', '', '', '', '']
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));

    // Auto focus next input
    if (value.length === 1 && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const requestOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://192.168.69.50:8069/jt_api/auth/otp_sign_up_request', {
        phone: formData.phone
      });

      if (response.data) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    // Combine OTP digits
    const otpCode = formData.otp.join('');

    try {
      const response = await axios.post('http://192.168.69.50:8069/jt_api/auth/otp_sign_up_confirm', {
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        otp: otpCode
      });

      if (response.data) {
        // Handle successful signup (e.g., redirect, show success message)
        // alert('Signup successful!');

      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const allFieldFilled = () => {
    return formData.phone && formData.email && formData.password;
  }
  const isOtpComplete = () => {
    return formData.otp.every((digit) => digit.length === 1)
  }
  return (
    <div className="login">
      <div className="container sm:px-10">
        <div className="block xl:grid grid-cols-2 gap-4">
          {/* Register Info Section - Original Component */}
          <div className="hidden xl:flex flex-col min-h-screen">
            <a href="/" className="-intro-x flex items-center pt-5">
              <img
                alt="Al-Jazeera Telecom Logo"
                className="w-6"
                src="https://www.jt.iq/images/logo.svg"
              />
              <span className="text-white text-lg ml-3">Al-Jazeera Telecom</span>
            </a>

            <div className="my-auto">
              <img
                alt="Illustration"
                className="-intro-x w-1/2 -mt-16"
                src={illustrationImg}
              />

              <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
                A few more clicks to
                <br />
                Create your account.
              </div>

              <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                Manage all your accounts in one place
              </div>
            </div>
          </div>

          {/* Register Form Section */}
          <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
            <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-center mb-4">
                  {error}
                </div>
              )}

              {/* Step 1: Registration Form */}
              {step === 1 && (
                <>
                  <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                    Sign Up
                  </h2>

                  <div className="intro-x mt-2 text-slate-400 dark:text-slate-400 xl:hidden text-center">
                    A few more clicks to sign in to your account
                  </div>

                  <div className="intro-x mt-8">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="intro-x login__input form-control py-3 px-4 block"
                      placeholder="Enter your phone"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="intro-x login__input form-control py-3 px-4 block mt-4"
                      placeholder="Enter your Email"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="intro-x login__input form-control py-3 px-4 block mt-4"
                      placeholder="Password"
                      required
                    />
                  </div>

                  <div className="intro-x flex items-center text-slate-600 dark:text-slate-500 mt-4 text-xs sm:text-sm">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="form-check-input border mr-2"
                    />
                    <label className="cursor-pointer select-none" htmlFor="remember-me">
                      I agree to the Envato
                    </label>
                    <a
                      href="/"
                      className="text-primary dark:text-slate-200 ml-1"
                    >
                      Privacy Policy
                    </a>
                    .
                  </div>

                  <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                    <button
                      onClick={requestOTP}
                      disabled={!allFieldFilled() || loading}
                      className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                    >
                      {loading ? 'Sending...' : 'Next'}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <>
                  <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">
                    Verify OTP
                  </h2>

                  <div className="intro-x mt-2 text-slate-400 dark:text-slate-400 text-left">
                    Enter the 6-digit code sent to {formData.phone}
                  </div>

                  <div className="intro-x mt-8 flex justify-center space-x-10">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-10 h-10 text-center border rounded"
                      />
                    ))}
                  </div>

                  <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                    <button
                      onClick={handleSignUp}
                      disabled={!isOtpComplete() || loading}
                      className={`btn py-3 px-4 w-full xl:w-32 xl:mr-3 align-top ${!isOtpComplete() || loading ? 'btn-disabled' : 'btn-primary'
                        }`}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0 align-top"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;