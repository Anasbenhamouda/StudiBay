const helper = require('../helper.js');
const ProduktbildDao = require('../dao/produktbildDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Produktbild');

serviceRouter.get('/produktbild/gib/:id', function(request, response) {
    console.log('Service Produktbild: Client requested one record, id=' + request.params.id);

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var obj = produktbildDao.loadById(request.params.id);
        console.log('Service Produktbild: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Produktbild: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/produktbild/alle', function(request, response) {
    console.log('Service Produktbild: Client requested all records');

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var arr = produktbildDao.loadAll();
        console.log('Service Produktbild: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Produktbild: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/produktbild/existiert/:id', function(request, response) {
    console.log('Service Produktbild: Client requested check, if record exists, id=' + request.params.id);

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var exists = produktbildDao.exists(request.params.id);
        console.log('Service Produktbild: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Produktbild: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/produktbild', function(request, response) {
    console.log('Service Produktbild: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bildpfad)) 
        errorMsgs.push('bildpfad fehlt');
    if (helper.isUndefined(request.body.produkt)) {
        errorMsgs.push('produkt fehlt');
    } else if (helper.isUndefined(request.body.produkt.id)) {
        errorMsgs.push('produkt gesetzt, aber id fehlt');
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Produktbild: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var obj = produktbildDao.create(request.body.bildpfad, request.body.produkt.id);
        console.log('Service Produktbild: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Produktbild: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/produktbild', function(request, response) {
    console.log('Service Produktbild: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bildpfad)) 
        errorMsgs.push('bildpfad fehlt');
    if (helper.isUndefined(request.body.produkt)) {
        errorMsgs.push('produkt fehlt');
    } else if (helper.isUndefined(request.body.produkt.id)) {
        errorMsgs.push('produkt gesetzt, aber id fehlt');
    }

    if (errorMsgs.length > 0) {
        console.log('Service Produktbild: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var obj = produktbildDao.update(request.body.id, request.body.bildpfad, request.body.produkt.id);
        console.log('Service Produktbild: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Produktbild: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/produktbild/:id', function(request, response) {
    console.log('Service Produktbild: Client requested deletion of record, id=' + request.params.id);

    const produktbildDao = new ProduktbildDao(request.app.locals.dbConnection);
    try {
        var obj = produktbildDao.loadById(request.params.id);
        produktbildDao.delete(request.params.id);
        console.log('Service Produktbild: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Produktbild: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;