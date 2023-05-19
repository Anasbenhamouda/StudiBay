const helper = require('../helper.js');
const fileHelper = require('../fileHelper.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service DateiUploadMehrere');

serviceRouter.post('/dateiuploadmehrere', async(request, response) => {
    console.log('Service DateiUploadMehrere called');

    try {
        // if no files received, send error
        if (!fileHelper.hasUploadedFiles(request)) {
            console.log('no files transmitted, nothing to do');
            response.status(400).json({'fehler': true, 'nachricht': 'Keine Dateien aufgeladen'});
        } else {

            console.log('count of uploaded files ' + fileHelper.cntUploadedFiles(request));

            // get all file objects
            var files = fileHelper.getAllUplodedFilesAsArray(request, true);
            //console.log(files);

            /////////////////////////////////////////////////////////
            // do anything what you want with this data
            /////////////////////////////////////////////////////////

            console.log('creating response');
            var arr = [];
            
            files.forEach(function(item) {
                arr.push({
                    status: true,
                    fileSaved: false,
                    fileName: item.name,
                    fileSize: item.size,
                    fileMimeType: item.mimetype,
                    fileEncoding: item.encoding,
                    fileHandle: item.handleName,
                    fileNameOnly: item.nameOnly,
                    fileExtension: item.extension,
                    fileIsPicture: item.isPicture
                });
            });

            // send response
            response.status(200).json(arr);            
        }

    } catch (err) {        
        response.status(400).json({'fehler': true, 'nachricht': 'Fehler im Service'});
    }
    
});

module.exports = serviceRouter;