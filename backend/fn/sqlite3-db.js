const sqlite3 = require('sqlite3')  
const dbPath = './db.sqlite3';

class DbFunction {
    constructor(){
        this.db = new sqlite3.Database(dbPath, err=>{
            if(err){
                console.log('Can not connect to sqliteDB'+ err);
            }
            else {
                console.log('SqliteDB connected');
            }
        });    
     }
     runQuery(query, params = []){
        return new Promise((resolve, reject)=>{
            this.db.run(query, params, err =>{
                if(err){
                    console.log('running error ' + query);
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
     }

     getOne(query, params = []){
         return new Promise((resolve, reject)=>{
             this.db.get(query, params, (err, result)=>{
                if(err){
                    console.log('running error ' + query);
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
             });
         });
     }

     getAll(query, params = []){
        return new Promise((resolve, reject)=>{
            this.db.all(query, params, (err, rows)=>{
               if(err){
                   console.log('running error ' + query);
                   console.log(err);
                   reject(err);
               }
               else {
                   resolve(rows);
               }
            });
        });
     }
     
}


module.exports = new DbFunction();
