"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const db_1 = require("./db/db");
const cors_1 = __importDefault(require("cors"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Admin routes
app.use('/admin', admin_1.default);
app.use('/users', user_1.default);
(0, db_1.connect)();
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
