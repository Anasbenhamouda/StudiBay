/////////////////
// WebAnwendungen 2 Project
// Backend
// Main Server / Controller
// Version 4.0, 21.02.2023
// Sommersemester 2023, HS Albstadt-Sigmaringen, INF

/////////////////
// workaround / bugfix for linux systems
Object.fromEntries = l => l.reduce((a, [k, v]) => ({...a, [k]: v }), {})
    /////////////////

const helper = require('./helper');
const fileHelper = require('./fileHelper');
console.log('Starting server...');

try {
    // connect database
    console.log('Connect database...');
    const Database = require('better-sqlite3');
    const dbOptions = { verbose: console.log };
    const dbFile = './db/webanw2.sqlite';
    const dbConnection = new Database(dbFile, dbOptions);

    // create server
    const HTTP_PORT = 8000;
    const express = require('express');
    const fileUpload = require('express-fileupload');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const _ = require('lodash');

    console.log('Creating and configuring Web Server...');
    const app = express();

    // provide service router with database connection / store the database connection in global server environment
    app.locals.dbConnection = dbConnection;

    console.log('Binding middleware...');
    //app.use(express.static(__dirname + '/public'))
    app.use(express.static('../templates'))

    app.use(fileUpload({
        createParentPath: true,
        limits: {
            fileSize: 2 * 1024 * 1024 * 1024 // limit to 2MB
        }
    }));
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(function(request, response, next) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use(morgan('dev'));

    // binding endpoints
    const TOPLEVELPATH = '/api';
    console.log('Binding enpoints, top level Path at ' + TOPLEVELPATH);

    var serviceRouter = require('./services/land.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/adresse.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/person.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/branche.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/firma.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/download.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/termin.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/produktkategorie.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/zahlungsart.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/mehrwertsteuer.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/produktbild.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/produkt.js');
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require('./services/bestellung.js');
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require('./services/speisenart.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/einheit.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/zutat.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/bewertung.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/gericht.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/benutzerrolle.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/forumsbenutzer.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/forumsbereich.js');
    app.use(TOPLEVELPATH, serviceRouter);



    serviceRouter = require('./services/filmgenre.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/kinosaal.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/reservierer.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/film.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/reservierung.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/vorstellung.js');
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require('./services/benutzer.js');
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require('./services/galerie.js');
    app.use(TOPLEVELPATH, serviceRouter);


    serviceRouter = require('./services/dateiuploadeinzeln.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/dateiuploadmehrere.js');
    app.use(TOPLEVELPATH, serviceRouter);



    // send default error message if no matching endpoint found
    app.use(function(request, response) {
        console.log('Error occured, 404, resource not found');
        response.status(404).json({ 'fehler': true, 'nachricht': 'Resource nicht gefunden' });
    });


    // starting the Web Server
    console.log('\nBinding Port and starting Webserver...');

    var webServer = app.listen(HTTP_PORT, () => {
        console.log('Listening at localhost, port ' + HTTP_PORT);
        console.log('\nUsage: http://localhost:' + HTTP_PORT + TOPLEVELPATH + "/SERVICENAME/SERVICEMETHOD/....");
        console.log('\nVersion 4.0, 21.02.2023\nSommersemester 2023, HS Albstadt-Sigmaringen, INF');
        console.log('\n\n-----------------------------------------');
        console.log('exit / stop Server by pressing 2 x CTRL-C');
        console.log('-----------------------------------------\n\n');
    });

} catch (ex) {
    console.error(ex);
}