import express, { NextFunction, Request, Response } from 'express';
const route = express.Router();
import jwt from 'jsonwebtoken';
import { User, Course, UserRequest } from "../db/db";
import { USER_SECRET_KEY } from '../config';

const userAuth = (req: Request, res: Response, next: NextFunction) => {
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
        if(!decoded || typeof decoded == "string") {
            return res.status(403).json({ message: "Forbidden!" });
        }
        req.headers["userId"] = decoded._id;
        next();
    });
}

// User routes
route.post('/signup', async (req: Request, res: Response) => {
    // logic to sign up user
    const { username, password }: UserRequest = req.body;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const user = await User.findOne({ username });
    if (user) {
        return res.status(403).json({ message: "username exists :)" });
    }
    const object = new User({ username, password });
    await object.save();
    const token = jwt.sign({ _id: object._id }, USER_SECRET_KEY);
    return res.status(200).json({ message: 'User created successfully', token });
});

route.post('/login', async (req: Request, res: Response) => {
    // logic to log in user
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isUser = await User.findOne({ username });
    if (!isUser || Object.keys(isUser).length == 0) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isUser.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jwt.sign({ _id: isUser._id }, USER_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token, user: isUser });
});

route.get('/courses', userAuth, async (req: Request, res: Response) => {
    // logic to list all courses
    const courses = await Course.find({ published: true });
    if (!courses || courses.length == 0) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({ courses });
});

route.post('/courses/:courseId', userAuth, async (req: Request, res: Response) => {
    // logic to purchase a course
    const { courseId } = req.params;
     
    const {userId} = req.headers;
    const userData = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (!course || Object.keys(course).length == 0) {
        return res.status(400).json({ message: "Invalid Params" });
    }
    if(userData) {
        course.subscribers.push(userData._id);
        // Check for Transcations
        userData.purchasedCourses.push(course._id);
        await userData.save();
        await course.save();
        return res.status(200).json({ message: 'Course purchased successfully' });
    } else {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

route.get('/purchasedCourses', userAuth, async (req: Request, res: Response) => {
    // logic to view purchased courses
    const {userId} = req.headers;
    const data = await User.findById(userId).populate('purchasedCourses');
    return res.status(200).json({ purchasedCourses: data?.purchasedCourses });
});

export default route;
