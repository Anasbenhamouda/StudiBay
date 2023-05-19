const helper = require('../helper.js');
const BenutzerrolleDao = require('../dao/benutzerrolleDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Benutzerrolle');

serviceRouter.get('/benutzerrolle/gib/:id', function(request, response) {
    console.log('Service Benutzerrolle: Client requested one record, id=' + request.params.id);

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerrolleDao.loadById(request.params.id);
        console.log('Service Benutzerrolle: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzerrolle: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzerrolle/alle', function(request, response) {
    console.log('Service Benutzerrolle: Client requested all records');

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var arr = benutzerrolleDao.loadAll();
        console.log('Service Benutzerrolle: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Benutzerrolle: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzerrolle/existiert/:id', function(request, response) {
    console.log('Service Benutzerrolle: Client requested check, if record exists, id=' + request.params.id);

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var exists = benutzerrolleDao.exists(request.params.id);
        console.log('Service Benutzerrolle: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Benutzerrolle: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/benutzerrolle', function(request, response) {
    console.log('Service Benutzerrolle: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Benutzerrolle: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerrolleDao.create(request.body.bezeichnung);
        console.log('Service Benutzerrolle: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzerrolle: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/benutzerrolle', function(request, response) {
    console.log('Service Benutzerrolle: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzerrolle: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerrolleDao.update(request.body.id, request.body.bezeichnung);
        console.log('Service Benutzerrolle: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzerrolle: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/benutzerrolle/:id', function(request, response) {
    console.log('Service Benutzerrolle: Client requested deletion of record, id=' + request.params.id);

    const benutzerrolleDao = new BenutzerrolleDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerrolleDao.loadById(request.params.id);
        benutzerrolleDao.delete(request.params.id);
        console.log('Service Benutzerrolle: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Benutzerrolle: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;