const express = require("express");
const route = express().Route();
const jwt = require("jsonwebtoken");
const { User, Course } = require("../db/db");
const USER_SECRET_KEY = "2018";

const userAuth = (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
    if (authorization.startsWith("Bearer")) {
        authorization = authorization.split(" ")[1];
    }
    const decoded = jwt.verify(authorization, USER_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden!" });
        }
        return decoded;
    });
    req.user = decoded;
    next();
}

// User routes
route.post('/signup', async (req, res) => {
    // logic to sign up user
    const { username, password } = req.body;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const user = await User.findOne({ username });
    if (user) {
        return res.status(403).json({ message: "username exists :)" });
    }
    const object = new User({ username, password });
    await object.save();
    const token = jwt.sign({ username, id: object.id }, USER_SECRET_KEY);
    return res.status(200).json({ message: 'User created successfully', token });
});

route.post('/login', async (req, res) => {
    // logic to log in user
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isUser = await User.findOne({ username });
    if (!isUser || isUser == {}) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isUser.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jwt.sign({ username, id: isUser.id }, USER_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token });
});

route.get('/courses', userAuth, async (req, res) => {
    // logic to list all courses
    const courses = await Course.find({ published: true });
    if (!courses || courses == {}) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({ courses });
});

route.post('/courses/:courseId', userAuth, async (req, res) => {
    // logic to purchase a course
    const { courseId } = req.params;
    const user = req.user;
    const userData = await User.findById(user.id);
    const course = await Course.findById(courseId);
    if (!course || course == {}) {
        return res.status(400).json({ message: "Invalid Params" });
    }
    // Check for Transcations
    userData.purchasedCourses.push(course);
    await userData.save();
    return res.status(200).json({ message: 'Course purchased successfully' });
});

route.get('/purchasedCourses', userAuth, async (req, res) => {
    // logic to view purchased courses
    const user = req.user;
    const data = await User.findById(user.id).populate('purchasedCourses');
    return res.status(200).json({ purchasedCourses: data.purchasedCourses });
});

module.exports = route;
