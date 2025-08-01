// city-name-setting.js - 街の名前設定画面用スクリプト

// ============================
// 🌞 時間帯で背景色を変える処理
// ============================
function setBackgroundColorByTime() {
  const hour = new Date().getHours();
  let bgColor;

  if (hour >= 5 && hour < 10) {
    bgColor = "#FFFAE3"; // 朝
  } else if (hour >= 10 && hour < 17) {
    bgColor = "#E3F2FD"; // 昼
  } else if (hour >= 17 && hour < 19) {
    bgColor = "#FFE0B2"; // 夕方
  } else {
    bgColor = "#263238"; // 夜
  }

  document.body.style.setProperty(
    "background-color",
    bgColor,
    "important"
  );
}

// --- ログインユーザーIDをサーバーから取得 ---
async function getCurrentUserId() {
  try {
    const res = await fetch("/api/get_current_user");
    const data = await res.json();
    if (data.success && data.user_id) {
      return data.user_id;
    }
  } catch (e) {
    console.error("ユーザーIDの取得に失敗:", e);
  }
  return null;
}

// --- 初期化処理 ---
let currentUserId = null;

window.addEventListener("DOMContentLoaded", async function () {
  // 背景色設定
  setBackgroundColorByTime();

  // ユーザーID取得
  currentUserId = await getCurrentUserId();
  console.log("名前設定 - 取得したユーザーID:", currentUserId);

  if (!currentUserId) {
    alert("ログイン情報が取得できません。再ログインしてください。");
    window.location.href = "login.html";
    return;
  }

  // 現在の街の名前を入力フィールドに設定
  const cityNameInput = document.getElementById("city-name-input");
  
  // まずデータベースから現在の街の名前を取得
  try {
    const cityNameRes = await fetch(`/api/get_city_name?user_id=${currentUserId}`);
    if (cityNameRes.ok) {
      const cityNameData = await cityNameRes.json();
      if (cityNameData.success && cityNameData.city_name) {
        cityNameInput.value = cityNameData.city_name;
        cityNameInput.select(); // テキストを選択状態にする
        console.log("データベースから街の名前を取得:", cityNameData.city_name);
      }
    } else {
      console.warn("データベースからの街の名前取得に失敗、ローカルストレージを確認");
      // データベースから取得できない場合は、ローカルストレージを確認
      const localCityName = localStorage.getItem(`city_name_${currentUserId}`);
      if (localCityName && localCityName.trim() !== '' && localCityName.trim() !== 'めざまシティ') {
        cityNameInput.value = localCityName;
        cityNameInput.select();
      } else {
        // 既知のuser_idに基づく現在の名前を設定
        if (currentUserId === 1) {
          cityNameInput.placeholder = "現在: 山田シティ";
        } else if (currentUserId === 2) {
          cityNameInput.placeholder = "現在: 花子タウン";
        } else if (currentUserId === 3 || currentUserId === 4) {
          cityNameInput.placeholder = "現在: めざまシティ";
        }
      }
    }
  } catch (e) {
    console.error("街の名前取得エラー:", e);
    // エラーの場合もローカルストレージを確認
    const localCityName = localStorage.getItem(`city_name_${currentUserId}`);
    if (localCityName && localCityName.trim() !== '' && localCityName.trim() !== 'めざまシティ') {
      cityNameInput.value = localCityName;
      cityNameInput.select();
    }
  }

  // 都市データが存在するか確認
  try {
    await fetch("/api/ensure_city", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUserId }),
    });
  } catch (e) {
    console.error("都市データの初期化に失敗:", e);
  }

  // 戻るボタンのイベント
  document
    .getElementById("back-btn")
    .addEventListener("click", function () {
      // ゲーム画面から来た場合はゲーム画面に戻る
      const referrer = document.referrer;
      if (referrer.includes('game.html')) {
        window.location.href = "game.html";
      } else {
        window.location.href = "tutorial.html";
      }
    });

  // フォーム送信処理
  document
    .getElementById("city-name-form")
    .addEventListener("submit", handleFormSubmit);

  // 入力フィールドのホバー効果
  document
    .getElementById("city-name-input")
    .addEventListener("focus", function () {
      this.style.borderColor = "#2196f3";
    });

  document
    .getElementById("city-name-input")
    .addEventListener("blur", function () {
      this.style.borderColor = "#ddd";
    });
});

// フォーム送信処理
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("city-name-input").value.trim();
  const messageEl = document.getElementById("setting-message");
  const submitBtn = document.getElementById("submit-btn");

  if (!name) {
    messageEl.textContent = "街の名前を入力してください。";
    messageEl.style.color = "#e94e77";
    return;
  }

  if (name.length > 20) {
    messageEl.textContent = "街の名前は20文字以内で入力してください。";
    messageEl.style.color = "#e94e77";
    return;
  }

  if (!currentUserId) {
    messageEl.textContent = "ユーザー情報の取得に失敗しました。";
    messageEl.style.color = "#e94e77";
    return;
  }

  // ボタンを無効化
  submitBtn.disabled = true;
  submitBtn.textContent = "設定中...";

  // サーバーに街の名前を保存するAPIを呼び出し
  try {
    // まず都市データの存在を確認
    console.log("都市データの存在確認中...");
    const ensureRes = await fetch("/api/ensure_city", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUserId }),
    });

    if (!ensureRes.ok) {
      throw new Error(`都市データの確認に失敗しました: ${ensureRes.status}`);
    }

    console.log("都市データの確認完了、街の名前を更新中...");
    // 都市名を更新
    const updateRes = await fetch("/api/update_city_name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUserId,
        city_name: name,
      }),
      credentials: "include",
    });

    console.log("API レスポンス状況:", updateRes.status, updateRes.statusText);

    let updateData;
    try {
      updateData = await updateRes.json();
      console.log("API レスポンスデータ:", updateData);
    } catch (parseError) {
      console.error("JSONパースエラー:", parseError);
      console.log("生のレスポンス:", await updateRes.text());
      throw new Error("サーバーからの応答が不正です");
    }

    if (updateRes.ok && updateData && updateData.success) {
      console.log("データベースへの保存成功:", updateData);
      messageEl.textContent = `「${name}」に設定されました！ゲーム画面に移動します...`;
      messageEl.style.color = "#4caf50";

      // ローカルストレージにも保存（フロントエンド側でのバックアップ）
      localStorage.setItem(`city_name_${currentUserId}`, name);

      setTimeout(() => {
        window.location.href = "game.html";
      }, 1500);
    } else {
      // APIが存在しない場合は、ローカルストレージに保存して成功扱い
      if (updateRes.status === 404) {
        console.warn(
          "API /api/update_city_name が存在しません。ローカルストレージに保存します。"
        );
        localStorage.setItem(`city_name_${currentUserId}`, name);

        messageEl.textContent = `「${name}」に設定されました！ゲーム画面に移動します...`;
        messageEl.style.color = "#4caf50";

        setTimeout(() => {
          window.location.href = "game.html";
        }, 1500);
      } else {
        console.error("API エラー:", updateData);
        throw new Error(
          updateData?.message || "都市名の更新に失敗しました"
        );
      }
    }
  } catch (e) {
    console.error("都市名設定エラー:", e);

    // エラーが発生した場合でも、ローカルストレージに保存
    localStorage.setItem(`city_name_${currentUserId}`, name);

    messageEl.textContent = `「${name}」に設定しました（一時保存）。ゲーム画面に移動します...`;
    messageEl.style.color = "#ff9800";

    setTimeout(() => {
      window.location.href = "game.html";
    }, 2000);
  } finally {
    // ボタンを再有効化
    submitBtn.disabled = false;
    submitBtn.textContent = "決定";
  }
}
