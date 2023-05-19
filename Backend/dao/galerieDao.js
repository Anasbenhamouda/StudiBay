const helper = require('../helper.js');

class GalerieDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Galerie WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result.erstellzeitpunkt));

        return result;
    }

    loadAll() {
        var sql = 'SELECT * FROM Galerie';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].erstellzeitpunkt = helper.formatToGermanDateTime(helper.parseSQLDateTimeString(result[i].erstellzeitpunkt));
        }
        
        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Galerie WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(name = '', dateigroesse = 0, mimeType = '', bildpfad = '', erstellzeitpunkt = null) {
        
        var sql = 'INSERT INTO Galerie (name,dateigroesse,mimeType,bildpfad,erstellzeitpunkt) VALUES (?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [name, dateigroesse, mimeType, bildpfad, helper.formatToSQLDateTime(erstellzeitpunkt)];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, name = '', dateigroesse = 0, mimeType = '', bildpfad = '', erstellzeitpunkt = null) {
        var sql = 'UPDATE Galerie SET name=?,dateigroesse=?,mimeType=?,bildpfad=?,erstellzeitpunkt=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [name, dateigroesse, mimeType, bildpfad, helper.formatToSQLDateTime(erstellzeitpunkt), id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Galerie WHERE id=?';
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
        console.log('GalerieDao [_conn=' + this._conn + ']');
    }
}

module.exports = GalerieDao;