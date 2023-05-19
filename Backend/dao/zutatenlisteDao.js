const helper = require('../helper.js');
const ZutatDao = require('./zutatDao.js');
const EinheitDao = require('./einheitDao.js');

class ZutatenlisteDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const zutatDao = new ZutatDao(this._conn);
        const einheitDao = new EinheitDao(this._conn);

        var sql = 'SELECT * FROM Zutatenliste WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.gericht = { 'id': result.gerichtId };
        delete result.gerichtId;

        result.zutat = zutatDao.loadById(result.zutatId);
        delete result.zutatId;

        result.einheit = einheitDao.loadById(result.einheitId);
        delete result.einheitId;

        return result;
    }
    
    loadAll() {
        const zutatDao = new ZutatDao(this._conn);
        const einheitDao = new EinheitDao(this._conn);

        var sql = 'SELECT * FROM Zutatenliste';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { 'id': result[i].gerichtId };
            delete result[i].gerichtId;

            result[i].zutat = zutatDao.loadById(result[i].zutatId);
            delete result[i].zutatId;


            result[i].einheit = einheitDao.loadById(result[i].einheitId);
            delete result[i].einheitId;
        }

        return result;
    }

    loadAllByParent(id) {
        const zutatDao = new ZutatDao(this._conn);
        const einheitDao = new EinheitDao(this._conn);

        var sql = 'SELECT * FROM Zutatenliste WHERE gerichtId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        for (var i = 0; i < result.length; i++) {
            result[i].gericht = { 'id': result[i].gerichtId };
            delete result[i].gerichtId;

            result[i].zutat = zutatDao.loadById(result[i].zutatId);
            delete result[i].zutatId;


            result[i].einheit = einheitDao.loadById(result[i].einheitId);
            delete result[i].einheitId;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Zutatenliste WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(gerichtId = 1, zutatId = 1, menge = 1, einheitId = 1) {
        var sql = 'INSERT INTO Zutatenliste (gerichtId,zutatId,menge,einheitId) VALUES (?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [gerichtId, zutatId, menge, einheitId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, gerichtId = 1, zutatId = 1, menge = 1, einheitId = 1) {
        var sql = 'UPDATE Zutatenliste SET gerichtId=?,zutatId=?,menge=?,einheitId=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [gerichtId, zutatId, menge, einheitId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Zutatenliste WHERE id=?';
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
            var sql = 'DELETE FROM Zutatenliste WHERE gerichtId=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by parent id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ZutatenlisteDao [_conn=' + this._conn + ']');
    }
}

module.exports = ZutatenlisteDao;