const express = require("express");
const { Admin, Course } = require("../db/db");
const route = express().Router();
const ADMIN_SECRET_KEY = "2003";
const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
    if (authorization.startsWith("Bearer")) {
        authorization = authorization.split(" ")[1];
    }
    const decoded = jwt.verify(authorization, ADMIN_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden!" });
        }
        return decoded;
    });
    req.admin = decoded;
    next();
}

const editCourse = async (courseId, body) => {
    const course = await Course.findById(courseId);
    if (!course || course == {}) {
        return 0;
    }
    if (body.title != '' || body.title != undefined) {
        course.title = body.title;
    }
    if (body.description != '' || body.description != undefined) {
        course.description = body.description;
    }
    if (body.price != '' || body.price != undefined) {
        course.price = body.price;
    }
    if (body.imageLink != '' || body.imageLink != undefined) {
        course.imageLink = body.imageLink;
    }
    if (body.published != '' || body.published != undefined) {
        course.published = body.published;
    }
    await course.save();
    return 1;

}

// Admin routes
route.post('/signup', async (req, res) => {
    // logic to sign up admin
    const { username, password } = req.body;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const admin = await Admin.findOne({ username });
    if (admin) {
        return res.status(403).json({ message: "username exists :)" });
    }
    const createdCourses = [];
    const object = new Admin({ username, password, createdCourses });
    await object.save();
    const token = jwt.sign({ username, id: object.id }, ADMIN_SECRET_KEY);
    return res.status(200).json({ message: 'Admin created successfully', token });
});

route.post('/login', async (req, res) => {
    // logic to log in admin
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isAdmin = await Admin.findOne({ username });
    if (!isAdmin || isAdmin == {}) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isAdmin.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jwt.sign({ username, id: isAdmin.id }, ADMIN_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token });
});

route.post('/courses', adminAuth, async (req, res) => {
    // logic to create a course
    try {
        const body = req.body;
        const admin = req.admin;
        const course = new Course({ ...body, creator: admin.id, subscribers: []  });
        await course.save();
        const updateAdmin = await Admin.findById(admin.id);
        updateAdmin.createdCourses.push(course.id);
        await updateAdmin.save();
        return res.status(200).json({ message: 'Course created successfully', courseId: course.id });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', err: error });
    }
});

route.put('/courses/:courseId', adminAuth, async (req, res) => {
    // logic to edit a course
    const body = req.body;
    const { courseId } = req.params;
    const isUpdate = await editCourse(courseId, body);
    if (!isUpdate) {
        return res.status(400).json({ message: "Invalid params" });
    }
    return res.status(200).json({ message: 'Course updated successfully' });
});

route.get('/courses', adminAuth, async (req, res) => {
    // logic to get all courses
    const authAdmin = req.admin;
    const dbAdmin = await Admin.findById(authAdmin.id).populate("createdCourses").populate("subscribers");
    return res.status(200).json({ courses: dbAdmin.createdCourses })
});

module.exports = route;