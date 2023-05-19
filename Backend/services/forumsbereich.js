const helper = require('../helper.js');
const ForumsbereichDao = require('../dao/forumsbereichDao.js');
const ForumseintragDao = require('../dao/forumseintragDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Forumsbereich');

serviceRouter.get('/forumsbereich/gib/:id', function(request, response) {
    console.log('Service Forumsbereich: Client requested one record, id=' + request.params.id);

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var obj = forumsbereichDao.loadById(request.params.id);
        console.log('Service Forumsbereich: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Forumsbereich: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/forumsbereich/alle', function(request, response) {
    console.log('Service Forumsbereich: Client requested all records');

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var arr = forumsbereichDao.loadAll();
        console.log('Service Forumsbereich: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Forumsbereich: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/forumsbereich/existiert/:id', function(request, response) {
    console.log('Service Forumsbereich: Client requested check, if record exists, id=' + request.params.id);

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var exists = forumsbereichDao.exists(request.params.id);
        console.log('Service Forumsbereich: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({ 'id': request.params.id, 'existiert': exists });
    } catch (ex) {
        console.error('Service Forumsbereich: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/forumsbereich', function(request, response) {
    console.log('Service Forumsbereich: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.thema)) 
        errorMsgs.push('thema fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.administrator)) {
        errorMsgs.push('administrator fehlt');
    } else if (helper.isUndefined(request.body.administrator.id)) {
        errorMsgs.push('administrator gesetzt, aber id fehlt');
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Forumsbereich: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var obj = forumsbereichDao.create(request.body.thema, request.body.beschreibung, request.body.administrator.id);
        console.log('Service Forumsbereich: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Forumsbereich: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/forumsbereich', function(request, response) {
    console.log('Service Forumsbereich: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.thema)) 
        errorMsgs.push('thema fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.administrator)) {
        errorMsgs.push('administrator fehlt');
    } else if (helper.isUndefined(request.body.administrator.id)) {
        errorMsgs.push('administrator gesetzt, aber id fehlt');
    }

    if (errorMsgs.length > 0) {
        console.log('Service Forumsbereich: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var obj = forumsbereichDao.update(request.body.id, request.body.thema, request.body.beschreibung, request.body.administrator.id);
        console.log('Service Forumsbereich: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Forumsbereich: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/forumsbereich/:id', function(request, response) {
    console.log('Service Forumsbereich: Client requested deletion of record, id=' + request.params.id);

    const forumsbereichDao = new ForumsbereichDao(request.app.locals.dbConnection);
    try {
        var obj = forumsbereichDao.loadById(request.params.id);
        forumsbereichDao.delete(request.params.id);
        console.log('Service Forumsbereich: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Forumsbereich: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// special coding for thread entries (only add and delete)
serviceRouter.post('/forumseintrag', function(request, response) {
    console.log('Service Forumsbereich - Eintrag: Client requested creation of new child record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.beitrag)) 
        errorMsgs.push('beitrag fehlt');
    if (helper.isUndefined(request.body.ersteller)) {
        errorMsgs.push('ersteller fehlt');
    } else if (helper.isUndefined(request.body.ersteller.id)) {
        errorMsgs.push('ersteller gesetzt, aber id fehlt');
    }
    if (helper.isUndefined(request.body.erstellzeitpunt)) {
        request.body.erstellzeitpunkt = null;
    } else if (!helper.isGermanDateTimeFormat(request.body.erstellzeitpunkt)) {
        errorMsgs.push('erstellzeitpunkt hat das falsche Format, erlaubt: dd.mm.jjjj hh.mm.ss');
    } else {
        request.body.erstellzeitpunkt = helper.parseGermanDateTimeString(request.body.erstellzeitpunkt);
    }
    if (helper.isUndefined(request.body.vater)) {
        request.body.vater = null;
    } else if (helper.isUndefined(request.body.vater.id)) {
        errorMsgs.push('vater gesetzt, aber id fehlt');
    } else {
        request.body.vater = request.body.vater.id;
        // if parent id is set, no areaid is needed
        request.body.id = null;
    }
    
    if (errorMsgs.length > 0) {
        console.log('Service Forumsbereich - Eintrag: Child creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const forumseintragDao = new ForumseintragDao(request.app.locals.dbConnection);
    try {
        var obj = forumseintragDao.create(request.body.beitrag, request.body.ersteller.id, request.body.erstellzeitpunkt, request.body.id, request.body.vater);
        console.log('Service Forumsbereich - Eintrag: Child Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Forumsbereich - Eintrag: Error creating child record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/forumseintrag/:id', function(request, response) {
    console.log('Service Forumsbereich - Eintrag: Client requested deletion of child record, id=' + request.params.id);

    const forumseintragDao = new ForumseintragDao(request.app.locals.dbConnection);
    try {
        if (forumseintragDao.exists(request.params.id) == false) {
            console.error('Service Forumsbereich - Eintrag: Error deleting child record. Record not existing');
            response.status(400).json({'fehler': true, 'nachricht': 'Löschen nicht möglich. Kein Eintrag vorhanden'});
        } else {
            forumseintragDao.delete(request.params.id);
            console.log('Service Forumsbereich - Eintrag: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'id': request.params.id });
        }
    } catch (ex) {
        console.error('Service Forumsbereich - Eintrag: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;