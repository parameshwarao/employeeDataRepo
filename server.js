const express = require('express');
const connectDB = require('./config/db');
var cors = require('cors');

const app = express();

//connect database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));
//enable cors
app.use(cors());

app.get('/', (req, res) => res.send(`API running hk`));

// Define Routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/employee', require('./routes/api/employee'));
/*app.use('/api/profile', require('./routes/api/profile'));*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started at ${PORT}`));
