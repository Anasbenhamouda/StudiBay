const helper = require('../helper.js');
const LandDao = require('./landDao.js');

class AdresseDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const landDao = new LandDao(this._conn);

        var sql = 'SELECT * FROM Adresse WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.land = landDao.loadById(result.landId);
        delete result.landId;

        return result;
    }

    loadAll() {
        const landDao = new LandDao(this._conn);

        var sql = 'SELECT * FROM Adresse';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].land = landDao.loadById(result[i].landId);
            delete result[i].landId;            
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Adresse WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(strasse = '', hausnummer = '', adresszusatz = '', plz = '', ort = '', landId = 1) {
        var sql = 'INSERT INTO Adresse (strasse,hausnummer,adresszusatz,plz,ort,landId) VALUES (?,?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [strasse, hausnummer, adresszusatz, plz, ort, landId];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, strasse = '', hausnummer = '', adresszusatz = '', plz = '', ort = '', landId = 1) {
        var sql = 'UPDATE Adresse SET strasse=?,hausnummer=?,adresszusatz=?,plz=?,ort=?,landId=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [strasse, hausnummer, adresszusatz, plz, ort, landId, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Adresse WHERE id=?';
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
        console.log('AdresseDao [_conn=' + this._conn + ']');
    }
}

module.exports = AdresseDao;