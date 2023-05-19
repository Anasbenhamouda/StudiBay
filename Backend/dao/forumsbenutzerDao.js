const helper = require('../helper.js');
const BenutzerrolleDao = require('./benutzerrolleDao.js');

class ForumsbenutzerDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const benutzerrolleDao = new BenutzerrolleDao(this._conn);

        var sql = 'SELECT * FROM Forumsbenutzer WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        if (result.geschlecht == 0) 
            result.geschlecht = 'männlich';
        else 
            result.geschlecht = 'weiblich';

        result.geburtstag = helper.formatToGermanDate(helper.parseSQLDateTimeString(result.geburtstag));

        result.beitritt = helper.formatToGermanDate(helper.parseSQLDateTimeString(result.beitritt));

        result.rolle = benutzerrolleDao.loadById(result.rolleId);
        delete result.rolleId;

        return result;
    }

    loadAll() {
        const benutzerrolleDao = new BenutzerrolleDao(this._conn);

        var sql = 'SELECT * FROM Forumsbenutzer';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            if (result[i].geschlecht == 0) 
                result[i].geschlecht = 'männlich';
            else 
                result[i].geschlecht = 'weiblich';

            result[i].geburtstag = helper.formatToGermanDate(helper.parseSQLDateTimeString(result[i].geburtstag));

            result[i].beitritt = helper.formatToGermanDate(helper.parseSQLDateTimeString(result[i].beitritt));

            result[i].rolle = benutzerrolleDao.loadById(result[i].rolleId);
            delete result.rolleId;
        }

        return result;
    }

    isunique(benutzername) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Forumsbenutzer WHERE benutzername=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(benutzername);

        if (result.cnt == 0) 
            return true;

        return false;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Forumsbenutzer WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(benutzername = '', geschlecht = 'männlich', geburtstag = null, beitritt = null, rolleId = 1) {
        var sql = 'INSERT INTO Forumsbenutzer (benutzername,geschlecht,geburtstag,beitritt,rolleId) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [benutzername, (helper.strStartsWith(geschlecht, 'mä') ? 0 : 1), (helper.isNull(geburtstag) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(geburtstag)), (helper.isNull(beitritt) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(beitritt)), rolleId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, benutzername = '', geschlecht = 'männlich', geburtstag = null, beitritt = null, rolleId = 1) {
        var sql = 'UPDATE Forumsbenutzer SET benutzername=?,geschlecht=?,geburtstag=?,beitritt=?,rolleId=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [benutzername, (helper.strStartsWith(geschlecht, 'mä') ? 0 : 1), (helper.isNull(geburtstag) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(geburtstag)), (helper.isNull(beitritt) ? helper.formatToSQLDate(helper.getNow()) : helper.formatToSQLDate(beitritt)), rolleId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Forumsbenutzer WHERE id=?';
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
        console.log('ForumsbenutzerDao [_conn=' + this._conn + ']');
    }
}

module.exports = ForumsbenutzerDao;