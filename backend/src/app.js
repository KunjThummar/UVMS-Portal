require('dotenv').config();

const express = require('express');
const cors = require('cors');
const startServer = require('./server');
const helmet = require('helmet');
const authRoutes = require('./auth/auth.routes');
const instituteRoutes = require('./institutes/institute.routes');
const departmentRouter = require('./departments/department.routes');
const applicationRoutes = require("./applications/application.routes");
const studentRoutes = require("./students/student.routes");
const facultyRoutes = require("./events/faculty.routes");
const adminRoutes = require("./events/admin.routes");

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'UVMS backend is running' });
});

// Health Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

app.use('/api/auth', authRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/departments', departmentRouter);
app.use('/api/faculty', facultyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

startServer(app);

module.exports = { app };
