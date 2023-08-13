import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { loading, user } from "../recoil/atom";
import { baseUrl } from "./Register";
import axios from "axios";
import { toast } from "react-hot-toast";

export type AdminType = {
    username: string,
    password: string,
    _id: string
}

/// File is incomplete. You need to add input boxes to take input for users to login.
const Login: React.FC = () => {
    const setClient = useSetRecoilState(user);
    const setloader = useSetRecoilState(loading);
    const navigate = useNavigate();

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const token = sessionStorage.getItem("token")

    useEffect(() => {
        if(token) {
            toast.success("Clearing Client Data");
            sessionStorage.clear();
        }
    }, [token])

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setloader(true);
        axios({
            url: `${baseUrl}/admin/login`,
            method: "POST",
            headers: {
                username: usernameRef?.current?.value,
                password: passwordRef?.current?.value,
                "Content-type": "application/json"
            }
        }).then(response => {
            const admin: AdminType = response.data.admin;
            setClient(admin);
            if(usernameRef.current) {
                usernameRef.current.value = "";
            } if(passwordRef.current) {
                passwordRef.current.value = "";
            }
            sessionStorage.setItem("token", response.data.token)
            // setToken(response.data.token)
            toast.success(response.data.message);
            setloader(false);
            navigate("/")
            return;

        }).catch(err => {
            console.log(err)
            if(err) {
                if(err.response.status == 403) {
                    toast.error(err.response.data.message);
                }
                if(err.message == "Network Error" ) {
                    toast.error("Server is down :(");
                }
                setloader(false);
            }
        })
    }
    
    return (
        <>
        {/* <Toaster /> */}
            <div className="flex h-screen bg-gray-100 ">
                <div className="m-auto bg-white rounded-lg p-8 shadow-md w-[400px] hover:shadow-xl transition-all">
                    <h2 className="text-2xl font-semibold mb-4">Log In</h2>
                    <form
                        onSubmit={handleSubmit}
                    >
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                            <input
                                ref={usernameRef}
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Try to remember!  ☺️"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <input
                                ref={passwordRef}
                                type="password"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600"
                        >
                            Log In
                        </button>
                    </form>
                        <Link
                            to={"/register"}
                        >
                            <button
                                type="button"
                                className="w-full mt-5 bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600"
                            >
                                New Here ?
                            </button>
                        </Link>
                </div>
            </div>

        </>
    )
}

export default Login;