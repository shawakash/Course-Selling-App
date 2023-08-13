import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Landing from "./components/Landing";
import CreateCourse from './components/CreateCourse';
import Register from './components/Register';
import ShowCourses from './components/ShowCourses';
import NoMatch from './components/NoMatch';
import ProtectedRoute from './components/ProtectedRoute';
import RestrictedRoute from './components/RestrictedRoute';
import { Toaster } from 'react-hot-toast';
import Nav from './components/Nav';
import CoursePage from './components/CoursePage';
import React from 'react';
// This file shows how you can do routing in React.
// Try going to /login, /register, /about, /courses on the website and see how the html changes
// based on the route.
// You can also try going to /random and see what happens (a route that doesnt exist)
const App: React.FC = () => {
    
    return (<>
        <Toaster /> 
        <Router>
            <Nav />
            <Routes>
                <Route
                    element={<RestrictedRoute />}
                >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
                <Route
                    element={<ProtectedRoute />}
                >
                    <Route path="/" element={<Landing />} />
                    <Route path="/courses" element={<ShowCourses />} />
                    <Route path="/create" element={<CreateCourse />} />
                    <Route path='/courses/:slug' element={<CoursePage />} />
                </Route>
                <Route path="*" element={<NoMatch />} />
            </Routes>
        </Router>
    </>
    );
}

export default App;
