const helper = require('../helper.js');

class ProduktbildDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Produktbild WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.produkt = { 'id': result.produktId };
        delete result.produktId;

        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM Produktbild';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].produkt = { 'id': result[i].produktId };
            delete result[i].produktId;
        }

        return result;
    }

    loadByParent(id) {
        var sql = 'SELECT * FROM Produktbild WHERE produktId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(id);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].produkt = { 'id': result[i].produktId };
            delete result[i].produktId;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Produktbild WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bildpfad = '', produktId = 1) {
        var sql = 'INSERT INTO Produktbild (bildpfad,produktId) VALUES (?,?)';
        var statement = this._conn.prepare(sql);
        var params = [bildpfad, produktId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, bildpfad = '', produktId = 1) {
        var sql = 'UPDATE Produktbild SET bildpfad=?,produktId=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [bildpfad, produktId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Produktbild WHERE id=?';
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
            var sql = 'DELETE FROM Produktbild WHERE produktId=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by id=' + produktid + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('ProduktbildDao [_conn=' + this._conn + ']');
    }
}

module.exports = ProduktbildDao;