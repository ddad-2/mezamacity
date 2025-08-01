// 時計の数字（1～12）を時計盤に動的に配置する関数
function placeNumbers() {
  const clock = document.getElementById('clock'); // 時計の親要素を取得
  const radius = 150; // 時計盤の半径（数字を配置する円の半径）
  const centerX = clock.clientWidth / 2; // 時計の中心X座標を取得
  const centerY = clock.clientHeight / 2; // 時計の中心Y座標を取得

  // 1から12までの数字を配置
  for (let i = 1; i <= 12; i++) {
    const numberEl = document.createElement('div'); // div要素を作成
    numberEl.classList.add('number'); // CSSクラス「number」を追加
    numberEl.textContent = i; // 数字テキストを設定

    // 時計盤の上での角度を計算（12時を-90度とする）
    const angle = (i * 30) - 90; // 30度刻み、12時は-90度

    // 角度をラジアンに変換（Math.cos, Math.sinはラジアン）
    const rad = angle * Math.PI / 180;

    // 時計中心からの数字のX,Y座標を計算
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);

    // CSSのleft/topで数字を配置
    numberEl.style.left = `${x}px`;
    numberEl.style.top = `${y}px`;

    // 時計要素に数字divを追加
    clock.appendChild(numberEl);
  }
}

// デジタル時計を更新する関数
function updateDigitalClock(date) {
  const digitalClock = document.getElementById('digital-clock');
  if (!digitalClock) return;
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  digitalClock.textContent = `${h}:${m}:${s}`;
}

// 時計針を滑らかに動かすメイン関数（PCの現在時刻を常に使用）
function startSmoothClock() {
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  // 一度だけアニメーションなしで現在時刻に針を設定
  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const secondsDeg = seconds * 6;
  const minutesDeg = minutes * 6;
  const hoursDeg = hours * 30;

  // アニメーションを一時的に無効に
  secondHand.style.transition = "none";
  minuteHand.style.transition = "none";
  hourHand.style.transition = "none";

  secondHand.style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;
  hourHand.style.transform = `translateX(-50%) rotate(${hoursDeg}deg)`;

  // デジタル時計も即時更新
  updateDigitalClock(now);

  // 次のフレームでアニメーションを有効化して更新ループを開始
  requestAnimationFrame(() => {
    secondHand.style.transition = "";
    minuteHand.style.transition = "";
    hourHand.style.transition = "";

    function update() {
      const now = new Date();
      const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = (now.getHours() % 12) + minutes / 60;

      const secondsDeg = seconds * 6;
      const minutesDeg = minutes * 6;
      const hoursDeg = hours * 30;

      secondHand.style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;
      minuteHand.style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;
      hourHand.style.transform = `translateX(-50%) rotate(${hoursDeg}deg)`;

      updateDigitalClock(now);
      requestAnimationFrame(update);
    }

    update(); // アニメーション付きでループ開始
  });
}

// ログアウト処理（仮）
function logout() {
  alert("ログアウトしました"); // 通知
  window.location.href = "login.html"; // ログインページへ遷移
}

// ページ読み込み完了時に実行する処理
window.onload = () => {
  placeNumbers();      // 時計の数字を配置
  startSmoothClock();  // アニメーション付き時計スタート
};
