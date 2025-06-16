// alarmRing.js

//backend/ring-alarm.jsでalarmの設定されている時間に
//通知を受け取ってalarmRing.htmlを表示する
const socket = io();

socket.on("alarm", (data) => {
    console.log("アラーム通知受信", data);

    //localStorageから現在のユーザーIDを取得
    const currentLoggedInUserId = localStorage.getItem('user_id');

    // サーバー（DB）から通知されたアラームのuser_id
    // これがDBのalarm_settingsテーブルから取得されたuser_id
    const alarmTriggeredUserId = data.user_id;

    // 現在ログインしているユーザーのIDと、アラームがトリガーされたユーザーのIDを比較
    if (currentLoggedInUserId && currentLoggedInUserId === String(alarmTriggeredUserId)) {
        console.log(`現在のユーザー(${currentLoggedInUserId})向けのアラームです。画面遷移します。`);
        window.location.href = "/HTML/alarmRing.html";
    } else {
        // user_idが一致しない場合、または現在のユーザーIDが取得できない場合
        console.log(`別ユーザー(${alarmTriggeredUserId})向けのアラーム通知のため、画面遷移しません。現在のユーザーID: ${currentLoggedInUserId}`);
    }
});


function stopAlarm() {
  const iframe = document.getElementById("alarm-sound");
  if (iframe) {
    iframe.remove(); // YouTubeの音を止める簡易的な方法
  }
  alert("アラームを停止しました");
  window.location.href = "home.html"; // ここでhome.htmlに遷移
}

function snoozeAlarm() {
  const iframe = document.getElementById("alarm-sound");
  if (iframe) {
    iframe.remove(); // 音を止める
  }
  alert("5分後に再アラームします");

  // 本当に5分後に再び鳴らす処理を行いたいなら、ここで別の処理が必要ですが、
  // 今回は仮に一旦ホームに戻るとしておきます。
  window.location.href = "home.html";
}
