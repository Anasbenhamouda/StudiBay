const helper = require('../helper.js');

class ReserviertersitzDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM ReservierterSitz WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.reservierung = { 'id': result.reservierungId };
        delete result.reservierungId;

        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM ReservierterSitz';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].reservierung = { 'id': result[i].reservierungId };
            delete result[i].reservierungId;
        }

        return result;
    }

    loadAllByParent(id) {
        var sql = 'SELECT * FROM ReservierterSitz WHERE reservierungId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];
        
        for (var i = 0; i < result.length; i++) {
            result[i].reservierung = { 'id': result[i].reservierungId };
            delete result[i].reservierungId;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM ReservierterSitz WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(reservierungId = 1, reihe = 1, sitzplatz = 1) {
        var sql = 'INSERT INTO ReservierterSitz (reservierungId,reihe,sitzplatz) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [reservierungId, reihe, sitzplatz];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, reservierungId = 1, reihe = 1, sitzplatz = 1) {
        var sql = 'UPDATE ReservierterSitz SET reservierungId=?,reihe=?,sitzplatz=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [reservierungId, reihe, sitzplatz, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM ReservierterSitz WHERE id=?';
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
            var sql = 'DELETE FROM ReservierterSitz WHERE reservierungId=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by parent id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ReserviertersitzDao [_conn=' + this._conn + ']');
    }
}

module.exports = ReserviertersitzDao;