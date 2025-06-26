// alarm.js
const express = require("express");
const router = express.Router();
const pool = require("./db");

// アラーム登録処理
router.post("/", (req, res) => {
    const { userId, soundId, alarmTime } = req.body;

    if (!userId || !soundId || !alarmTime) {
        return res.status(400).json({ error: "必要な情報が足りません" });
    }

    const sql = "INSERT INTO alarm_settings (user_id, sound_id, alarm_time) VALUES (?, ?, ?)";
    pool.query(sql, [userId, soundId, alarmTime], (err, result) => {
        if (err) {
            console.error("Insert Error:", err);
            return res.status(500).json({ error: "データベースエラーが発生しました。" });
        }

        res.json({
            message: "アラーム設定を保存しました。",
            userId: userId,
            alarmTime: alarmTime,
            settingId: result.insertId
        });
    });
});

// アラーム一覧取得処理（ユーザーIDに紐づく）
router.get("/list/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const [alarms] = await pool.promise().query(`
            SELECT s.setting_id, s.alarm_time, s.sound_id, a.sound_name, s.is_enabled
            FROM alarm_settings s
            LEFT JOIN alarm_sounds a ON s.sound_id = a.sound_id
            WHERE s.user_id = ?
            ORDER BY s.alarm_time ASC
        `, [userId]);

        const [weekdays] = await pool.promise().query(`
            SELECT setting_id, weekday
            FROM alarm_repeat_weekday
            WHERE setting_id IN (SELECT setting_id FROM alarm_settings WHERE user_id = ?)
        `, [userId]);

        // 曜日をアラームごとにまとめる
        const weekdayMap = {};
        weekdays.forEach(row => {
            if (!weekdayMap[row.setting_id]) {
                weekdayMap[row.setting_id] = [];
            }
            weekdayMap[row.setting_id].push(row.weekday);
        });

        const result = alarms.map(alarm => ({
            ...alarm,
            weekdays: weekdayMap[alarm.setting_id] || []
        }));

        res.json(result);
    } catch (err) {
        console.error("アラーム一覧取得エラー:", err);
        res.status(500).json({ error: "サーバーエラーが発生しました。" });
    }
});

//アラーム削除処理
router.delete("/delete/:id", async (req, res) => {
    const settingId = req.params.id;

    try {
        await pool.promise().query(
            "DELETE FROM alarm_settings WHERE setting_id = ?",
            [settingId]
        );

        res.json({ message: "削除成功"});
    } catch (err) {
        console.error("削除エラー:", err);
        res.status(500).json({error: "削除に失敗しました。"});
    }
});

module.exports = router;
