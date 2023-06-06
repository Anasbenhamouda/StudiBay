const helper = require('../helper.js');
const ReserviererDao = require('../dao/reserviererDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Reservierer');

serviceRouter.get('/reservierer/gib/:id', function(request, response) {
    console.log('Service Reservierer: Client requested one record, id=' + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var obj = reserviererDao.loadById(request.params.id);
        console.log('Service Reservierer: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Reservierer: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/reservierer/alle', function(request, response) {
    console.log('Service Reservierer: Client requested all records');

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var arr = reserviererDao.loadAll();
        console.log('Service Reservierer: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Reservierer: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/reservierer/existiert/:id', function(request, response) {
    console.log('Service Reservierer: Client requested check, if record exists, id=' + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var exists = reserviererDao.exists(request.params.id);
        console.log('Service Reservierer: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Reservierer: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/reservierer', function(request, response) {
    console.log('Service Reservierer: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push('vorname fehlt');
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push('nachname fehlt');
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('E-mail fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Reservierer: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var obj = reserviererDao.create(request.body.vorname, request.body.nachname, request.body.email);
        console.log('Service Reservierer: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Reservierer: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/reservierer', function(request, response) {
    console.log('Service Reservierer: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push('vorname fehlt');
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push('nachname fehlt');
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('E-mail fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Reservierer: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var obj = reserviererDao.update(request.body.id, request.body.vorname, request.body.nachname, request.body.email);
        console.log('Service Reservierer: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Reservierer: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/reservierer/:id', function(request, response) {
    console.log('Service Reservierer: Client requested deletion of record, id=' + request.params.id);

    const reserviererDao = new ReserviererDao(request.app.locals.dbConnection);
    try {
        var obj = reserviererDao.loadById(request.params.id);
        reserviererDao.delete(request.params.id);
        console.log('Service Reservierer: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Reservierer: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;