//dbに登録されている時間になったらアラームを鳴らす処理
//一旦dbからは取ってこないでする
//まだテストをしていない
const pool = require("./db");

function setupAlarmScheduler(io) {
    setInterval(async () => {
        try {
            const now = new Date();
            const hhmm = now.toTimeString().slice(0, 5); // 例: "07:30"
            const dayOfWeek = now.getDay(); // 0(日)〜6(土)

            // アラーム時間と曜日が一致する設定を取得
            const [rows] = await pool.promise().query(`
                SELECT s.user_id, s.alarm_time, s.sound_id
                FROM ALARM_SETTING s
                LEFT JOIN ALARM_REPET_WEEKDAY w ON s.setting_id = w.setting_id
                WHERE s.is_enabled = 1 AND s.alarm_time = ? AND w.repeat_weekday = ?
            `, [hhmm, dayOfWeek]);

            rows.forEach(row => {
                io.emit("alarm", {
                    user_id: row.user_id,
                    alarm_time: row.alarm_time,
                    sound_id: row.sound_id
                });
                console.log(`🔔 Alarm for user_id=${row.user_id} at ${row.alarm_time}`);
            });

        } catch (err) {
            console.error("アラームスケジューラエラー:", err);
        }
    }, 60 * 1000); // 毎分チェック
}

module.exports = { setupAlarmScheduler };
