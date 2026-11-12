const {Pool}= require("pg");

const pool= new Pool({
    user:"postgres",
    host:"localhost",
    database:"serviceconnect",
    password:"b8s34316",
    port:5432
});

module.exports=pool;