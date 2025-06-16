// node.js
// node app.jsというコマンドで実行
//http://localhost:3000 で確認

// npm install express 環境作成
//npm install mysql2  mysqlに接続

const express = require("express");
const mysql = require("mysql2");
const app = express();


//htmlフォームから送られてくるデータを解析するために必要
app.use(express.urlencoded({ extended: true}));
//json形式のボディを解析するために必要
app.use(express.json());

//起動してイルカの確認
app.get("/", (req, res) => {
    res.send("Hello Node.js!");
});

//サーバー起動
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// MySQLの接続情報を定義
const connection = mysql.createConnection({
    host: "localhost",
    user: "mezamacity",
    password: "city",
    database: "mezamacity_db",
});

// MySQLに接続
connection.connect((err) => {
    if (err) {
        console.error("MySQL connection error:", err);
        return;
    }
    console.log("Connected to MySQL!");
});

//usersのデータを取得するAPI(動作確認用)
app.get("/users", (req, res) => {
    connection.query("SELECT * FROM users", (err, results) => {
        if(err) {
            console.error("Query error:", err);
            res.status(500).send("DB Error");
            return;
        }
        //表示
        console.log("DB raw results", results);
        res.json(results);
    })
})

//新規登録のデータを処理するAPIエンドポイント
//register.jsに移行する予定
app.post("/register", (req, res) => {
    //HTMLフォームから送られてきたデータはreq.bodyに入っている
    const { username, email, password, 'confirm-password': confirmPassword} = req.body;

    if(password !== confirmPassword)  {
        return res.status(400).send("パスワードが一致しません");
    }

    const query = 'INSERT INTO users (user_name, password, email) VALUES (?, ?, ?)';
    const values = [username, password, email]; //todo パスワードハッシュ化
    connection.query(query, values, (err, results) => {
        if(err) {
            console.error("ユーザー登録エラー:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send("ユーザー名またはメールアドレスが既に使用されています");
            }
        }
        console.log("ユーザー登録成功:", results);
        res.status(201).send("ユーザー登録が完了しました");
    });
});