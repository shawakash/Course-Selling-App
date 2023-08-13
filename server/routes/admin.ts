import express, { NextFunction, Request, Response } from 'express'
import { Admin, AdminRequest, Course, CourseRequest } from "../db/db";
import { ADMIN_SECRET_KEY } from '../config';
const route = express.Router();
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    let { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: "Unauthorized!" });
    }
    if (authorization.startsWith("Bearer")) {
        authorization = authorization.split(" ")[1];
    }
    const decoded = jwt.verify(authorization, ADMIN_SECRET_KEY, (err: VerifyErrors, decoded: JwtPayload) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden!" });
        }
        return decoded;
    });
    req.body.admin = decoded;
    next();
}

const editCourse = async (courseId: string, body: CourseRequest) => {
    const course = await Course.findById(courseId);
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
    await course.save();
    return 1;

}

// Admin routes
route.post('/signup', async (req: Request, res: Response) => {
    // logic to sign up admin
    const { username, password }: AdminRequest = req.body;
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
    const token = jwt.sign({ username, _id: object._id }, ADMIN_SECRET_KEY);
    return res.status(200).json({ message: 'Admin created successfully', token , admin: object});
});

route.post('/login', async (req: Request, res: Response) => {
    // logic to log in admin
    const { username, password } = req.headers;
    if (!username || username == '' || !password || password == "") {
        return res.status(400).json({ message: "Bad request :(" });
    }
    const isAdmin = await Admin.findOne({ username });
    if (!isAdmin || Object.keys(isAdmin).length == 0) {
        return res.status(404).json({ message: "No such user" });
    }
    if (isAdmin.password !== password) {
        return res.status(400).json({ message: "Password Error :(" });
    }
    const token = jwt.sign({ username, _id: isAdmin._id }, ADMIN_SECRET_KEY);
    return res.status(200).json({ message: "Logged in successfully", token , admin: isAdmin});
});

route.post('/courses', adminAuth, async (req: Request, res: Response) => {
    // logic to create a course
    try {
        const body: CourseRequest = req.body;
        const admin = req.body.admin;
        const course = new Course({ ...body, creator: admin._id, subscribers: [] });
        await course.save();
        const updateAdmin = await Admin.findById(admin._id);
        updateAdmin.createdCourses.push(course._id);
        await updateAdmin.save();
        return res.status(200).json({ message: 'Course created successfully', courseId: course._id, course});
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', err: error });
    }
});

route.put('/courses/:courseId', adminAuth, async (req: Request, res: Response) => {
    // logic to edit a course
    const body: CourseRequest = req.body;
    const { courseId } = req.params;
    const isUpdate = await editCourse(courseId, body);
    if (!isUpdate) {
        return res.status(400).json({ message: "Invalid params" });
    }
    return res.status(200).json({ message: 'Course updated successfully' });
});

route.get('/courses', adminAuth, async (req: Request, res: Response) => {
    // logic to get all courses
    const authAdmin = req.body.admin;
    const dbAdmin = await Admin.findById(authAdmin._id).populate("createdCourses");
    return res.status(200).json({ courses: dbAdmin.createdCourses })
});

route.delete("/courses/:courseId", adminAuth, async (req: Request, res: Response) => {
    const {courseId} = req.params;
    let course = await Course.findById(courseId);
    if (!course || Object.keys(course).length == 0) {
        return res.status(404).json({ message: "Course not found" });
    }
    if(course.published == true) {
        return res.status(400).json({message: "Cannot Delete a published Course"})
    }
    const deletedCourse = await Course.findByIdAndDelete(course);
    return res.status(200).json({message: "Course Deleted Successfully :)"})
})

export default route;