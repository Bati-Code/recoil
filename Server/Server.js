const express = require('express');
const app = express();
const PORT = 9900;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/css', express.static(path.join(__dirname, './views/css')));
app.use('/views', express.static(path.join(__dirname, './views/')));

require('./router/main_router')(app);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});


