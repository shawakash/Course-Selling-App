const express = require('express');
const app = express();
const { connect } = require('./db/db');
const cors = require("cors");
const adminRoute = require("./routes/admin");
const userRoute = require("./routes/user");
app.use(express.json());
app.use(cors());



// Admin routes
app.use('/admin', adminRoute);
app.use('/users', userRoute);

connect();

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
