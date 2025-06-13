// alarmRing.js

function stopAlarm() {
  const audio = document.getElementById("alarm-sound");
  audio.pause();
  audio.currentTime = 0;
  alert("アラームを停止しました");
  // 必要に応じてリダイレクトなど
  // window.location.href = 'home.html';
}

function snoozeAlarm() {
  const audio = document.getElementById("alarm-sound");
  audio.pause();
  alert("5分後に再アラームします");
  // 必要に応じてスヌーズ処理追加
  setTimeout(() => {
    audio.play();
  }, 5 * 60 * 1000); // 5分後に再生
}

window.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("alarm-sound");

  // ユーザーが初めて何かをクリックしたときに再生
  document.body.addEventListener(
    "click",
    () => {
      if (audio.paused) {
        audio.play().catch((error) => {
          console.error("再生エラー:", error);
        });
      }
    },
    { once: true }
  );

  // 現在時刻を表示（任意）
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  document.getElementById("current-time").textContent = `${hh}:${mm}`;
});
