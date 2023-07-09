const express = require('express');
const connectDB = require('./config/db');
var cors = require('cors');

const connectSocket = require('./realTimeChannel/employeeChannel');

const app = express();

//connect database
connectDB();
connectSocket(app);


//Init Middleware
app.use(express.json({ extended: false }));
//enable cors
app.use(cors());

app.get('/', (req, res) => res.send(`API running hk`));

// Define Routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/employee', require('./routes/api/employee'));



