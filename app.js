// node.js
// node app.jsというコマンドで実行
//http://localhost:3000 で確認

//npm install express 環境作成
//npm install mysql2  mysqlに接続
//npm install express-session リダイレクトを使用できる
//npm install bcryptjs ハッシュ化できる
//npm install socket.io リアルタイム通信
//npm install axios API通信

const express = require("express");
const path = require("path");
const pool = require("./db");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const { setupAlarmScheduler } = require("./ring-alarm");

// ルーティングファイルのインポート
const registerRoutes = require("./register");
const loginRoutes = require("./login");
const alarm = require("./alarm")

const app = express();

// HTTPサーバー作成
const server = http.createServer(app);

// Socket.ioサーバー作成
const io = socketIo(server);

// ミドルウェア設定（一度だけ記述）
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Socket.io 接続イベント
io.on("connection", (socket) => {
    //console.log("ユーザーが接続しました");
});

// アラーム定期処理を起動（ring-alarm.jsの関数があれば）
setupAlarmScheduler(io);

// ルート設定
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/home.html"));
});
app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/register.html"));
});
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/login.html"));
});
app.get("/home.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/home.html"));
});
app.get("/alarm.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/alarm.html"));
});
app.get("/settings.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/settings.html"));
});
app.get("/game.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/game.html"));
});
app.get("/alarmRing.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..//public/HTML/alarmRing.html"));
});
app.get("/alarmConfimation.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/alarmConfimation.html"));
});

// ルーティング設定
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use('/alarm', alarm);

// サーバー起動はserver.listenに変更
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

// usersデータ取得API(動作確認用)
app.get("/users", (req, res) => {
    pool.query("SELECT * FROM users", (err, results) => {
        if(err) {
            console.error("Query error:", err);
            res.status(500).send("DB Error");
            return;
        }
        console.log("DB raw results", results);
        res.json(results);
    });
});
