import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute: React.FC = () => {

    return (<>
        {sessionStorage.getItem("token") ? <Outlet /> : <Navigate to={"/login"} /> }
    </>)

}

export default ProtectedRoute