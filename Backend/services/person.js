const helper = require('../helper.js');
const PersonDao = require('../dao/personDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Person');

serviceRouter.get('/person/gib/:id', function(request, response) {
    console.log('Service Person: Client requested one record, id=' + request.params.id);

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var obj = personDao.loadById(request.params.id);
        console.log('Service Person: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Person: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/person/alle', function(request, response) {
    console.log('Service Person: Client requested all records');

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var arr = personDao.loadAll();
        console.log('Service Person: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Person: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/person/existiert/:id', function(request, response) {
    console.log('Service Person: Client requested check, if record exists, id=' + request.params.id);

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var exists = personDao.exists(request.params.id);
        console.log('Service Person: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Person: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/person', function(request, response) {
    console.log('Service Person: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.anrede)) {
        errorMsgs.push('anrede fehlt');
    } else if (request.body.anrede.toLowerCase() !== 'herr' && request.body.anrede.toLowerCase() !== 'frau') {
        errorMsgs.push('anrede falsch. Herr und Frau sind erlaubt');
    }        
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push('vorname fehlt');
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push('nachname fehlt');
    if (helper.isUndefined(request.body.adresse)) {
        errorMsgs.push('adresse fehlt');
    } else if (helper.isUndefined(request.body.adresse.id)) {
        errorMsgs.push('adresse gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.telefonnummer)) 
        request.body.telefonnummer = '';
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
    if (!helper.isEmail(request.body.email)) 
        errorMsgs.push('email hat ein falsches Format');
    if (helper.isUndefined(request.body.geburtstag)) {
        request.body.geburtstag = null;
    } else if (!helper.isGermanDateTimeFormat(request.body.geburtstag)) {
        errorMsgs.push('geburtstag hat das falsche Format, erlaubt: dd.mm.jjjj');
    } else {
        request.body.geburtstag = helper.parseDateTimeString(request.body.geburtstag);
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Person: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var obj = personDao.create(request.body.anrede, request.body.vorname, request.body.nachname, request.body.adresse.id, request.body.telefonnummer, request.body.email, request.body.geburtstag);
        console.log('Service Person: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Person: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/person', function(request, response) {
    console.log('Service Person: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id missing');
    if (helper.isUndefined(request.body.anrede)) {
        errorMsgs.push('anrede fehlt');
    } else if (request.body.anrede.toLowerCase() !== 'herr' && request.body.anrede.toLowerCase() !== 'frau') {
        errorMsgs.push('anrede falsch. Herr und Frau sind erlaubt');
    }        
    if (helper.isUndefined(request.body.vorname)) 
        errorMsgs.push('vorname fehlt');
    if (helper.isUndefined(request.body.nachname)) 
        errorMsgs.push('nachname fehlt');
    if (helper.isUndefined(request.body.adresse)) {
        errorMsgs.push('adresse fehlt');
    } else if (helper.isUndefined(request.body.adresse.id)) {
        errorMsgs.push('adresse gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.telefonnummer)) 
        request.body.telefonnummer = '';
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
    if (!helper.isEmail(request.body.email)) 
        errorMsgs.push('email hat ein falsches Format');
    if (helper.isUndefined(request.body.geburtstag)) {
        request.body.geburtstag = null;
    } else if (!helper.isGermanDateTimeFormat(request.body.geburtstag)) {
        errorMsgs.push('geburtstag hat das falsche Format, erlaubt: dd.mm.jjjj');
    } else {
        request.body.geburtstag = helper.parseDateTimeString(request.body.geburtstag);
    }

    if (errorMsgs.length > 0) {
        console.log('Service Person: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var obj = personDao.update(request.body.id, request.body.anrede, request.body.vorname, request.body.nachname, request.body.adresse.id, request.body.telefonnummer, request.body.email, request.body.geburtstag);
        console.log('Service Person: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Person: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/person/:id', function(request, response) {
    console.log('Service Person: Client requested deletion of record, id=' + request.params.id);

    const personDao = new PersonDao(request.app.locals.dbConnection);
    try {
        var obj = personDao.loadById(request.params.id);
        personDao.delete(request.params.id);
        console.log('Service Person: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Person: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;