const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3007;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

function createError (message, status) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function userValidation(req, res, next) {
    const username = req.headers['user'];
    const password = req.headers['password'];
    if(!username || !password) {
        const err = createError('Username or password is missing', 400);
        return next(err);
    }

    if(username != 'admin' || password != 'admin') {
        const err = createError('User not authorized', 401);
        return next(err);
    }
    return next();
}

function kidneyInputValidation(req, res, next) {
    const kidneyData = req.body;
    const noOfKidneys = kidneyData.noOfKidneys;
    const phValue = kidneyData.phValue;

    if(!noOfKidneys) {
        const err = new Error('No of kidneys is missing');
        err.status = 400;
        console.log(err.status+"  "+err.message);
        return next(err);
    }
    if(noOfKidneys != 2){
        const err = new Error('No of kidneys should be 2');
        err.status = 400;
        console.log(err.status+"  "+err.message);
        return next(err);
    }
        
    if(!phValue) {
        const err = new Error('phValue is missing');
        err.status = 400;
        console.log(err.status+"  "+err.message);
        return next(err);
    }
    if(phValue.length != 2) {
        const err = new Error('phValue is missing some information');
        err.status = 400;
        console.log(err.status+"  "+err.message);
        return next(err);
    }
    if(noOfKidneys == 2 && (phValue[0] < 4 || phValue[0] > 8 || phValue[1] < 4 || phValue[1] > 8)) {
        const err = new Error('phValue should be between 4 and 8');
        err.status = 400;
        console.log(err.status+"  "+err.message);
        return next(err);
    }
    return next();
}

function heartInputValidation(req, res, next) {
    const heartData = req.body;
    const bpm = heartData.bpm;
    const heartRate = heartData.heartRate;
    if(!bpm) {
        const err = createError('bpm input is missing', 400);
        console.log(err.message+" "+" "+err.status)
        return next(err);
    }
    if(!heartRate) {
        const err = createError('heartRate input is missing', 400);
        console.log(err.message+" "+" "+err.status)
        return next(err);
    }
    if(bpm < 60 || bpm > 100) {
        const err = createError('bpm input should be between range 60 and 100', 400);
        console.log(err.message+" "+" "+err.status)
        return next(err);
    }
    if(heartRate < 30 || heartRate > 100) {
        const err = createError('heartRate input should be between range 60 and 100', 400);
        console.log(err.message+" "+" "+err.status)
        return next(err);
    }

    return next();
}


app.use(userValidation);

app.post('/kidney', kidneyInputValidation, (req, res) => {
    const kidneyData = req.body;
    const noOfKidneys = kidneyData.noOfKidneys;
    const phValue = kidneyData.phValue;
    
    res.status(200).json( {
        message : `ph Vlaue for kidney 1 is ${phValue[0]} and for kidney 2 is ${phValue[1]}`,
        status : 'success'
    });
});

app.post('/heart', heartInputValidation, (req, res) => {
    const heartData = req.body;
    const bpm = heartData.bpm;
    const heartRate = heartData.heartRate;

    if(bpm > 60 && bpm < 80) {
        if(heartRate > 60 && heartRate < 80) {
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


app.use((err, req, res, next) => {
    res.status(err.status || 500).json( {
        message : err.message || 'Internal Server Error',
        status : 'failed'
    });
}
    
)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});