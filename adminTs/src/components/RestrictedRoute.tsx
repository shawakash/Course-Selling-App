import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const RestrictedRoute: React.FC = () => {
    return (
        <>
            {sessionStorage.getItem("token") ? <Navigate to={"/"} /> : <Outlet />}
        </>
    )
}

export default RestrictedRoute