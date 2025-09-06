const express = require('express');
const app = express();
const zod = require('zod');

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
    const kidneySchema = zod.object( {
        noOfKidneys : zod.number('noOfKidneys is missing')
        .min(2, 'The noOfKidneys can not be less than 2')
        .max(2, 'The noOfKidneys can not be more than be 2'),
        phValue : zod.array(zod.number()
        .min(4, 'phValue should be between 4 and 8')
        .max(8, 'phValue should be between 4 and 8'))
        .length(2, 'phValue should have two values')
    });

    const kidneyResult = kidneySchema.safeParse(req.body);
    console.log(kidneyResult);
    if(!kidneyResult.success) {
        const errorMessages = kidneyResult.error.issues.map((issue) => issue.message);
        const err = createError('Validation failed', 400);
        err.details = errorMessages;
        return next(err);
    }

    return next();
}

function heartInputValidation(req, res, next) {
    const heartSchema = zod.object( {
        bpm : zod.number('bpm input is missing').min(60, 'The bpm input should be between 60 and 100').max(100, 'The bpm input should be between 60 and 100'),
        heartRate : zod.number('hearRate is missing').min(30, 'The heartRate should be between 30 and 100').max(100, 'The heartRate should be between 30 and 100')
    });
    const heartResult = heartSchema.safeParse(req.body);
    console.log(heartResult);
    if(!heartResult.success) {
        const errorMessages = heartResult.error.issues.map((issue) => issue.message);
        const err = createError('Validaton failed', 400);
        err.details = errorMessages;
        return next(err);
    }
    req.validatedHeartData = heartResult.data;
    return next ();
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
    const { bpm, heartRate } = req.validatedHeartData;
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
        status : 'failed',
        details : err.details || []
    });
}
    
)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});