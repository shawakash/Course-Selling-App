"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.Course = exports.Admin = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const connect = () => {
    mongoose_1.default.connect(config_1.mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });
};
exports.connect = connect;
// Define mongoose schemas
const userSchema = new mongoose_1.default.Schema({
    username: { type: String },
    password: String,
    purchasedCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course' }]
}, {
    timestamps: true
});
const adminSchema = new mongoose_1.default.Schema({
    username: String,
    password: String,
    createdCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course' }],
}, {
    timestamps: true
});
const courseSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    price: Number,
    imageLink: String,
    published: Boolean,
    creator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Admin' },
    subscribers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
// Define mongoose models
const User = mongoose_1.default.model('Course_User', userSchema);
exports.User = User;
const Admin = mongoose_1.default.model('Course_Admin', adminSchema);
exports.Admin = Admin;
const Course = mongoose_1.default.model('Course', courseSchema);
exports.Course = Course;
