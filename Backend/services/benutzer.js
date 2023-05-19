const helper = require('../helper.js');
const BenutzerDao = require('../dao/benutzerDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Benutzer');

serviceRouter.get('/benutzer/gib/:id', function(request, response) {
    console.log('Service Benutzer: Client requested one record, id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.loadById(request.params.id);
        console.log('Service Benutzer: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/alle', function(request, response) {
    console.log('Service Benutzer: Client requested all records');

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var arr = benutzerDao.loadAll();
        console.log('Service Benutzer: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Benutzer: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/existiert/:id', function(request, response) {
    console.log('Service Benutzer: Client requested check, if record exists, id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var exists = benutzerDao.exists(request.params.id);
        console.log('Service Benutzer: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Benutzer: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/eindeutig', function(request, response) {
    console.log('Service Benutzer: Client requested check, if username is unique');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push('benutzername fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: check not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var unique = benutzerDao.isunique(request.body.benutzername);
        console.log('Service Benutzer: Check if unique, unique=' + unique);
        response.status(200).json({ 'benutzername': request.body.benutzername, 'eindeutig': unique });
    } catch (ex) {
        console.error('Service Benutzer: Error checking if unique. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/benutzer/zugang', function(request, response) {
    console.log('Service Benutzer: Client requested check, if user has access');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.passwort)) 
        errorMsgs.push('passwort fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: check not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var hasaccess = benutzerDao.hasaccess(request.body.benutzername, request.body.passwort);
        console.log('Service Benutzer: Check if user has access, hasaccess=' + hasaccess);
        response.status(200).json(hasaccess);
    } catch (ex) {
        console.error('Service Benutzer: Error checking if user has access. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/benutzer', function(request, response) {
    console.log('Service Benutzer: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.passwort)) 
        errorMsgs.push('passwort fehlt');
    if (helper.isUndefined(request.body.benutzerrolle)) {
        errorMsgs.push('benutzerrolle fehlt');
    } else if (helper.isUndefined(request.body.benutzerrolle.id)) {
        errorMsgs.push('benutzerrolle gesetzt, aber id fehlt');
    }        
    if (helper.isUndefined(request.body.person)) {
        request.body.person = null;
    } else if (helper.isUndefined(request.body.person.id)) {
        errorMsgs.push('person gesetzt, aber id fehlt');
    } else {
        request.body.person = request.body.person.id;
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.create(request.body.benutzername, request.body.passwort, request.body.benutzerrolle.id, request.body.person);
        console.log('Service Benutzer: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.put('/benutzer', function(request, response) {
    console.log('Service Benutzer: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.neuespasswort)) 
        request.body.neuespasswort = null;
    if (helper.isUndefined(request.body.benutzerrolle)) {
        errorMsgs.push('benutzerrolle fehlt');
    } else if (helper.isUndefined(request.body.benutzerrolle.id)) {
        errorMsgs.push('benutzerrolle gesetzt, aber id fehlt');
    }        
    if (helper.isUndefined(request.body.person)) {
        request.body.person = null;
    } else if (helper.isUndefined(request.body.person.id)) {
        errorMsgs.push('person gesetzt, aber id fehlt');
    } else {
        request.body.person = request.body.person.id;
    }

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.update(request.body.id, request.body.benutzername, request.body.neuespasswort, request.body.benutzerrolle.id, request.body.person);
        console.log('Service Benutzer: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/benutzer/:id', function(request, response) {
    console.log('Service Benutzer: Client requested deletion of record, id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.loadById(request.params.id);
        benutzerDao.delete(request.params.id);
        console.log('Service Benutzer: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Benutzer: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;