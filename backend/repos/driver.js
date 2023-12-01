var DbFunction = require('../fn/sqlite3-db');
const tableName = 'drivers';
/**
 * user type
 *  0 Location Identifier
 *  1 Request Management 
 *  2 Driver
 */
class DriverRepos {
    constructor(){
       
    this.createTable();

    }

    createTable() {
         const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (
            id     INTEGER , 
            status INTEGER,
            lat REAL,
            lng REAL,
            FOREIGN KEY(id) REFERENCES users(id)
          ); `;
       return DbFunction.runQuery(sql);
    }

    addDriver(ID) {
        return DbFunction.runQuery(`INSERT INTO ${tableName}  (ID, STATUS, LAT,LNG) VALUES (?,?,?,?)`,
        [ID, 0, 0, 0]);
    }
    remove(id) {
        return DbFunction.runQuery(`UPDATE ${tableName} SET isDelete = ? WHERE id = ?`, [1 ,id]);
    }

    getById(id) {
        return DbFunction.getOne(`SELECT * FROM ${tableName} WHERE id = ?`, [id])
    }
    getByIdStt0(id) {
        return DbFunction.getOne(`SELECT * FROM ${tableName} WHERE id = ? and status = 0`, [id])

    }
    getAll() {
        return DbFunction.getAll(`SELECT * FROM  ${tableName}`);
    }
    dropTable(){
        return DbFunction.runQuery(`Drop table IF EXISTS   ${tableName}`);

    }
    changeStt(stt , id) {
        return DbFunction.runQuery(`UPDATE ${tableName} SET status = ? WHERE id = ?`, [stt ,id]);

    }
}



module.exports = new DriverRepos();