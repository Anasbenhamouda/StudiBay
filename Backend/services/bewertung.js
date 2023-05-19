const helper = require('../helper.js');
const BewertungDao = require('../dao/bewertungDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Bewertung');

serviceRouter.get('/bewertung/gib/:id', function(request, response) {
    console.log('Service Bewertung: Client requested one record, id=' + request.params.id);

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var obj = bewertungDao.loadById(request.params.id);
        console.log('Service Bewertung: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bewertung: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bewertung/alle', function(request, response) {
    console.log('Service Bewertung: Client requested all records');

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var arr = bewertungDao.loadAll();
        console.log('Service Bewertung: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Bewertung: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bewertung/gericht/:id', function(request, response) {
    console.log('Service Bewertung: Client requested all records for parent, id=' + request.params.id);

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var arr = bewertungDao.loadAllByParent(request.params.id);
        console.log('Service Bewertung: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Bewertung: Error loading all records for parent by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bewertung/existiert/:id', function(request, response) {
    console.log('Service Bewertung: Client requested check, if record exists, id=' + request.params.id);

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var exists = bewertungDao.exists(request.params.id);
        console.log('Service Bewertung: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Bewertung: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/bewertung', function(request, response) {
    console.log('Service Bewertung: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.gericht)) {
        errorMsgs.push('gericht fehlt');
    } else if (helper.isUndefined(request.body.gericht.id)) {
        errorMsgs.push('gericht gesetzt, aber id fehlt');
    }        
    if (helper.isUndefined(request.body.punkte)) {
        errorMsgs.push('punkte fehlen');
    } else if (!helper.isNumeric(request.body.punkte)) {
        errorMsgs.push('punkte müssen eine zahl sein');
    } else if (request.body.punkte <= 0) {
        errorMsgs.push('punkte müssen eine zahl > 0 sein');
    }
    if (helper.isUndefined(request.body.zeitpunkt)) {
        request.body.zeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt hat das falsche Format, erlaubt: dd.mm.jjjj hh:mm:ss');
    } else {
        request.body.zeitpunkt = helper.parseGermanDateTimeString(request.body.zeitpunkt);
    }
    if (helper.isUndefined(request.body.bemerkung)) 
        request.body.bemerkung = null;
    if (helper.isUndefined(request.body.ersteller)) 
        request.body.ersteller = null;
    
    if (errorMsgs.length > 0) {
        console.log('Service Bewertung: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var obj = bewertungDao.create(request.body.gericht.id, request.body.punkte, request.body.zeitpunkt, request.body.bemerkung, request.body.ersteller);
        console.log('Service Bewertung: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bewertung: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/bewertung', function(request, response) {
    console.log('Service Bewertung: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.gericht)) {
        errorMsgs.push('gericht fehlt');
    } else if (helper.isUndefined(request.body.gericht.id)) {
        errorMsgs.push('gericht gesetzt, aber id fehlt');
    }        
    if (helper.isUndefined(request.body.punkte)) {
        errorMsgs.push('punkte fehlen');
    } else if (!helper.isNumeric(request.body.punkte)) {
        errorMsgs.push('punkte müssen eine zahl sein');
    } else if (request.body.punkte <= 0) {
        errorMsgs.push('punkte müssen eine zahl > 0 sein');
    }
    if (helper.isUndefined(request.body.zeitpunkt)) {
        request.body.zeitpunkt = helper.getNow();
    } else if (!helper.isGermanDateTimeFormat(request.body.zeitpunkt)) {
        errorMsgs.push('zeitpunkt hat das falsche Format, erlaubt: dd.mm.jjjj hh:mm:ss');
    } else {
        request.body.zeitpunkt = helper.parseGermanDateTimeString(request.body.zeitpunkt);
    }
    if (helper.isUndefined(request.body.bemerkung)) 
        request.body.bemerkung = null;
    if (helper.isUndefined(request.body.ersteller)) 
        request.body.ersteller = null;

    if (errorMsgs.length > 0) {
        console.log('Service Bewertung: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var obj = bewertungDao.update(request.body.id, request.body.gericht.id, request.body.punkte, request.body.zeitpunkt, request.body.bemerkung, request.body.ersteller);
        console.log('Service Bewertung: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bewertung: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/bewertung/:id', function(request, response) {
    console.log('Service Bewertung: Client requested deletion of record, id=' + request.params.id);

    const bewertungDao = new BewertungDao(request.app.locals.dbConnection);
    try {
        var obj = bewertungDao.loadById(request.params.id);
        bewertungDao.delete(request.params.id);
        console.log('Service Bewertung: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Bewertung: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;