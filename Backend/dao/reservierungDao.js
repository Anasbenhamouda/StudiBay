const helper = require('../helper.js');
const ReserviertersitzDao = require('./reserviertersitzDao.js');
const ReserviererDao = require('./reserviererDao.js');
const ZahlungsartDao = require('./zahlungsartDao.js');

class ReservierungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        const reserviererDao = new ReserviererDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = 'SELECT * FROM Reservierung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.zeitpunkt));

        result.reservierer = reserviererDao.loadById(result.reserviererId);
        delete result.reserviererId;

        result.zahlungsart = zahlungsartDao.loadById(result.zahlungsartId);
        delete result.zahlungsartId;

        result.vorstellung = { 'id': result.vorstellungId };
        delete result.vorstellungId;

        result.reserviertesitze = reserviertersitzDao.loadAllByParent(result.id);
        
        return result;
    }

    loadAll() {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        const reserviererDao = new ReserviererDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = 'SELECT * FROM Reservierung';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            if (helper.isNull(result[i].reserviererId)) {
                result[i].reservierer = null;
            } else {
                result[i].reservierer = reserviererDao.loadById(result[i].reserviererId);
            }
            delete result[i].reserviererId;

            result[i].zahlungsart = zahlungsartDao.loadById(result[i].zahlungsartId);
            delete result[i].zahlungsartId;

            result[i].vorstellung = { 'id': result[i].vorstellungId };
            delete result[i].vorstellungId;

            result[i].reserviertesitze = reserviertersitzDao.loadAllByParent(result[i].id);
        }

        return result;
    }

    loadAllByParent(id) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        const reserviererDao = new ReserviererDao(this._conn);
        const zahlungsartDao = new ZahlungsartDao(this._conn);

        var sql = 'SELECT * FROM Reservierung WHERE vorstellungId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            if (helper.isNull(result[i].reserviererId)) {
                result[i].reservierer = null;
            } else {
                result[i].reservierer = reserviererDao.loadById(result[i].reserviererId);
            }
            delete result[i].reserviererId;

            result[i].zahlungsart = zahlungsartDao.loadById(result[i].zahlungsartId);
            delete result[i].zahlungsartId;

            result[i].vorstellung = { 'id': result[i].vorstellungId };
            delete result[i].vorstellungId;

            result[i].reserviertesitze = reserviertersitzDao.loadAllByParent(result[i].id);
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Reservierung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(zeitpunkt = null, reserviererId = 1, zahlungsartId = 1, vorstellungId = 1, reserviertesitze = []) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);

        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = 'INSERT INTO Reservierung (zeitpunkt,reserviererId,zahlungsartId,vorstellungId) VALUES (?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(zeitpunkt), reserviererId, zahlungsartId, vorstellungId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        if (reserviertesitze.length > 0) {
            for (var element of reserviertesitze) {
                reserviertersitzDao.create(result.lastInsertRowid, element.reihe, element.sitzplatz);
            }
        }

        return this.loadById(result.lastInsertRowid);
    }

    update(id, zeitpunkt = null, reserviererId = 1, zahlungsartId = 1, vorstellungId = 1, reserviertesitze = []) {
        const reserviertersitzDao = new ReserviertersitzDao(this._conn);
        reserviertersitzDao.deleteByParent(id);

        if (helper.isNull(zeitpunkt)) 
            zeitpunkt = helper.getNow();

        var sql = 'UPDATE Reservierung SET zeitpunkt=?,reserviererId=?,zahlungsartId=?,vorstellungId=? WHERE Id=?';
        var statement = this._conn.prepare(sql);
        var params = [helper.formatToSQLDateTime(zeitpunkt), reserviererId, zahlungsartId, vorstellungId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);
        
        if (reserviertesitze.length > 0) {
            for (var element of reserviertesitze) {
                reserviertersitzDao.create(id, element.reihe, element.sitzplatz);
            }
        }

        return this.loadById(id);
    }

    delete(id) {
        try {
            const reserviertersitzDao = new ReserviertersitzDao(this._conn);
            reserviertersitzDao.deleteByParent(id);

            var sql = 'DELETE FROM Reservierung WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    deleteByParent(id) {
        try {
            
            // get all recs
            var sql = 'SELECT ID FROM Reservierung WHERE vorstellungId=?';
            var statement = this._conn.prepare(sql);
            var result = statement.all(id);

            if (!helper.isArrayEmpty(result)) {
                var idlist = '';
                for (var n = 0; n < result.length; n++) {
                    idlist += result[n].ID;
                    if (n < result.length - 1) 
                        idlist += ',';
                }

                // delete the childs
                sql = 'DELETE FROM ReservierterSitz WHERE reservierungId IN (?)';
                statement = this._conn.prepare(sql);
                statement.run(idlist);

                // delete the main recs
                sql = 'DELETE FROM Reservierung WHERE id IN (?)';
                statement = this._conn.prepare(sql);
                statement.run(idlist);
            }

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by parent id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ReservierungDao [_conn=' + this._conn + ']');
    }
}

module.exports = ReservierungDao;