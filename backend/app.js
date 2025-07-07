// node.js
// node app.jsというコマンドで実行
// http://localhost:3000 で確認

// npm install express 環境作成
// npm install mysql2  mysqlに接続
// npm install express-session リダイレクトを使用できる
// npm install bcryptjs ハッシュ化できる
// npm install socket.io リアルタイム通信
// npm install axios API通信

const express = require("express");
const path = require("path");
const pool = require("./db");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const { setupAlarmScheduler } = require("./ring-alarm");
const { clweather } = require('./weather'); // weather.jsからclweatherをインポート

// ルーティングファイルのインポート
const registerRoutes = require("./register");
const loginRoutes = require("./login");
const alarm = require("./alarm");

// --- Expressアプリケーションの初期化 (ここが重要: appオブジェクトを最初に定義) ---
const app = express(); 

// HTTPサーバー作成 (appを渡すため、appの定義後に配置)
const server = http.createServer(app);

// Socket.ioサーバー作成 (serverを渡すため、serverの定義後に配置)
const io = socketIo(server);

// ミドルウェア設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: 'your_secret_key', // 本番環境ではより複雑なキーに変更
    resave: false,
    saveUninitialized: true
}));

// Socket.io 接続イベント
io.on("connection", (socket) => {
    console.log("ユーザーが接続しました:", socket.id); // 接続確認用のログ
    
    // クライアントからの切断イベント
    socket.on('disconnect', () => {
        console.log("ユーザーが切断しました:", socket.id);
    });
});

// アラーム定期処理を起動
setupAlarmScheduler(io);

// --- ルート設定 (GETリクエスト) ---
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
app.get("/setting.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/HTML/setting.html"));
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

// --- ルーティング設定 (外部ファイルからのルート) ---
app.use("/register", registerRoutes);
app.use("/login", loginRoutes);
app.use('/alarm', alarm);

// --- サーバー起動 ---
server.listen(3000, () => {
    console.log("Server running on port 3000");
    console.log("http://localhost:3000 にアクセスしてください");

    // サーバー起動時に天気情報を取得
    fetchWeatherOnStartup();
});

// usersデータ取得API (動作確認用)
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

// --- 天気情報の処理 ---

// OpenWeatherMap APIキーを定義
// 環境変数から取得するのがベストプラクティスです。
// 例: process.env.OPEN_WEATHER_API_KEY
const OPEN_WEATHER_API_KEY = "a8e473938e3aaf3768ed900ee7d3f05f"; // YOUR_ACTUAL_API_KEY を適切なAPIキーに置き換える

// サーバー起動時に天気情報を一度取得する関数
async function fetchWeatherOnStartup() {
  try {
    const weatherData = await clweather(OPEN_WEATHER_API_KEY);
    console.log('現在の大阪の天気:', weatherData);
    // ここで取得した天気データを使って何か処理を行うことができます
    // 例: Socket.io でフロントエンドに送信する
    // io.emit('weatherUpdate', weatherData);
  } catch (err) {
    console.error('天気情報の取得中にエラーが発生しました:', err.message);
  }
}

// 必要であれば、特定のAPIエンドポイントで天気情報を取得できるようにすることもできます
app.get('/api/weather', async (req, res) => {
  try {
    const weatherData = await clweather(OPEN_WEATHER_API_KEY);
    res.json(weatherData);
  } catch (err) {
    console.error('API経由での天気取得エラー:', err);
    res.status(500).json({ error: '天気情報の取得に失敗しました' });
  }
});