const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// ミドルウェア設定
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 静的ファイル（例: index.html）を提供
app.use(express.static(path.join(__dirname)));

// DB接続プール
const pool = mysql.createPool({
  host: 'localhost',
  user: 'mezamacity',
  password: 'city',
  database: 'mezamacity_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// フロントページ（例: /index.htmlを返す）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// アラーム設定API
app.post('/api/alarms', async (req, res) => {
  const {
    user_id,
    sound_id,
    alarm_time,
    is_enabled = true,
    repeat_weekdays = [],
    repeat_days = []
  } = req.body;

  if (!user_id || !sound_id || !alarm_time) {
    return res.status(400).json({ error: 'user_id, sound_id, alarm_time are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. ALARM_SETTINGS に登録
    const [result] = await connection.execute(
      `INSERT INTO ALARM_SETTINGS (user_id, sound_id, alarm_time, is_enabled) VALUES (?, ?, ?, ?)`,
      [user_id, sound_id, alarm_time, is_enabled ? 1 : 0]
    );
    const setting_id = result.insertId;

    // 2. 曜日繰り返しの登録
    if (repeat_weekdays.length > 0) {
      const weekdayRows = repeat_weekdays.map(weekday => [setting_id, weekday]);
      await connection.query(
        `INSERT INTO ALARM_REPEAT_WEEKDAY (setting_id, weekday) VALUES ?`,
        [weekdayRows]
      );
    }

    // 3. 特定日繰り返しの登録
    if (repeat_days.length > 0) {
      const repeatDayRows = repeat_days.map(date => [setting_id, date]);
      await connection.query(
        `INSERT INTO ALARM_REPEAT_DAY (setting_id, repeat_day) VALUES ?`,
        [repeatDayRows]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Alarm setting created', setting_id });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Database error', details: error.message });
  } finally {
    connection.release();
  }
});

// サーバー起動（3000ポート）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
