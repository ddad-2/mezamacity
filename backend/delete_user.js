const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

// DB接続設定
const dbConfig = {
  host: 'localhost',
  user: 'mezamacity',
  password: 'city',
  database: 'mezamacity_db',
  charset: 'utf8mb4'
};

// ユーザー削除エンドポイント
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  const connection = await mysql.createConnection(dbConfig);
  try {
    await connection.beginTransaction();

    // 1. アラーム設定ID取得
    const [settings] = await connection.query(
      'SELECT setting_id FROM ALARM_SETTINGS WHERE user_id = ?', [userId]
    );
    const settingIds = settings.map(row => row.setting_id);

    if (settingIds.length > 0) {
      // 2. 関連テーブル削除
      await connection.query(
        'DELETE FROM ALARM_REPEAT_WEEKDAY WHERE setting_id IN (?)',
        [settingIds]
      );
      await connection.query(
        'DELETE FROM ALARM_REPEAT_DAY WHERE setting_id IN (?)',
        [settingIds]
      );
      await connection.query(
        'DELETE FROM ALARM_SETTINGS WHERE setting_id IN (?)',
        [settingIds]
      );
    }

    // 3. 建物の削除
    await connection.query(
      'DELETE FROM CITY_BUILDINGS WHERE user_id = ?',
      [userId]
    );

    // 4. ユーザー削除
    const [result] = await connection.query(
      'DELETE FROM USERS WHERE user_id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'ユーザーが存在しません' });
    }

    await connection.commit();
    res.json({ message: 'ユーザーを削除しました' });

  } catch (err) {
    await connection.rollback();
    console.error('削除中にエラー:', err);
    res.status(500).json({ message: '削除中にエラーが発生しました' });
  } finally {
    await connection.end();
  }
});

app.listen(PORT, () => {
  console.log(`サーバー起動中（http://localhost:${PORT}）`);
});