const helper = require('../helper.js');
const BestellpositionDao = require('./bestellpositionDao.js');
const PersonDao = require('./personDao.js');
const ZahlungsartDao = require('./zahlungsartDao.js');

class BestellungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        const personDao = new PersonDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = 'SELECT * FROM Bestellung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.bestellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.bestellzeitpunkt));

        if (helper.isNull(result.bestellerId)) {
            result.besteller = null;
        } else {
            result.besteller = personDao.loadById(result.bestellerId);
        }
        delete result.bestellerId;

        result.zahlungsart = zahlungsartDao.loadById(result.zahlungsartId);
        delete result.zahlungsartId;

        result.bestellpositionen = bestellpositionDao.loadByParent(result.id);
        
        result.total = { 'netto': 0, 'brutto': 0, 'mehrwertsteuer': 0 };

        for (i = 0; i < result.bestellpositionen.length; i++) {
            result.total.netto += result.bestellpositionen[i].nettosumme;
            result.total.brutto += result.bestellpositionen[i].bruttosumme;
            result.total.mehrwertsteuer += result.bestellpositionen[i].mehrwertsteuersumme;
        }

        result.total.netto = helper.round(result.total.netto);
        result.total.brutto = helper.round(result.total.brutto);
        result.total.mehrwertsteuer = helper.round(result.total.mehrwertsteuer);

        return result;
    }

    loadAll() {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        const personDao = new PersonDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = 'SELECT * FROM Bestellung';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].bestellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].bestellzeitpunkt));

            if (helper.isNull(result[i].bestellerId)) {
                result[i].besteller = null;
            } else {
                result[i].besteller = personDao.loadById(result[i].bestellerId);
            }
            delete result[i].bestellerId;

            result[i].zahlungsart = zahlungsartDao.loadById(result[i].zahlungsartId);
            delete result[i].zahlungsartid;

            result[i].bestellpositionen = bestellpositionDao.loadByParent(result[i].id);

            result[i].total = { 'netto': 0, 'brutto': 0, 'mehrwertsteuer': 0 };

            for (var element of result[i].bestellpositionen) {
                result[i].total.netto += element.nettosumme;
                result[i].total.brutto += element.bruttosumme;
                result[i].total.mehrwertsteuer += element.mehrwertsteuersumme;
            }

            result[i].total.netto = helper.round(result[i].total.netto);
            result[i].total.brutto = helper.round(result[i].total.brutto);
            result[i].total.mehrwertsteuer = helper.round(result[i].total.mehrwertsteuer);
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Bestellung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bestellzeitpunkt = null, bestellerId = null, zahlungsartId = null, bestellpositionen = []) {
        const bestellpositionDao = new BestellpositionDao(this._conn);

        if (helper.isNull(bestellzeitpunkt)) 
            bestellzeitpunkt = helper.getNow();

        var sql = 'INSERT INTO Bestellung (bestellzeitpunkt,bestellerId,zahlungsartId) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(bestellzeitpunkt), bestellerId, zahlungsartId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        if (bestellpositionen.length > 0) {
            for (var element of bestellpositionen) {
                bestellpositionDao.create(result.lastInsertRowid, element.produkt.id, element.menge);
            }
        }

        return this.loadById(result.lastInsertRowid);
    }

    update(id, bestellzeitpunkt = null, bestellerId = null, zahlungsartId = null, bestellpositionen = []) {
        const bestellpositionDao = new BestellpositionDao(this._conn);
        bestellpositionDao.deleteByParent(id);

        if (helper.isNull(bestellzeitpunkt)) 
            bestellzeitpunkt = helper.getNow();

        var sql = 'UPDATE Bestellung SET bestellzeitpunkt=?,bestellerId=?,zahlungsartId=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(bestellzeitpunkt), bestellerId, zahlungsartId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);
        
        if (bestellpositionen.length > 0) {
            for (var element of bestellpositionen) {
                bestellpositionDao.create(id, element.produkt.id, element.menge);
            }
        }

        return this.loadById(id);
    }

    delete(id) {
        try {
            const bestellpositionDao = new BestellpositionDao(this._conn);
            bestellpositionDao.deleteByParent(id);

            var sql = 'DELETE FROM Bestellung WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('BestellungDao [_conn=' + this._conn + ']');
    }
}

module.exports = BestellungDao;