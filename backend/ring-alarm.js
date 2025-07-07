//アラームを鳴らして画面遷移する
const pool = require("./db");

function setupAlarmScheduler(io) {
    setInterval(async () => {
        try {
            const now = new Date();
            const hhmm = now.toTimeString().slice(0, 5); // 例: "07:30"

            //曜日を英語表記に変換
            const jsDay = now.getDay();
            const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][jsDay];


            const [rows] = await pool.promise().query(`
                SELECT s.setting_id, s.user_id, s.alarm_time, s.sound_id
                FROM alarm_settings s
                JOIN alarm_repeat_weekday w ON s.setting_id = w.setting_id
                WHERE s.is_enabled = 1
                    AND s.alarm_time = ?
                    AND w.weekday = ?
            `, [hhmm, weekdayEn]);

            for (const row of rows) {
                // アラームをクライアントに通知
                io.emit("alarm", {
                    user_id: row.user_id,
                    alarm_time: row.alarm_time,
                    sound_id: row.sound_id
                });
                console.log(`🔔 Alarm for user_id=${row.user_id} at ${row.alarm_time}`);

                // アラームを無効化（is_enabled = 0）
                // await pool.promise().query(`
                //     UPDATE alarm_settings SET is_enabled = 0 WHERE setting_id = ?
                // `, [row.setting_id]);
            }

        } catch (err) {
            console.error("アラームスケジューラエラー:", err);
        }
    }, 60 * 1000); // 毎分チェック
}

module.exports = { setupAlarmScheduler };
