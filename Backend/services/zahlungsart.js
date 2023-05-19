const helper = require('../helper.js');
const ZahlungsartDao = require('../dao/zahlungsartDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Zahlungsart');

serviceRouter.get('/zahlungsart/gib/:id', function(request, response) {
    console.log('Service Zahlungsart: Client requested one record, id=' + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var obj = zahlungsartDao.loadById(request.params.id);
        console.log('Service Zahlungsart: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Zahlungsart: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/zahlungsart/alle', function(request, response) {
    console.log('Service Zahlungsart: Client requested all records');

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var arr = zahlungsartDao.loadAll();
        console.log('Service Zahlungsart: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Zahlungsart: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/zahlungsart/existiert/:id', function(request, response) {
    console.log('Service Zahlungsart: Client requested check, if record exists, id=' + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var exists = zahlungsartDao.exists(request.params.id);
        console.log('Service Zahlungsart: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Zahlungsart: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/zahlungsart', function(request, response) {
    console.log('Service Zahlungsart: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Zahlungsart: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var obj = zahlungsartDao.create(request.body.bezeichnung);
        console.log('Service Zahlungsart: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Zahlungsart: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/zahlungsart', function(request, response) {
    console.log('Service Zahlungsart: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Zahlungsart: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var obj = zahlungsartDao.update(request.body.id, request.body.bezeichnung);
        console.log('Service Zahlungsart: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Zahlungsart: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/zahlungsart/:id', function(request, response) {
    console.log('Service Zahlungsart: Client requested deletion of record, id=' + request.params.id);

    const zahlungsartDao = new ZahlungsartDao(request.app.locals.dbConnection);
    try {
        var obj = zahlungsartDao.loadById(request.params.id);
        zahlungsartDao.delete(request.params.id);
        console.log('Service Zahlungsart: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Zahlungsart: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;