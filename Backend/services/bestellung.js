const helper = require('../helper.js');
const BestellungDao = require('../dao/bestellungDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Bestellung');

serviceRouter.get('/bestellung/gib/:id', function(request, response) {
    console.log('Service Bestellung: Client requested one record, id=' + request.params.id);

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var obj = bestellungDao.loadById(request.params.id);
        console.log('Service Bestellung: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bestellung: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bestellung/alle', function(request, response) {
    console.log('Service Bestellung: Client requested all records');

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var arr = bestellungDao.loadAll();
        console.log('Service Bestellung: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Bestellung: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bestellung/existiert/:id', function(request, response) {
    console.log('Service Bestellung: Client requested check, if record exists, id=' + request.params.id);

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var exists = bestellungDao.exists(request.params.id);
        console.log('Service Bestellung: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Bestellung: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/bestellung', function(request, response) {
    console.log('Service Bestellung: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bestellzeitpunkt)) {
        request.body.bestellzeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.bestellzeitpunkt)) {
        errorMsgs.push('bestellzeitpunkt hat das falsche Format, erlaubt: dd.mm.jjjj hh.mm.ss');
    } else {
        request.body.bestellzeitpunkt = helper.parseGermanDateTimeString(request.body.bestellzeitpunkt);
    }
    if (helper.isUndefined(request.body.besteller)) {
        request.body.besteller = null;
    } else if (helper.isUndefined(request.body.besteller.id)) {
        errorMsgs.push('besteller gesetzt, aber id fehlt');
    } else {
        request.body.besteller = request.body.besteller.id;
    }
    if (helper.isUndefined(request.body.zahlungsart)) {
        errorMsgs.push('zahlungsart fehlt');
    } else if (helper.isUndefined(request.body.zahlungsart.id)) {
        errorMsgs.push('zahlungsart gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.bestellpositionen)) {
        errorMsgs.push('bestellpositionen fehlen');
    } else if (!helper.isArray(request.body.bestellpositionen)) {
        errorMsgs.push('bestellpositionen ist kein array');
    } else if (request.body.bestellpositionen.length == 0) {
        errorMsgs.push('bestellpositionen is leer, nichts zu speichern');
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Bestellung: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var obj = bestellungDao.create(request.body.bestellzeitpunkt, request.body.besteller, request.body.zahlungsart.id, request.body.bestellpositionen);
        console.log('Service Bestellung: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bestellung: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.put('/bestellung', function(request, response) {
    console.log('Service Bestellung: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bestellzeitpunkt)) {
        request.body.bestellzeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.bestellzeitpunkt)) {
        errorMsgs.push('bestellzeitpunkt hat das falsche Format, erlaubt: dd.mm.jjjj hh.mm.ss');
    } else {
        request.body.bestellzeitpunkt = helper.parseGermanDateTimeString(request.body.bestellzeitpunkt);
    }
    if (helper.isUndefined(request.body.besteller)) {
        request.body.besteller = null;
    } else if (helper.isUndefined(request.body.besteller.id)) {
        errorMsgs.push('besteller gesetzt, aber id fehlt');
    } else {
        request.body.besteller = request.body.besteller.id;
    }
    if (helper.isUndefined(request.body.zahlungsart)) {
        errorMsgs.push('zahlungsart fehlt');
    } else if (helper.isUndefined(request.body.zahlungsart.id)) {
        errorMsgs.push('zahlungsart gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.bestellpositionen)) {
        errorMsgs.push('bestellpositionen fehlen');
    } else if (!helper.isArray(request.body.bestellpositionen)) {
        errorMsgs.push('bestellpositionen ist kein array');
    } else if (request.body.bestellpositionen.length == 0) {
        errorMsgs.push('bestellpositionen is leer, nichts zu speichern');
    }

    if (errorMsgs.length > 0) {
        console.log('Service Bestellung: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var obj = bestellungDao.update(request.body.id, request.body.bestellzeitpunkt, request.body.besteller, request.body.zahlungsart.id, request.body.bestellpositionen);
        console.log('Service Bestellung: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bestellung: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/bestellung/:id', function(request, response) {
    console.log('Service Bestellung: Client requested deletion of record, id=' + request.params.id);

    const bestellungDao = new BestellungDao(request.app.locals.dbConnection);
    try {
        var obj = bestellungDao.loadById(request.params.id);
        bestellungDao.delete(request.params.id);
        console.log('Service Bestellung: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Bestellung: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;