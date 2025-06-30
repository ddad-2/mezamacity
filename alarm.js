// alarm.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const axios = require("axios");

// アラーム登録処理
router.post("/", async (req, res) => {
    const { userId, soundId, alarmTime, youtubeUrl, weekdays } = req.body;

    if (!userId || !alarmTime) {
        return res.status(400).json({ error: "必要な情報が足りません" });
    }

    let finalSoundId = soundId;
    let transaction;

    try {
        transaction = await pool.promise().getConnection();
        await transaction.beginTransaction();

        // YouTube音源の場合
        if (youtubeUrl && youtubeUrl.trim() !== "") {
            const videoIdMatch = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            let videoTitle = "YouTube音源";

            if (videoId) {
                try {
                    const apiKey = process.env.YOUTUBE_API_KEY;
                    if (!apiKey) {
                        console.warn("YouTube API Key is not set. YouTube video title cannot be fetched.");
                    } else {
                        const ytRes = await axios.get(
                            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
                        );
                        if (
                            ytRes.data.items &&
                            ytRes.data.items.length > 0 &&
                            ytRes.data.items[0].snippet &&
                            ytRes.data.items[0].snippet.title
                        ) {
                            videoTitle = ytRes.data.items[0].snippet.title;
                        }
                    }
                } catch (e) {
                    console.error("YouTubeタイトル取得失敗:", e.message);
                }
            }

            const [rows] = await transaction.query(
                "SELECT sound_id FROM alarm_sounds WHERE sound_path = ?",
                [youtubeUrl]
            );
            if (rows.length > 0) {
                finalSoundId = rows[0].sound_id;
            } else {
                const [result] = await transaction.query(
                    "INSERT INTO alarm_sounds (sound_name, source_type, sound_path, created_at) VALUES (?, ?, ?, NOW())",
                    [videoTitle, 1, youtubeUrl]
                );
                finalSoundId = result.insertId;
            }
        }

        const [result] = await transaction.query(
            "INSERT INTO alarm_settings (user_id, sound_id, alarm_time, is_enabled, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())",
            [userId, finalSoundId, alarmTime]
        );
        const settingId = result.insertId;

        // 曜日繰り返しを登録
        if (Array.isArray(weekdays) && weekdays.length > 0) {
            for (const wd of weekdays) {
                let wdEn;
                switch (wd) {
                    case "月": wdEn = "Mon"; break;
                    case "火": wdEn = "Tue"; break;
                    case "水": wdEn = "Wed"; break;
                    case "木": wdEn = "Thu"; break;
                    case "金": wdEn = "Fri"; break;
                    case "土": wdEn = "Sat"; break;
                    case "日": wdEn = "Sun"; break;
                    default: wdEn = wd;
                }
                await transaction.query(
                    "INSERT INTO alarm_repeat_weekday (setting_id, weekday) VALUES (?, ?)",
                    [settingId, wdEn]
                );
            }
        }

        await transaction.commit();
        res.status(201).json({ message: "アラームが正常に登録されました", settingId: settingId });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("アラーム登録エラー:", err);
        res.status(500).json({ error: "アラームの登録に失敗しました。" });
    } finally {
        if (transaction) transaction.release();
    }
});

// アラーム一覧取得処理
router.get("/list/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: "ユーザーIDが必要です。" });
    }

    try {
        const [rows] = await pool.promise().query(
            `SELECT
                s.setting_id,
                s.alarm_time,
                s.is_enabled,
                GROUP_CONCAT(w.weekday ORDER BY FIELD(w.weekday, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')) AS weekdays,
                a.sound_name,
                a.sound_path,
                a.source_type
            FROM
                alarm_settings s
            LEFT JOIN
                alarm_repeat_weekday w ON s.setting_id = w.setting_id
            JOIN
                alarm_sounds a ON s.sound_id = a.sound_id
            WHERE
                s.user_id = ?
            GROUP BY
                s.setting_id
            ORDER BY
                s.alarm_time`,
            [userId]
        );

        const alarms = rows.map(alarm => {
            const japaneseWeekdays = [];
            if (alarm.weekdays) {
                const weekdaysArray = alarm.weekdays.split(',');
                weekdaysArray.forEach(wdEn => {
                    switch (wdEn) {
                        case "Mon": japaneseWeekdays.push("月"); break;
                        case "Tue": japaneseWeekdays.push("火"); break;
                        case "Wed": japaneseWeekdays.push("水"); break;
                        case "Thu": japaneseWeekdays.push("木"); break;
                        case "Fri": japaneseWeekdays.push("金"); break;
                        case "Sat": japaneseWeekdays.push("土"); break;
                        case "Sun": japaneseWeekdays.push("日"); break;
                    }
                });
            }
            return {
                ...alarm,
                weekdays: japaneseWeekdays.length > 0 ? japaneseWeekdays : [],
                display_sound_name: alarm.source_type === 1 ? `YouTube: ${alarm.sound_name}` : alarm.sound_name
            };
        });

        res.json(alarms);
    } catch (err) {
        console.error("アラーム一覧取得エラー:", err);
        res.status(500).json({ error: "サーバーエラーが発生しました。" });
    }
});

// アラーム削除処理
router.delete("/delete/:id", async (req, res) => {
    const settingId = req.params.id;
    let transaction;

    try {
        transaction = await pool.promise().getConnection();
        await transaction.beginTransaction();

        // 関連する曜日設定を先に削除
        await transaction.query(
            "DELETE FROM alarm_repeat_weekday WHERE setting_id = ?",
            [settingId]
        );

        // アラーム設定を削除
        await transaction.query(
            "DELETE FROM alarm_settings WHERE setting_id = ?",
            [settingId]
        );

        await transaction.commit();
        res.json({ message: "アラームが正常に削除されました" });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("アラーム削除エラー:", err);
        res.status(500).json({ error: "アラームの削除に失敗しました。" });
    } finally {
        if (transaction) transaction.release();
    }
});

// アラーム音源一覧取得処理
router.get("/sounds", async (req, res) => {
    try {
        const [rows] = await pool.promise().query("SELECT sound_id, sound_name, source_type, sound_path FROM alarm_sounds ORDER BY sound_id");
        res.json(rows);
    } catch (err) {
        console.error("アラーム音源取得エラー:", err);
        res.status(500).json({ error: "アラーム音源の取得に失敗しました。" });
    }
});

module.exports = router;