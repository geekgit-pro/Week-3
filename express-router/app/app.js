const express = require('express');
const app = express();

app.use(express.json());

const userRouter = require('../router/user');

app.use('/', userRouter);

app.listen(3000, () => console.log('Listening :3000'));

