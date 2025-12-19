import express from 'express';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import { Circuit, Constructor, Driver } from './logic/database/database-repository.js';
import { CustomError } from './logic/exceptions/errorhandling.js';

const PORT = 3000;
const ADMIN_USERS = {max: 'vers-tappen'};

const SERVER_ERROR_CODE = 500;
const SUCCESSFULL_UPDATE_CODE = 201;
const SUCCESSFULL_DELETION_CODE = 204;


const app = express();
app.use("/", express.static('public'));
app.use(cors());
app.use(express.json());

// Circuit Endpoints
app.get('/circuits', (req, res, next) => {
    Circuit.getAllCircuits()
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/circuits/:id', (req, res, next) => {
    const id = (req.params.id);
    Circuit.getCircuitFromId(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.post('/circuits', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    Circuit.create(req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.put('/circuits/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Circuit.update(id, req.body)
        .then(() => res.send())
        .catch(err => next(err));
});

app.delete('/circuits/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Circuit.remove(id)
        .then(() => res.send())
        .catch(err => next(err));
});
// End of Circuit Endpoints

// Constructor Endpoints
app.get('/constructors', (req, res, next) => {
    Constructor.getAllConstructors()
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/constructors/:id', (req, res, next) => {
    const id = (req.params.id);
    Constructor.getConstructorFromId(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.post('/constructors', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    Constructor.create(req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.put('/constructors/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Constructor.update(id, req.body)
        .then(() => res.send())
        .catch(err => next(err));
});

app.delete('/constructors/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Constructor.remove(id)
        .then(() => res.send())
        .catch(err => next(err));
});
// End of Constructor Endpoints

// Driver Endpoints

app.get('/drivers', (req, res, next) => {
    Driver.getAllDrivers()
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id', (req, res, next) => {
    const id = (req.params.id);
    Driver.getDriverFromId(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.post('/drivers', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    Driver.create(req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.put('/drivers/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Driver.update(id, req.body)
        .then(() => res.send())
        .catch(err => next(err));
});

app.delete('/drivers/:id', basicAuth({users: ADMIN_USERS}), (req, res, next) => {
    const id = (req.params.id);
    Driver.remove(id)
        .then(() => res.send())
        .catch(err => next(err));
});
// End of Driver Endpoints

// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof CustomError)
        res.status(err.statusCode).send(err.message);
    else {
        console.error(err);
        res.status(SERVER_ERROR_CODE).send("Server error");
    }
});

app.listen(PORT, () =>
    console.log(`MovieDB listening on ${PORT}`)
);