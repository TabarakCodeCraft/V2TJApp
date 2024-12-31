import React, { useState } from "react";
import "../../assets/css/app.css";
// import "../../assets/js/app.js";
import logo from "../../assets/images/logo.svg";
import img2 from "../../assets/images/illustration.svg";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const Navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://192.168.69.50:8069/jt_api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    auth_token: "ntR5D6xqBWLHfMY4GjKQJCAace9VZ7NXyr8mPspU"
                }),
            });
            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                console.log("Login successful:", data);
                Navigate("/");
            }
            else {
                // Handle login failure
                const errorMessage = data.message || "Login failed. Please check your credentials.";
                setError(errorMessage);
                console.error("Login failed:", errorMessage);
            }
        } catch (error) {
            console.error("Error during login:", error);
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login">
            <div className="container sm:px-10">
                <div className="block xl:grid grid-cols-2 gap-4">
                    {/* Login Info */}
                    <div className="hidden xl:flex flex-col min-h-screen">
                        <a href="/" className="-intro-x flex items-center pt-5">
                            <img alt="Logo" className="w-6" src={"https://www.jt.iq/images/logo.svg"} />
                            <span className="text-white text-lg ml-3">Al-Jazeera Telecom</span>
                        </a>
                        <div className="my-auto">
                            <img alt="Illustration" className="-intro-x w-1/2 -mt-16" src={img2} />
                            <div className="-intro-x text-white font-medium text-4xl leading-tight mt-10">
                                A few more clicks to
                                <br />
                                sign in to your account.
                            </div>
                            <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                                Manage all your accounts in one place
                            </div>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
                        <div className="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto">
                            <h2 className="intro-x font-bold text-2xl xl:text-3xl text-center xl:text-left">Log In</h2>
                            <div className="intro-x mt-2 text-slate-400 xl:hidden text-center">
                                A few more clicks to sign in to your account. Manage all your dashboard accounts in one place.
                            </div>

                            {error && (
                                <div className="intro-x mt-4 text-center text-red-500">
                                    {error}
                                </div>
                            )}
                            <form className="intro-x mt-8" onSubmit={handleLogin}>
                                <input
                                    type="email"
                                    className="intro-x login__input form-control py-3 px-4 block"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    className="intro-x login__input form-control py-3 px-4 block mt-4"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <div className="intro-x mt-5 xl:mt-8 text-center xl:text-left">
                                    <button
                                        type="submit"
                                        className="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
                                        disabled={loading}
                                    >
                                        {loading ? "Logging in..." : "Login"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary py-3 px-4 w-full xl:w-32 mt-3 xl:mt-0 align-top"
                                        onClick={() => (window.location.href = "/auth/signup")}
                                    >
                                        Sing Up
                                    </button>
                                </div>
                            </form>
                            <div className="intro-x mt-10 xl:mt-24 text-slate-600 dark:text-slate-500 text-center xl:text-left">
                                If you do not have an account, click on {" "}
                                <a className="text-base text-blue-500" href="/auth/signup">
                                    Sign Up
                                </a>{" "}
                                Button
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
