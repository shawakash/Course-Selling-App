"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route = express_1.default.Router();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db/db");
const config_1 = require("../config");
const userAuth = (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
    if (authorization.startsWith("Bearer")) {
        authorization = authorization.split(" ")[1];
    }
    const decoded = jsonwebtoken_1.default.verify(authorization, config_1.USER_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden!" });
        }
        return decoded;
    });
    req.body.user = decoded;
    next();
};
// User routes
route.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to sign up user
    const { username, password } = req.body;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const user = yield db_1.User.findOne({ username });
    if (user) {
        return res.status(403).json({ message: "username exists :)" });
    }
    const object = new db_1.User({ username, password });
    yield object.save();
    const token = jsonwebtoken_1.default.sign({ username, _id: object._id }, config_1.USER_SECRET_KEY);
    return res.status(200).json({ message: 'User created successfully', token });
}));
route.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to log in user
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isUser = yield db_1.User.findOne({ username });
    if (!isUser || Object.keys(isUser).length == 0) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isUser.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jsonwebtoken_1.default.sign({ username, _id: isUser._id }, config_1.USER_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token, user: isUser });
}));
route.get('/courses', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to list all courses
    const courses = yield db_1.Course.find({ published: true });
    if (!courses || courses.length == 0) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({ courses });
}));
route.post('/courses/:courseId', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to purchase a course
    const { courseId } = req.params;
    const user = req.body.user;
    const userData = yield db_1.User.findById(user._id);
    const course = yield db_1.Course.findById(courseId);
    if (!course || Object.keys(course).length == 0) {
        return res.status(400).json({ message: "Invalid Params" });
    }
    course.subscribers.push(userData._id);
    // Check for Transcations
    userData.purchasedCourses.push(course._id);
    yield userData.save();
    yield course.save();
    return res.status(200).json({ message: 'Course purchased successfully' });
}));
route.get('/purchasedCourses', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to view purchased courses
    const user = req.body.user;
    const data = yield db_1.User.findById(user.id).populate('purchasedCourses');
    return res.status(200).json({ purchasedCourses: data.purchasedCourses });
}));
exports.default = route;
