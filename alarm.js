//アラームの設定

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'mezamacity',
  password: 'city',
  database: 'mezamacity_db',
});

// Mezamacityのアラーム登録API
app.post('/api/alarms', async (req, res) => {
  const { userId, alarmTime, label, repeatDays, alarmSoundId, enabled } = req.body;

  if (!userId || !alarmTime) {
    return res.status(400).json({ error: 'userIdとalarmTimeは必須です' });
  }

  try {
    const sql = `
      INSERT INTO alarms (user_id, alarm_time, label, repeat_days, alarm_sound_id, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      userId,
      alarmTime,
      label || '',
      repeatDays || null,
      alarmSoundId || null,
      enabled === undefined ? true : enabled,
    ]);

    res.json({ message: 'アラームを保存しました', alarmId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データベース保存中にエラーが発生しました' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mezamacity API running on http://localhost:${PORT}`);
});
