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
const db_1 = require("../db/db");
const config_1 = require("../config");
const route = express_1.default.Router();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminAuth = (req, res, next) => {
    let { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
    if (authorization.startsWith("Bearer")) {
        authorization = authorization.split(" ")[1];
    }
    const decoded = jsonwebtoken_1.default.verify(authorization, config_1.ADMIN_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden!" });
        }
        return decoded;
    });
    req.body.admin = decoded;
    next();
};
const editCourse = (courseId, body) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findById(courseId);
    if (!course || Object.keys(course).length == 0) {
        return 0;
    }
    if (body.title != '' || body.title != undefined) {
        course.title = body.title;
    }
    if (body.description != '' || body.description != undefined) {
        course.description = body.description;
    }
    if (body.price != null || body.price != undefined) {
        course.price = body.price;
    }
    if (body.imageLink != '' || body.imageLink != undefined) {
        course.imageLink = body.imageLink;
    }
    if (body.published != null || body.published != undefined) {
        course.published = body.published;
    }
    yield course.save();
    return 1;
});
// Admin routes
route.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to sign up admin
    const { username, password } = req.body;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const admin = yield db_1.Admin.findOne({ username });
    if (admin) {
        return res.status(403).json({ message: "username exists :)" });
    }
    const createdCourses = [];
    const object = new db_1.Admin({ username, password, createdCourses });
    yield object.save();
    const token = jsonwebtoken_1.default.sign({ username, _id: object._id }, config_1.ADMIN_SECRET_KEY);
    return res.status(200).json({ message: 'Admin created successfully', token, admin: object });
}));
route.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to log in admin
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isAdmin = yield db_1.Admin.findOne({ username });
    if (!isAdmin || Object.keys(isAdmin).length == 0) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isAdmin.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jsonwebtoken_1.default.sign({ username, _id: isAdmin._id }, config_1.ADMIN_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token, admin: isAdmin });
}));
route.post('/courses', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to create a course
    try {
        const body = req.body;
        const admin = req.body.admin;
        const course = new db_1.Course(Object.assign(Object.assign({}, body), { creator: admin._id, subscribers: [] }));
        yield course.save();
        const updateAdmin = yield db_1.Admin.findById(admin._id);
        updateAdmin.createdCourses.push(course._id);
        yield updateAdmin.save();
        return res.status(200).json({ message: 'Course created successfully', courseId: course._id, course });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', err: error });
    }
}));
route.put('/courses/:courseId', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to edit a course
    const body = req.body;
    const { courseId } = req.params;
    const isUpdate = yield editCourse(courseId, body);
    if (!isUpdate) {
        return res.status(400).json({ message: "Invalid params" });
    }
    return res.status(200).json({ message: 'Course updated successfully' });
}));
route.get('/courses', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logic to get all courses
    const authAdmin = req.body.admin;
    const dbAdmin = yield db_1.Admin.findById(authAdmin._id).populate("createdCourses");
    return res.status(200).json({ courses: dbAdmin.createdCourses });
}));
route.delete("/courses/:courseId", adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    let course = yield db_1.Course.findById(courseId);
    if (!course || Object.keys(course).length == 0) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (course.published == true) {
        return res.status(400).json({ message: "Cannot Delete a published Course" });
    }
    const deletedCourse = yield db_1.Course.findByIdAndDelete(course);
    return res.status(200).json({ message: "Course Deleted Successfully :)" });
}));
exports.default = route;
