const helper = require('../helper.js');
const ProduktDao = require('./produktDao.js');

class BestellpositionDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const produktDao = new ProduktDao(this._conn);

        var sql = 'SELECT * FROM Bestellposition WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.bestellung = { 'id': result.bestellungId };
        delete result.bestellungId;
        
        result.produkt = produktDao.loadById(result.produktId);
        delete result.produktId;

        result.mehrwertsteuersumme = helper.round(result.menge * result.produkt.mehrwertsteueranteil);
        result.nettosumme = helper.round(result.menge * result.produkt.nettopreis);
        result.bruttosumme = helper.round(result.menge * result.produkt.bruttopreis);

        return result;
    }

    loadAll() {
        const produktDao = new ProduktDao(this._conn);

        var sql = 'SELECT * FROM Bestellposition';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].bestellung = { 'id': result[i].bestellungId };
            delete result[i].bestellungId;

            result[i].produkt = produktDao.loadById(result[i].produktId);
            delete result[i].produktId;

            result[i].mehrwertsteuersumme = helper.round(result[i].menge * result[i].produkt.mehrwertsteueranteil);
            result[i].nettosumme = helper.round(result[i].menge * result[i].produkt.nettopreis);
            result[i].bruttosumme = helper.round(result[i].menge * result[i].produkt.bruttopreis);
        }

        return result;
    }

    loadByParent(bestellungId) {
        const produktDao = new ProduktDao(this._conn);

        var sql = 'SELECT * FROM Bestellposition WHERE bestellungId=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(bestellungId);

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].bestellung = { 'id': result[i].bestellungId };
            delete result[i].bestellungId;

            result[i].produkt = produktDao.loadById(result[i].produktId);
            delete result[i].produktId;

            result[i].mehrwertsteuersumme = helper.round(result[i].menge * result[i].produkt.mehrwertsteueranteil);
            result[i].nettosumme = helper.round(result[i].menge * result[i].produkt.nettopreis);
            result[i].bruttosumme = helper.round(result[i].menge * result[i].produkt.bruttopreis);
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Bestellposition WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bestellungId = 1, produktId = 1, menge = 1) {
        var sql = 'INSERT INTO Bestellposition (bestellungId,produktId,menge) VALUES (?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [bestellungId, produktId, menge];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, bestellungId = 1, produktId = 1, menge = 1) {
        var sql = 'UPDATE Bestellposition SET bestellungId=?,produktId=?,menge=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [bestellungId, produktId, menge, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Bestellposition WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    deleteByParent(bestellungId) {
        try {
            var sql = 'DELETE FROM Bestellposition WHERE bestellungId=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(bestellungId);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Records by bestellungid=' + bestellungid + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('BestellpositionDao [_conn=' + this._conn + ']');
    }
}

module.exports = BestellpositionDao;