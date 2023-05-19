const helper = require("../helper.js");
const MehrwertsteuerDao = require("../dao/mehrwertsteuerDao.js");
const express = require("express");
var serviceRouter = express.Router();

console.log('- Service Mehrwertsteuer');

serviceRouter.get("/mehrwertsteuer/gib/:id", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested one record, id=" + request.params.id);

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var obj = mehrwertsteuerDao.loadById(request.params.id);
        console.log("Service Mehrwertsteuer: Record loaded");
        response.status(200).json(obj);
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error loading record by id. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get("/mehrwertsteuer/alle", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested all records");

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var arr = mehrwertsteuerDao.loadAll();
        console.log("Service Mehrwertsteuer: Records loaded, count=" + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error loading all records. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get("/mehrwertsteuer/existiert/:id", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested check, if record exists, id=" + request.params.id);

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var exists = mehrwertsteuerDao.exists(request.params.id);
        console.log("Service Mehrwertsteuer: Check if record exists by id=" + request.params.id + ", exists=" + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error checking if record exists. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post("/mehrwertsteuer", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested creation of new record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.steuersatz)) {
        errorMsgs.push("steuersatz fehlt");
    } else if (!helper.isNumeric(request.body.steuersatz)) {
        errorMsgs.push("steuersatz muss eine Zahl sein");
    } else if (request.body.steuersatz <= 0) {
        errorMsgs.push("steuersatz muss eine Zahl > 0 sein");
    }        
    
    if (errorMsgs.length > 0) {
        console.log("Service Mehrwertsteuer: Creation not possible, data missing");
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var obj = mehrwertsteuerDao.create(request.body.bezeichnung, request.body.steuersatz);
        console.log("Service Mehrwertsteuer: Record inserted");
        response.status(200).json(obj);
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error creating new record. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put("/mehrwertsteuer", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested update of existing record");

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push("id fehlt");
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push("bezeichnung fehlt");
    if (helper.isUndefined(request.body.steuersatz)) {
        errorMsgs.push("steuersatz fehlt");
    } else if (!helper.isNumeric(request.body.steuersatz)) {
        errorMsgs.push("steuersatz muss eine Zahl sein");
    } else if (request.body.steuersatz <= 0) {
        errorMsgs.push("steuersatz muss eine Zahl > 0 sein");
    }

    if (errorMsgs.length > 0) {
        console.log("Service Mehrwertsteuer: Update not possible, data missing");
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var obj = mehrwertsteuerDao.update(request.body.id, request.body.bezeichnung, request.body.steuersatz);
        console.log("Service Mehrwertsteuer: Record updated, id=" + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error updating record by id. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete("/mehrwertsteuer/:id", function(request, response) {
    console.log("Service Mehrwertsteuer: Client requested deletion of record, id=" + request.params.id);

    const mehrwertsteuerDao = new MehrwertsteuerDao(request.app.locals.dbConnection);
    try {
        var obj = mehrwertsteuerDao.loadById(request.params.id);
        mehrwertsteuerDao.delete(request.params.id);
        console.log("Service Mehrwertsteuer: Deletion of record successfull, id=" + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error("Service Mehrwertsteuer: Error deleting record. Exception occured: " + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;