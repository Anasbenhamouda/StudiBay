const helper = require('../helper.js');
const ForumsbenutzerDao = require('./forumsbenutzerDao.js');

class ForumseintragDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadByArea(areaid) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);
        var users = forumsbenutzerDao.loadAll();

        // get top level of entries
        var sql = 'SELECT * FROM Forumseintrag WHERE bereichsId=? AND vaterId IS NULL AND entfernt=0';
        var statement = this._conn.prepare(sql);
        var result = statement.all(areaid);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            for (var element of users) {
                if (element.id == result[i].erstellerId) {
                    result[i].ersteller = element;
                    break;
                }
            }
            delete result[i].erstellerId;

            result[i].erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].erstellzeitpunkt));

            // breichsid and entfernt not needed, as bound to area at top, so just delete the entry
            delete result[i].bereichsId;
            delete result[i].entfernt;

            // info back to parent
            result[i].vater = null;
            delete result[i].vaterId;

            // now work on answers if there are some (recursive)
            result[i].antworten = [];
            if (this.hasChilds(result[i].id)) 
                result[i].antworten = this.loadByParent(users, result[i].id);
        }

        return result;
    }

    loadByParent(users, parentId) {
        var sql = 'SELECT * FROM Forumseintrag WHERE vaterId=? AND bereichsId IS NULL AND entfernt=0';
        var statement = this._conn.prepare(sql);
        var result = statement.all(parentId);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            for (var element of users) {
                if (element.id == result[i].erstellerid) {
                    result[i].ersteller = element;
                    break;
                }
            }
            delete result[i].erstellerId;

            result[i].erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].erstellzeitpunkt));

            // bereichsid and entfernt not needed, as bound to area at top, so just delete the entry
            delete result[i].bereichsId;
            delete result[i].entfernt;

            // info back to parent
            result[i].vater = { 'id': result[i].vaterId };
            delete result[i].vaterId;

            // now work on answers if there are some (recursive)
            result[i].antworten = [];
            if (this.hasChilds(result[i].id)) 
                result[i].antworten = this.loadByParent(users, result[i].id);
        }

        return result;        
    }

    hasChilds(parentId) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Forumseintrag WHERE vaterId=? AND bereichsId IS NULL AND entfernt=0';
        var statement = this._conn.prepare(sql);
        var result = statement.get(parentId);

        if (result.cnt > 0) 
            return true;

        return false;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Forumseintrag WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(beitrag = '', erstellerId = 1, erstellzeitpunkt = null, bereichsId = null, vaterId = null) {
        const forumsbenutzerDao = new ForumsbenutzerDao(this._conn);

        if (helper.isNull(erstellzeitpunkt)) 
            erstellzeitpunkt = helper.getNow();

        var sql = 'INSERT INTO Forumseintrag (beitrag,erstellerId,erstellzeitpunkt,bereichsId,vaterId) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [beitrag, erstellerId, helper.formatToSQLDateTime(erstellzeitpunkt), bereichsId, vaterId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return { 
            'id': result.lastInsertRowid, 
            'beitrag': beitrag,
            'erstellzeitpunk': helper.formatToGermanDateTime(erstellzeitpunkt),
            'ersteller': forumsbenutzerDao.loadById(erstellerId),
            'vater': (helper.isNull(vaterid) ? null : { 'id': vaterId }),
            'antworten': []
        };
    }

    delete(id) {
        /* info:
            delete works differently than other delete methods
            cause of recurvise character, we do not really delete a record
            we just set the flag of the record to be deleted
            therefore on read, the rec is not loaded anymore
        */

        try {
            var sql = 'UPDATE Forumseintrag SET entfernt=1 WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    deleteByArea(id) {
        try {
            var sql = 'UPDATE Forumseintrag SET entfernt=1,bereichsId=NULL WHERE bereichsId=? AND vaterId IS NULL';
            var statement = this._conn.prepare(sql);
            statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by areaid=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ForumseintragDao [_conn=' + this._conn + ']');
    }
}

module.exports = ForumseintragDao;