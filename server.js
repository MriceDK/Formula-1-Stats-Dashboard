import express from 'express';
import cors from 'cors';
import { Circuit, Constructor, Driver, Race, Result } from './logic/database/database-repository.js';
import { CustomError } from './logic/exceptions/errorhandling.js';

const PORT = 3000;
const ADMIN_USERS = {max: 'vers-tappen'};

const SERVER_ERROR_CODE = 500;
const SUCCESSFULL_CREATE_CODE = 201;
const SUCCESSFULL_UPDATE_CODE = 201;
const SUCCESSFULL_DELETE_CODE = 204;


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

app.post('/circuits', (req, res, next) => {
    Circuit.create(req.body)
        .then(() => res.status(SUCCESSFULL_CREATE_CODE).send())
        .catch(err => next(err));
});

app.put('/circuits/:id', (req, res, next) => {
    const id = (req.params.id);
    Circuit.update(id, req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.delete('/circuits/:id', (req, res, next) => {
    const id = (req.params.id);
    Circuit.remove(id)
        .then(() => res.status(SUCCESSFULL_DELETE_CODE).send())
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

app.post('/constructors', (req, res, next) => {
    Constructor.create(req.body)
        .then(() => res.status(SUCCESSFULL_CREATE_CODE).send())
        .catch(err => next(err));
});

app.put('/constructors/:id', (req, res, next) => {
    const id = (req.params.id);
    Constructor.update(id, req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.delete('/constructors/:id', (req, res, next) => {
    const id = (req.params.id);
    Constructor.remove(id)
        .then(() => res.status(SUCCESSFULL_DELETE_CODE).send())
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

app.post('/drivers', (req, res, next) => {
    Driver.create(req.body)
        .then(() => res.status(SUCCESSFULL_CREATE_CODE).send())
        .catch(err => next(err));
});

app.put('/drivers/:id', (req, res, next) => {
    const id = (req.params.id);
    Driver.update(id, req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.delete('/drivers/:id', (req, res, next) => {
    const id = (req.params.id);
    Driver.remove(id)
        .then(() => res.status(SUCCESSFULL_DELETE_CODE).send())
        .catch(err => next(err));
});

app.get('/drivers/:id/wins', (req, res, next) => {
    const id = (req.params.id);
    Driver.getTotalWinsById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/qualifying', (req, res, next) => {
    const id = (req.params.id);
    Driver.getQualifyingStatsById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/overtaking', (req, res, next) => {
    const id = (req.params.id);
    Driver.getOverTakingAbilityById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/teammates', (req, res, next) => {
    const id = (req.params.id);
    Driver.getDriverVsTeammateById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/positions', (req, res, next) => {
    const id = (req.params.id);
    Driver.getAllPositionsById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/points', (req, res, next) => {
    const id = (req.params.id);
    Driver.getDriverPointsPerSeasonById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/drivers/:id/retirements', (req, res, next) => {
    const id = (req.params.id);
    Driver.getDriverRetirementsById(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

// End of Driver Endpoints

// Race Endpoints
app.get('/races', (req, res, next) => {
    Race.getAllRaces()
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/races/:id', (req, res, next) => {
    const id = (req.params.id);
    Race.getRaceFromId(id)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.post('/races', (req, res, next) => {
    Race.create(req.body)
        .then(() => res.status(SUCCESSFULL_CREATE_CODE).send())
        .catch(err => next(err));
});

app.put('/races/:id', (req, res, next) => {
    const id = (req.params.id);
    Race.update(id, req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.delete('/races/:id', (req, res, next) => {
    const id = (req.params.id);
    Race.remove(id)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});
// End of Race Endpoints

// Result Endpoints
app.get('/results', (req, res, next) => {
    Result.getAllResults()
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.get('/:raceId/results/:driverId', (req, res, next) => {
    const raceId = (req.params.raceId);
    const driverId = (req.params.driverId);
    Result.getResultFromId(raceId, driverId)
        .then(results => res.json(results))
        .catch(err => next(err));
});

app.post('/results',  (req, res, next) => {
    Result.create(req.body)
        .then(() => res.status(SUCCESSFULL_CREATE_CODE).send())
        .catch(err => next(err));
});

app.put('/:raceId/results/:driverId',  (req, res, next) => {
    const raceId = (req.params.raceId);
    const driverId = (req.params.driverId);
    Result.update(raceId, driverId, req.body)
        .then(() => res.status(SUCCESSFULL_UPDATE_CODE).send())
        .catch(err => next(err));
});

app.delete('/:raceId/results/:driverId',  (req, res, next) => {
    const raceId = (req.params.raceId);
    const driverId = (req.params.driverId);
    Result.remove(raceId, driverId)
        .then(() => res.status(SUCCESSFULL_DELETE_CODE).send())
        .catch(err => next(err));
});
// End of Result Endpoints

// Global Error Handler
app.use((err, req, res) => {
    if (err instanceof CustomError)
        res.status(err.statusCode).send(err.message);
    else {
        console.error(err);
        res.status(SERVER_ERROR_CODE).send("Server error");
    }
});

app.listen(PORT, () =>
    console.log(`Formula-1-DB listening on ${PORT}`)
);