const express = require('express');
const app = express();
const port = 3008;
const zod = require('zod');
const jwt = require('jsonwebtoken');
const jwtpwd = "12345";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Users = [
    {
        username : 'aijaz@rafi',
        password : 'aijaz123',
        name : 'Aijaz',
    },
    {
        username : 'anas@khan',
        password : 'anas123',
        name : 'Anas',
    },
    {
        username : 'saurabh@gupta',
        password : 'asaurabh123',
        name : 'Saurabh'
    }
];

function userExists(Users, userData, pwdData) {
    for(let i = 0; i < Users.length; i++) {
        if(Users[i].username === userData && Users[i].password === pwdData) {
            return Users[i];
        }
        return false;
    }
}


app.post('/login', (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    let returnValue = (userExists(Users, username, password));
    if(!returnValue) {
        return res.status(401).json({ message: 'user does not exit' });
    }
    var token = jwt.sign({ username: returnValue.username }, jwtpwd);
    return res.json({
        token
    });  
});

app.get('/users', (req, res) => {
    const token = req.headers['authorization'];
    if(!token) {
        return res.status(403).json({ message: 'Token is missing' });
    }
    const decoded = jwt.verify(token, jwtpwd);
    const username = decoded.username;
    return res.json({message: 'User is valid', username, Users});
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

