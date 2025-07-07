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
                "SELECT sound_id FROM alarm_sounds WHERE sound_url = ?",
                [youtubeUrl]
            );
            if (rows.length > 0) {
                finalSoundId = rows[0].sound_id;
            } else {
                const [result] = await transaction.query(
                    "INSERT INTO alarm_sounds (sound_name, source_type, sound_url, created_at) VALUES (?, ?, ?, NOW())",
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
                a.sound_url,
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
        const [rows] = await pool.promise().query("SELECT sound_id, sound_name, source_type, sound_url FROM alarm_sounds ORDER BY sound_id");
        res.json(rows);
    } catch (err) {
        console.error("アラーム音源取得エラー:", err);
        res.status(500).json({ error: "アラーム音源の取得に失敗しました。" });
    }
});

//アラームの編集画面に既存データを表示する
router.get("/detail/:id", async (req, res) => {
    const settingId = req.params.id;

    try {
        //アラーム設定とサウンド情報の取得
        const [alarmRows] = await pool.promise().query(
            `SELECT s.setting_id, s.alarm_time, s.sound_id, s.is_enabled, a.source_type, a.sound_url
            FROM alarm_settings s
            LEFT JOIN alarm_sounds a ON s.sound_id = a.sound_id
            WHERE s.setting_id = ?`, [settingId]
        );

        if (alarmRows.length === 0) {
            return res.status(404).json({ error: "アラームが見つかりません"});
        }

        const alarm = alarmRows[0];

        //曜日情報を取得
        const [weekdayRows] = await pool.promise().query(
            `SELECT weekday FROM alarm_repeat_weekday WHERE setting_id = ?`, [settingId]
        );
        const weekdays = weekdayRows.map(row => row.weekday);

        res.json({
            setting_id: alarm.setting_id,
            alarm_time: alarm.alarm_time,
            sound_id: alarm.sound_id,
            source_type: alarm.source_type,
            sound_url: alarm.sound_url,
            weekdays: weekdays
        });
    } catch (err) {
        console.error("アラーム詳細エラー:", err);
        res.status(500).json({ error: "サーバーエラー" });
    }
});

//編集内容を保存する
router.put("/:id", async (req, res) => {
    const settingId = req.params.id;
    const {alarmTime, soundId, youtubeUrl, weekdays} = req.body;

    try {
        // alarm_soundsからYouTube用のIDを取得または追加
        let finalSoundId = soundId;
        if (youtubeUrl && youtubeUrl.trim() !== "") {
            const [existing] = await pool.promise().query(
                `SELECT sound_id FROM alarm_sounds WHERE sound_url = ? AND source_type = 1`,
                [youtubeUrl]
            );

            if (existing.length > 0) {
                finalSoundId = existing[0].sound_id;
            } else {
                const [result] = await pool.promise().query(
                    `INSERT INTO alarm_sounds (sound_name, sound_url, source_type)
                        VALUES (?, ?, 1)`,
                    ["YouTubeアラーム", youtubeUrl]
                );
                finalSoundId = result.insertId;
            }
        }

        // アラーム設定の更新
        await pool.promise().query(
            `UPDATE alarm_settings SET alarm_time = ?, sound_id = ?, is_enabled = 1 WHERE setting_id = ?`,
            [alarmTime, finalSoundId, settingId]
        )

        //曜日再登録
        await pool.promise().query(
            `DELETE FROM alarm_repeat_weekday WHERE setting_id = ?`,
            [settingId]
        )

        if (Array.isArray(weekdays)) {
            for (const day of weekdays) {
                await pool.promise().query(
                    `INSERT INTO alarm_repeat_weekday (setting_id, weekday) VALUES (?, ?)`,
                    [settingId, day]
                );
            }
        }
        res.json({message: "アラームが更新されました"});
    } catch (err) {
        console.error("アラーム更新エラー:", err);
        res.status(500).json({ error: "アラームの更新に失敗しました。" });
    }
});

module.exports = router;