//mysqlからデータを取ってくる

//const pool = require("./db");でこのファイルを使用できる

const mysql = require("mysql2");

// MySQLの接続情報を定義
const pool = mysql.createPool({
    host: "localhost",
    user: "mezamacity",
    password: "city",
    database: "mezamacity_db",
    waitForConnections: true, //プール内の接続が使い果たされた場合に待機するか
    connectionLimit: 20, //プール内の最大接続数
    queueLimit: 0 //接続要求のキューイング制限(0は無限)
});

// MySQLに接続
pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection error:", err);
        return;
    }
    console.log("Connected to MySQL via pool!");
    connection.release(); //接続をプールに戻す
});

module.exports = pool; //poolオブジェクトをエクスポート