import express from 'express'
const app = express();
import { connect } from './db/db';
import cors from 'cors'
import adminRoute from "./routes/admin";
import userRoute from "./routes/user";
app.use(express.json());
app.use(cors());



// Admin routes
app.use('/admin', adminRoute);
app.use('/users', userRoute);

connect();

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
