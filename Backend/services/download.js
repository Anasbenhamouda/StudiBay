const helper = require('../helper.js');
const DownloadDao = require('../dao/downloadDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Download');

serviceRouter.get('/download/gib/:id', function(request, response) {
    console.log('Service Download: Client requested one record, id=' + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var obj = downloadDao.loadById(request.params.id);
        console.log('Service Download: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Download: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/download/alle', function(request, response) {
    console.log('Service Download: Client requested all records');

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var arr = downloadDao.loadAll();
        console.log('Service Download: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Download: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/download/existiert/:id', function(request, response) {
    console.log('Service Download: Client requested check, if record exists, id=' + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var exists = downloadDao.exists(request.params.id);
        console.log('Service Download: Check if record exists by id=' + request.params.id + ', exists=' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service Download: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/download', function(request, response) {
    console.log('Service Download: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.dateipfad)) 
        errorMsgs.push('dateipfad fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Download: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var obj = downloadDao.create(request.body.bezeichnung, request.body.beschreibung, request.body.dateipfad);
        console.log('Service Download: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Download: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/download', function(request, response) {
    console.log('Service Download: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    if (helper.isUndefined(request.body.beschreibung)) 
        request.body.beschreibung = '';
    if (helper.isUndefined(request.body.dateipfad)) 
        errorMsgs.push('dateipfad fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Download: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var obj = downloadDao.update(request.body.id, request.body.bezeichnung, request.body.beschreibung, request.body.dateipfad);
        console.log('Service Download: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Download: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/download/:id', function(request, response) {
    console.log('Service Download: Client requested deletion of record, id=' + request.params.id);

    const downloadDao = new DownloadDao(request.app.locals.dbConnection);
    try {
        var obj = downloadDao.loadById(request.params.id);
        downloadDao.delete(request.params.id);
        console.log('Service Download: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Download: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;