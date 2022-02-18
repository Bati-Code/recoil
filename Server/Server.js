const express = require('express');
const app = express();
const PORT = 9900;
const cors = require('cors');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

require('../server/router/main_router')(app);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});


