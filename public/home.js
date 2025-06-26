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

// 時計針の初期時刻をAPIから取得する関数（非同期）
async function fetchInitialTime() {
  try {
    const response = await fetch('http://worldtimeapi.org/api/ip'); // APIにアクセス
    if (!response.ok) throw new Error('API通信エラー'); // エラーチェック
    const data = await response.json(); // JSONを取得
    return new Date(data.datetime); // 取得した日時をDateオブジェクトに変換して返す
  } catch (error) {
    console.error('時刻APIの取得失敗:', error); // 失敗時はエラー表示
    return new Date(); // 現地の現在日時を返す（フォールバック）
  }
}

// 時計針を滑らかに動かすメイン関数（非同期）
async function startSmoothClock() {
  let baseTime = await fetchInitialTime(); // 初期時刻をAPIから取得
  let baseLocalTime = performance.now(); // 現在の高精度タイムスタンプを取得

  // 時計針を更新し続ける内部関数
  function update() {
    // 経過時間（秒）
    const elapsed = (performance.now() - baseLocalTime) / 1000;
    // 現在時刻を計算（初期時刻 + 経過秒数）
    const now = new Date(baseTime.getTime() + elapsed * 1000);

    // 秒、分、時を小数で計算
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    // それぞれの針の角度を計算（秒・分は6度/秒、時は30度/時間）
    const secondsDeg = seconds * 6;
    const minutesDeg = minutes * 6;
    const hoursDeg = hours * 30;

    // 時計針要素のtransformで回転を指定（translateX(-50%)は中心調整）
    document.getElementById('second-hand').style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hoursDeg}deg)`;

    requestAnimationFrame(update); // 次のフレームで再度updateを呼ぶ（滑らかに動かす）
  }

  update(); // 最初のupdate呼び出し

  // 10分ごとにAPIから時刻を再取得し、基準時刻を更新
  setInterval(async () => {
    baseTime = await fetchInitialTime();
    baseLocalTime = performance.now();
  }, 10 * 60 * 1000);
}

// ログアウト処理（仮）
function logout() {
  alert("ログアウトしました"); // 通知
  window.location.href = "login.html"; // ログインページへ遷移
}

// ページ読み込み完了時に実行する処理
window.onload = () => {
  placeNumbers(); // 時計数字を配置
  startSmoothClock(); // 時計針の動作開始
}
