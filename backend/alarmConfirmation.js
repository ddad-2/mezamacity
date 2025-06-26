document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");

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
        card.innerHTML = `
          <div class="alarm-info">
            <h2 class="alarm-time">${alarm.alarm_time}</h2>
            <p class="alarm-days">${(alarm.weekdays || []).join(" ")}</p>
            <p class="alarm-sound">音: ${alarm.sound_name || "未設定"}</p>
            <p class="alarm-memo">メモ: ${alarm.note || "なし"}</p>
          </div>
          <div class="alarm-actions">
            <a href="alarm.html?edit=${alarm.setting_id}" class="edit-btn">編集</a>
            <button class="delete-btn" data-id="${alarm.setting_id}">削除</button>
          </div>
        `;
        container.appendChild(card);
      });

      // 削除ボタンのイベント設定（オプション）
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          if (confirm("このアラームを削除しますか？")) {
            fetch(`/alarm/delete/${id}`, { method: "DELETE" })
              .then(res => res.json())
              .then(result => {
                alert("アラームを削除しました");
                location.reload();
              });
          }
        });
      });
    })
    .catch(err => {
      console.error("アラーム取得エラー:", err);
      alert("アラーム一覧の取得に失敗しました。");
    });
});
