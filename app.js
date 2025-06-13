// node.js
// node app.jsというコマンドで実行
//http://localhost:3000 で確認

//npm install express 環境作成
//npm install mysql2  mysqlに接続
//npm install express-session リダイレクトを使用できる
//npm install bcryptjs ハッシュ化できる

const express = require("express");
const path = require("path");
const pool = require("./db");

//新しいルーティングファイルをインポート
const registerRoutes = require("./register");
const loginRoutes = require("./login");

const app = express();

//htmlフォームから送られてくるデータを解析するために必要
app.use(express.urlencoded({ extended: true}));
//json形式のボディを解析するために必要
app.use(express.json());

//htmlファイルのあるパス 環境によって変える
app.use(express.static(path.join(__dirname, "../frontend/public")));

//リダイレクトをするため
const session = require("express-session");
app.use(session({
    secret: 'your_secret_key', // 環境に合わせて
    resave: false,
    saveUninitialized: true
}));

//起動しているかの確認
//ルート追加していかないといけない
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/home.html"))
});
app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/register.html"));
});
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/login.html"));
});
app.get("/alarm.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/alarm.html"));
});
app.get("/settings.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/settings.html"));
});
app.get("/game.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/HTML/game.html"));
});

app.use("/register", registerRoutes); // /register への処理を register.jsで処理
app.use('/login', loginRoutes);

//サーバー起動
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

//usersのデータを取得するAPI(動作確認用)
app.get("/users", (req, res) => {
    pool.query("SELECT * FROM users", (err, results) => {
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

