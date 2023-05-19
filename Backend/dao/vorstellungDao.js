const helper = require('../helper.js');
const FilmDao = require('./filmDao.js');
const KinosaalDao = require('./kinosaalDao.js');
const ReservierungDao = require('./reservierungDao.js');

class VorstellungDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const filmDao = new FilmDao(this._conn);
        const kinosaalDao = new KinosaalDao(this._conn);
        const reservierungDao = new ReservierungDao(this._conn);

        var sql = 'SELECT * FROM Vorstellung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.film = filmDao.loadById(result.filmId);
        delete result.filmId;

        result.kinosaal = kinosaalDao.loadById(result.kinosaalId);
        delete result.kinosaalId;

        result.zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.zeitpunkt));

        result.reservierungen = reservierungDao.loadAllByParent(result.id);

        result.sitze = { 'gesammt': result.kinosaal.sitzegesammt };
        result.sitze.reserviert = 0;
        for (var element of result.reservierungen) {
            result.sitze.reserviert += element.reserviertesitze.length;
        }
        result.sitze.frei = result.sitze.gesammt - result.sitze.reserviert;

        return result;
    }

    loadAll() {
        const filmDao = new FilmDao(this._conn);
        const kinosaalDao = new KinosaalDao(this._conn);
        const reservierungDao = new ReservierungDao(this._conn);

        var sql = 'SELECT * FROM Vorstellung';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].film = filmDao.loadById(result[i].filmId);
            delete result[i].filmId;

            result[i].kinosaal = kinosaalDao.loadById(result[i].kinosaalId);
            delete result[i].kinosaalId;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = reservierungDao.loadAllByParent(result[i].id);

            result[i].sitze = { 'gesammt': result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    loadAllByFilm(filmId) {
        const filmDao = new FilmDao(this._conn);
        const kinosaalDao = new KinosaalDao(this._conn);
        const reservierungDao = new ReservierungDao(this._conn);

        var sql = 'SELECT * FROM Vorstellung WHERE filmId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(filmId);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        for (var i = 0; i < result.length; i++) {
            result[i].film = filmDao.loadById(result[i].filmId);
            delete result[i].filmId;

            result[i].kinosaal = kinosaalDao.loadById(result[i].kinosaalId);
            delete result[i].kinosaalId;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = reservierungDao.loadAllByParent(result[i].id);

            result[i].sitze = { 'gesammt': result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    loadAllByRoom(kinosaalId) {
        const filmDao = new FilmDao(this._conn);
        const kinosaalDao = new KinosaalDao(this._conn);
        const reservierungDao = new ReservierungDao(this._conn);

        var sql = 'SELECT * FROM Vorstellung WHERE kinosaalId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(kinosaalId);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].film = filmDao.loadById(result[i].filmId);
            delete result[i].filmId;

            result[i].kinosaal = kinosaalDao.loadById(result[i].kinosaalId);
            delete result[i].kinosaalId;

            result[i].zeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].zeitpunkt));

            result[i].reservierungen = reservierungDao.loadAllByParent(result[i].id);

            result[i].sitze = { 'gesammt': result[i].kinosaal.sitzegesammt };
            result[i].sitze.reserviert = 0;
            for (var element of result[i].reservierungen) {
                result[i].sitze.reserviert += element.reserviertesitze.length;
            }
            result[i].sitze.frei = result[i].sitze.gesammt - result[i].sitze.reserviert;
        }

        return result;
    }

    seatAvailable(id, reihe, sitzplatz) {
        var sql = 'SELECT COUNT(ReservierterSitz.id) AS cnt FROM ReservierterSitz INNER JOIN Reservierung ON Reservierung.id=ReservierterSitz.reservierungId INNER JOIN Vorstellung ON Vorstellung.id=Reservierung.vorstellungId WHERE Vorstellung.id=? AND ReservierterSitz.reihe=? AND ReservierterSitz.sitzplatz=?';
        var statement = this._conn.prepare(sql);
        var params = [id, reihe, sitzplatz];
        var result = statement.get(params);

        if (result.cnt == 1) 
            return false;

        return true;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Vorstellung WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(filmId = 1, kinosaalId = 1, zeitpunkt = null) {
        var sql = 'INSERT INTO Vorstellung (filmId,kinosaalId,zeitpunkt) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [filmId, kinosaalId, helper.formatToSQLDateTime(zeitpunkt)];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, filmId = 1, kinosaalId = 1, zeitpunkt = null, reservierungen = []) {
        const reservierungDao = new ReservierungDao(this._conn);
        reservierungDao.deleteByParent(id);

        var sql = 'UPDATE Vorstellung SET filmId=?,kinosaalId=?,zeitpunkt=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [filmId, kinosaalId, helper.formatToSQLDateTime(zeitpunkt), id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        if (reservierungen.length > 0) {
            for (var element of reservierungen) {
                reservierungDao.create(helper.parseGermanDateTimeString(element.zeitpunkt), element.reservierer.id, element.zahlungsart.id, id, element.reserviertesitze);
            }
        }

        return this.loadById(id);
    }

    delete(id) {
        try {
            const reservierungDao = new ReservierungDao(this._conn);
            reservierungDao.deleteByParent(id);

            var sql = 'DELETE FROM Vorstellung WHERE id=?';
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
        console.log('VorstellungDao [_conn=' + this._conn + ']');
    }
}

module.exports = VorstellungDao;