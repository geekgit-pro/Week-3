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

function validationMiddleware(schema, source = 'body') {
    return (req, res, next) => {
        const target = source === 'headers' ? { user: req.headers['user'], password: req.headers['password']} : req[source];
        const result = schema.safeParse(target);
        if(!result.success) {
            const errorMessages = result.error.issues.map((issue) => issue.message);
            const err = createError('Validation failed', 400);
            err.details = errorMessages;
            console.log('Validation Error || Logging Error:', errorMessages);
            return next(err);
        }
        req.validatedData = result.data;
        return next();
    }
}

function userAuth(req, res, next) {
    const username = req.validatedData.user;
    const password = req.validatedData.password;

    if(username != 'admin' || password != 'admin') {
        const err = createError('User not authorized', 401);
        return next(err);
    }
    return next();
}

function userSchema() {
  return zod.object({
    user: zod.string({ required_error: 'Username is missing' }).min(1),
    password: zod.string({ required_error: 'Password is missing' }).min(1)
  });
}


function kidneyShema() {
    const kidneySchema = zod.object( {
        noOfKidneys : zod.number('noOfKidneys is missing')
        .min(2, 'The noOfKidneys can not be less than 2')
        .max(2, 'The noOfKidneys can not be more than be 2'),
        phValue : zod.array(zod.number()
        .min(4, 'phValue should be between 4 and 8')
        .max(8, 'phValue should be between 4 and 8'))
        .length(2, 'phValue should have two values')
    });
    return kidneySchema;
}

function heartSchema() {
    const heartSchema = zod.object( {
        bpm : zod.number('bpm input is missing')
        .min(60, 'The bpm input should be between 60 and 100')
        .max(100, 'The bpm input should be between 60 and 100'),
        heartRate : zod.number('hearRate is missing')
        .min(30, 'The heartRate should be between 30 and 100')
        .max(100, 'The heartRate should be between 30 and 100')
    });
    return heartSchema;
}

app.use(validationMiddleware(userSchema(), 'headers'), userAuth);

app.post('/kidney', validationMiddleware(kidneyShema()), (req, res) => {
    const kidneyData = req.body;
    const noOfKidneys = kidneyData.noOfKidneys;
    const phValue = kidneyData.phValue;
    
    res.status(200).json( {
        message : `ph Vlaue for kidney 1 is ${phValue[0]} and for kidney 2 is ${phValue[1]}`,
        status : 'success'
    });
});

app.post('/heart', validationMiddleware(heartSchema()), (req, res) => {
    const { bpm, heartRate } = req.validatedData;
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
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});