const helper = require('../helper.js');
const ForumsbenutzerDao = require('./forumsbenutzerDao.js');
const ForumseintragDao = require('./forumseintragDao.js');

class ForumsbereichDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        const forumseintragDao = new ForumseintragDao(this._conn);

        var sql = 'SELECT * FROM Forumsbereich WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.administrator = forumsbenutzerDao.loadById(result.administratorId);
        delete result.administratorId;

        result.threads = forumseintragDao.loadByArea(result.id);

        return result;
    }

    loadAll() {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        const forumseintragDao = new ForumseintragDao(this._conn);

        var sql = 'SELECT * FROM Forumsbereich';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].administrator = forumsbenutzerDao.loadById(result[i].administratorId);
            delete result.administratorId;

            result[i].threads = forumseintragDao.loadByArea(result[i].id);
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Forumsbereich WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(thema = '', beschreibung = '', administratorId = 1) {
        // ATTENTION: No childs (entries) are created, only main rec
        var sql = 'INSERT INTO Forumsbereich (thema,beschreibung,administratorId) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [thema, beschreibung, administratorId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, thema = '', beschreibung = '', administratorId = 1) {
        // ATTENTION: No childs (entries) are modified, only main rec
        var sql = 'UPDATE Forumsbereich SET thema=?,beschreibung=?,administratorID=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [thema, beschreibung, administratorId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            const forumseintragDao = new ForumseintragDao(this._conn);
            forumseintragDao.deleteByArea(id);

            var sql = 'DELETE FROM Forumsbereich WHERE id=?';
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
        console.log('ForumsbereichDao [_conn=' + this._conn + ']');
    }
}

module.exports = ForumsbereichDao;