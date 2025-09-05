const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3007;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

function userValidation(req, res, next) {
    const username = req.headers['user'];
    const password = req.headers['password'];
    if(!username || !password) {
        return res.status(400).json( {
            message : 'User name or password is missing',
            status : 'failed'
        });
    }

    if(username != 'admin' || password != 'admin') {
        return res.status(401).json( {
            message : 'User not authorized',
            status : 'failed'
        });
    }
    return next();
}

app.use(userValidation);

app.post('/kidney', (req, res) => {
    const kidneyData = req.body;
    const noOfKidneys = kidneyData.noOfKidneys;
    const phValue = kidneyData.phValue;
    if(!noOfKidneys) {
        return res.status(400).send('No of kidneys data invalid');
    }

    if(noOfKidneys != 2)
        return res.status(400).send('No of kidneys should be 2');

    if(noOfKidneys == 2 && !phValue) {
        return res.status(400).send('Ph value is required when no of kidneys is 2');
    }

    if(noOfKidneys == 2 && (phValue.length != 2)) {
        return res.status(400).send('Ph value should be an array of length 2');
    }

    if(noOfKidneys == 2 && (phValue[0] < 4 || phValue[0] > 8 || phValue[1] < 4 || phValue[1] > 8)) {
        return res.status(400).send('Ph value should be between 4 and 8');
    }

    res.status(200).json( {
        message : `ph Vlaue for kidney 1 is ${phValue[0]} and for kidney 2 is ${phValue[1]}`,
        status : 'success'
    });
});

app.post('/heart', (req, res) => {
    const heartData = req.body;
    const bpm = heartData.bpm;
    const heartRate = heartData.heartRate;
    if(!bpm) {
        return res.status(400).send('BPM data invalid');
    }
    if(!heartRate) {
        return res.status(400).send('Heart Rate data invalid');
    }
    if(bpm > 60 && bpm < 100) {
        if(heartRate > 60 && heartRate < 100) {
            return res.status(200).json( {
                message : `BPM is ${bpm} and Heart Rate is ${heartRate}`,
                status : 'success'
            });
        }
        else
            return res.status(200).json( {
                message : `Heart Rate is ${heartRate} and not healthy`,
                status : 'success'
            });
    }
    return res.status(200).json( {
        message : `BPM is ${bpm} and not healthy`,
        status : 'success'
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});