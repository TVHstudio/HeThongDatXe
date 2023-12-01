var DbFunction = require('../fn/sqlite3-db');
const tableName = 'users';
/**
 * user type
 *  0 Location Identifier
 *  1 Request Management 
 *  2 Driver
 */
class UserRepos {
    constructor(){
       
    this.createTable();

    }

    createTable() {
         const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (
             id INTEGER PRIMARY KEY AUTOINCREMENT, 
             username TEXT,
             password INTERGER,
             type INTERGER,
             rfToken TEXT,
             iat INTERGER
         ) `;
       return DbFunction.runQuery(sql);
    }

    addUser(username, type) {
        return DbFunction.runQuery(`INSERT INTO ${tableName}  (username, password, type, rfToken, iat) VALUES (?,?,?,?,?)`,
        [username, username, type, "", 0]);
    }
    changPassword(username, newpassword) {
        return DbFunction.runQuery(`UPDATE ${tableName} SET password = ? WHERE username = ?`,
        [newpassword, username]);
    }
    login(username, password, type) {
        return DbFunction.getOne(`SELECT * FROM ${tableName}  WHERE username = ? AND password = ? AND type = ?`,
        [username, password, type]);
    }
    getByToken(id, token){
        return DbFunction.getOne(`SELECT * FROM ${tableName}  WHERE id = ? AND rfToken = ?`,
        [id, token]);
    }

    remove(id) {
        return DbFunction.runQuery(`UPDATE ${tableName} SET isDelete = ? WHERE id = ?`, [1 ,id]);
    }

    getById(id) {
        return DbFunction.getOne(`SELECT * FROM ${tableName} WHERE id = ?`, [id])
    }
    getByUserName(username) {
        return DbFunction.getOne(`SELECT * FROM ${tableName} WHERE username = ?`, [username])
    }
    getAll() {
        return DbFunction.getAll(`SELECT * FROM  ${tableName}`);
    }
    dropTable(){
        return DbFunction.runQuery(`Drop table IF EXISTS   ${tableName}`);

    }
    addNewUser(username, password , type) {
        return DbFunction.runQuery(`INSERT INTO ${tableName}  (username, password, type, rfToken, iat) VALUES (?,?,?,?,?)`,
        [username, password, type, "", 0]);
    }
}



module.exports = new UserRepos();