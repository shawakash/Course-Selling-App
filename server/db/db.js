const mongoose = require("mongoose");
const mongooseUri = `mongodb+srv://admin-akash:220104008@cluster0.kcycili.mongodb.net/courses`

const connect = () => {
    mongoose.connect(mongooseUri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" })

}

// Define mongoose schemas
const userSchema = new mongoose.Schema({
  username: {type: String},
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, {
  timestamps: true
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

// Define mongoose models
const User = mongoose.model('Course_User', userSchema);
const Admin = mongoose.model('Course_Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);


module.exports = {
    User,
    Admin,
    Course,
    connect
}