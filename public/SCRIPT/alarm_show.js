// アラーム一覧の表示のみ（削除処理なし）
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("ログインしてください");
    window.location.href = "login.html";
    return;
  }

  fetch(`/alarm/list/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        document.querySelector(".list-container").innerHTML += "<p>アラームが登録されていません。</p>";
        return;
      }

      const container = document.querySelector(".list-container");

      data.forEach(alarm => {
        const card = document.createElement("div");
        card.className = "alarm-card";

        const weekdayText = (alarm.weekdays && alarm.weekdays.length > 0)
          ? alarm.weekdays.join("・")
          : "曜日設定なし";

        card.innerHTML = `
          <div class="alarm-info">
            <h2 class="alarm-time">${alarm.alarm_time}</h2>
            <p class="alarm-weekdays">曜日: ${weekdayText}</p>
            <p class="alarm-sound">音: ${alarm.sound_name || "未設定"}</p>
            <p class="alarm-status">状態: ${alarm.is_enabled ? "有効" : "無効"}</p>
          </div>
          <div class="alarm-actions">
            <a href="alarmEditing.html?edit=${alarm.setting_id}" class="edit-btn">編集</a>
            <button class="delete-btn" data-id="${alarm.setting_id}">削除</button>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("アラーム取得エラー:", err);
      alert("アラーム一覧の取得に失敗しました。");
    });
});
