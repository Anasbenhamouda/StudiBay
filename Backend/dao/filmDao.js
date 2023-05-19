const helper = require('../helper.js');
const FilmgenreDao = require('./filmgenreDao.js');

class FilmDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) {
        const filmgenreDao = new FilmgenreDao(this._conn);

        var sql = 'SELECT * FROM Film WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.genre = filmgenreDao.loadById(result.genreId);
        delete result.genreId;

        return result;
    }

    loadAll() {
        const filmgenreDao = new FilmgenreDao(this._conn);

        var sql = 'SELECT * FROM Film';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].genre = filmgenreDao.loadById(result[i].genreId);
            delete result[i].genreid;
        }

        return result;
    }

    exists(id) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Film WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(bezeichnung = '', beschreibung = '', genreId = 1, fsk = 12, dauer = 90, regie = '', darsteller = '', preis = 9.0, coverpfad = null, videopfad = null, imdb = null) {
        var sql = 'INSERT INTO Film (bezeichnung,beschreibung,genreId,fsk,dauer,regie,darsteller,preis,coverpfad,videopfad,imdb) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, genreId, fsk, dauer, regie, darsteller, preis, coverpfad, videopfad, imdb];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

        return this.loadById(result.lastInsertRowid);
    }

    update(id, bezeichnung = '', beschreibung = '', genreId = 1, fsk = 12, dauer = 90, regie = '', darsteller = '', preis = 9.0, coverpfad = null, videopfad = null, imdb = null) {
        var sql = 'UPDATE Film SET bezeichnung=?,beschreibung=?,genreId=?,fsk=?,dauer=?,regie=?,darsteller=?,preis=?,coverpfad=?,videopfad=?,imdb=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [bezeichnung, beschreibung, genreId, fsk, dauer, regie, darsteller, preis, coverpfad, videopfad, imdb, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Film WHERE id=?';
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
        console.log('FilmDao [_conn=' + this._conn + ']');
    }
}

module.exports = FilmDao;