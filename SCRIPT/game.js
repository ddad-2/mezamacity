// game.js - ゲーム画面用スタイルをJSで適用
(function () {
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: sans-serif;
      text-align: center;
      padding: 0px;
      transition: background-color 0.5s ease;
    }
    #stats {
      margin-bottom: 18px;
      font-size: 18px;
      position: relative;
      z-index: 10;
      background: rgba(255,255,255,0.85);
      display: block;
      padding: 4px 18px;
      border-radius: 8px;
      margin-top: 24px;
      margin-left: auto;
      margin-right: auto;
      width: fit-content;
      text-align: center;
    }
    #grid {
      display: grid;
      gap: 2px;
      transform-origin: 0 0;
      background: #111;
      border: 6px solid #111;
      border-radius: 14px;
      box-sizing: content-box;
      padding: 7px;
      margin: 80px auto 0 auto;
      width: max-content;
      z-index: 1;
      position: relative;
    }

    /* ボタン類の重なり防止 */
    .main-buttons {
      margin-top: 0px;
      margin-bottom: 24px;
      z-index: 10;
      position: relative;
      background: rgba(255,255,255,0.85);
      display: block;
      border-radius: 8px;
      padding: 6px 16px;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
    .tile {
      width: 40px;
      height: 45px;
      background-color: #4caf50;
      background-size: cover;
      border: 1px solid #222;
      cursor: pointer;
      transition: transform 0.1s;
      box-sizing: border-box;
    }
    .tile:hover {
      transform: scale(1.1);
    }
    .building-house {
      background-image: url('https://i.imgur.com/2RHRvYW.png');
    }
    .building-factory {
      background-image: url('https://i.imgur.com/Q8Wqg6m.png');
    }
    .tile-gray {
      background-color: #ccc;
    }
    
    /* 追加ナビゲーションボタンのホバー効果 */
    #btn-tutorial:hover {
      background: #f57c00 !important;
      transform: translateY(-1px);
    }
    
    #btn-change-name:hover {
      background: #7b1fa2 !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
})();

window.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById("grid");
  const moneyDisplay = document.getElementById("money");
  const populationDisplay = document.getElementById("population");
  const gridWrapper = document.getElementById("grid-fixed-wrapper");

  let money = 1000;
  let population = 0;
  // 仮のuser_idとcity_id。実際にはログイン情報などから取得してください。
  // const currentUserId = 1; // 仮のユーザーID
  const currentCityId = 1; // 仮の都市ID

  const buildingCost = {
    house: 100,
    factory: 200,
    gov: 300
  };

  const populationIncrease = {
    house: 10,
    factory: 0,
    gov: 0
  };

  // **建物の種類とbuilding_idのマッピング**
  // buildingsテーブルの内容に合わせて正確に設定してください。
  const buildingTypeToId = {
    house: 1,
    factory: 2,
    gov: 3
  };

  const fixedTileSize = 45;
  let currentRows = 11;
  let currentCols = 11;
  const gap = 2; // CSSのgap値と合わせる

  function createGrid(rows, cols) {
    grid.innerHTML = "";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `${row}.${col}`; // 左上が0.0
        // 中心5x5以外は灰色
        const centerRowStart = Math.floor((rows - 5) / 2);
        const centerColStart = Math.floor((cols - 5) / 2);
        if (
          row < centerRowStart ||
          row >= centerRowStart + 5 ||
          col < centerColStart ||
          col >= centerColStart + 5
        ) {
          tile.classList.add("tile-gray");
        }
        tile.addEventListener("click", () => build(tile));
        grid.appendChild(tile);
      }
    }
    grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 45px)`;
  }

  // --- 配置データをサーバーから取得して復元 ---
  async function loadBuildingsFromDatabase(cityId) {
    try {
      const res = await fetch(`/api/get_buildings?city_id=${cityId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.buildings)) {
        data.buildings.forEach(b => {
          const tile = document.getElementById(`${b.y_coordinate}.${b.x_coordinate}`);
          if (tile) {
            let buildingType = Object.keys(buildingTypeToId).find(key => buildingTypeToId[key] === b.building_id);
            let imgSrc = '';
            if (buildingType === 'gov') imgSrc = '../IMAGES/government_office.png';
            else if (buildingType === 'house') imgSrc = '../IMAGES/house.png';
            else if (buildingType === 'factory') imgSrc = '../IMAGES/factory.png';
            if (buildingType) {
              tile.classList.add(`building-${buildingType}`);
              if (!tile.querySelector('img')) {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = buildingType;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                tile.appendChild(img);
              }
            }
          }
        });
      }
    } catch (e) {
      console.error('建物配置の取得に失敗:', e);
    }
  }

  // --- 追加: ユーザーの所持金をサーバーから取得して反映 ---
  async function loadUserMoney(userId) {
    try {
      const res = await fetch(`/api/get_money?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        money = data.money;
        updateStats();
      }
    } catch (e) {
      console.error('所持金の取得に失敗:', e);
    }
  }

  // --- 街の名前を取得・表示する関数 ---
  async function loadAndDisplayCityName(userId) {
    const cityNameElement = document.getElementById('city-name-text');
    
    try {
      // まずローカルストレージから確認
      const localCityName = localStorage.getItem(`city_name_${userId}`);
      
      if (localCityName && localCityName.trim() !== '' && localCityName.trim() !== 'めざまシティ') {
        console.log('ローカルストレージから街の名前を取得:', localCityName);
        cityNameElement.textContent = localCityName;
        cityNameElement.style.color = '#2196f3';
        return;
      }

      // ローカルストレージにない場合は、既知のuser_idに基づく判定
      if (userId === 1) {
        cityNameElement.textContent = '山田シティ';
        cityNameElement.style.color = '#4caf50';
      } else if (userId === 2) {
        cityNameElement.textContent = '花子タウン';
        cityNameElement.style.color = '#4caf50';
      } else if (userId === 3 || userId === 4) {
        cityNameElement.textContent = 'めざまシティ';
        cityNameElement.style.color = '#ff9800';
        // デフォルト名の場合はクリックで名前変更を促す
        const cityNameDisplay = document.getElementById('city-name-display');
        cityNameDisplay.style.cursor = 'pointer';
        cityNameDisplay.title = 'クリックして街の名前を変更';
        cityNameDisplay.addEventListener('click', function() {
          if (confirm('街の名前を変更しますか？')) {
            window.location.href = 'city-name-setting.html';
          }
        });
      } else {
        cityNameElement.textContent = `街 #${userId}`;
        cityNameElement.style.color = '#666';
      }
      
    } catch (e) {
      console.error('街の名前の取得に失敗:', e);
      cityNameElement.textContent = '名前未設定';
      cityNameElement.style.color = '#e94e77';
    }
  }

  // --- ログインユーザーIDをサーバーから取得 ---
  async function getCurrentUserId() {
    try {
      const res = await fetch('/api/get_current_user');
      const data = await res.json();
      if (data.success && data.user_id) {
        return data.user_id;
      }
    } catch (e) {
      console.error('ユーザーIDの取得に失敗:', e);
    }
    return null;
  }

  // --- 都市名が設定されているか確認し、未設定ならチュートリアルへ誘導 ---
  async function checkCityNameAndRedirect(userId) {
    try {
      console.log('都市名チェック開始 - userId:', userId); // デバッグ用
      
      // ローカルストレージから都市名を確認
      const localCityName = localStorage.getItem(`city_name_${userId}`);
      console.log('ローカルストレージの都市名:', localCityName); // デバッグ用
      
      // ローカルストレージに都市名がある場合は設定済みとみなす
      if (localCityName && localCityName.trim() !== '' && localCityName.trim() !== 'めざまシティ') {
        console.log('ローカルストレージに都市名が設定済みです:', localCityName);
        return true; // 処理を続行
      }
      
      // まず都市データが存在するか確認
      const ensureRes = await fetch('/api/ensure_city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!ensureRes.ok) {
        console.error('都市データの確認に失敗しました');
        return true; // エラーの場合は続行
      }
      
      // 既存のAPIを使って都市の建物データを取得し、そこから都市名を推測
      // 実際には、citysテーブルから直接都市名を取得するAPIが必要ですが、
      // 暫定的に「めざまシティ」をデフォルト名として扱います
      
      // テーブル情報から、user_id 3と4が「めざまシティ」であることが分かっているので
      // 暫定的にこれらのユーザーIDの場合はダイアログを表示
      if (userId === 3 || userId === 4) {
        console.log('都市名未設定のため、ダイアログを表示します'); // デバッグ用
        const userChoice = confirm(
          'ようこそ！\n' +
          '街に名前をつけて、市長としての第一歩を始めましょう。\n\n' +
          'チュートリアルページに移動しますか？'
        );
        
        if (userChoice) {
          console.log('ユーザーがチュートリアルページへの遷移を選択しました'); // デバッグ用
          // チュートリアルページに遷移
          window.location.href = 'tutorial.html';
          return false; // 後続の処理を中断
        } else {
          console.log('ユーザーがチュートリアルページへの遷移をキャンセルしました'); // デバッグ用
        }
      } else {
        console.log('都市名が設定済みです（user_id:', userId, '）'); // デバッグ用
      }
    } catch (e) {
      console.error('都市名の確認中にエラーが発生しました:', e);
      // エラーが発生した場合も、とりあえずゲームは進められるようにしておく
    }
    return true; // 処理を続行
  }

  // --- メイン処理 ---
  const userId = await getCurrentUserId();
  console.log('取得したユーザーID:', userId); // デバッグ用
  if (!userId) {
    alert('ログイン情報が取得できません。再ログインしてください。');
    return;
  }
  const currentUserId = userId;

  // ★都市名を確認し、必要ならチュートリアルページへリダイレクト
  console.log('都市名チェックを開始します...'); // デバッグ用
  const shouldContinue = await checkCityNameAndRedirect(currentUserId);
  console.log('都市名チェック結果 - 続行:', shouldContinue); // デバッグ用
  if (!shouldContinue) {
    console.log('チュートリアルページへ遷移するため、ゲーム初期化を中断します'); // デバッグ用
    // チュートリアルページへ遷移するため、以降のゲーム初期化処理を中断
    return;
  }

  createGrid(currentRows, currentCols);
  await loadBuildingsFromDatabase(currentUserId); // city_id = user_id
  await loadUserMoney(currentUserId);
  
  // 街の名前を取得・表示
  await loadAndDisplayCityName(currentUserId);

  let selectedBuilding = "house";
  document.getElementById("btn-house").onclick = function () {
    selectedBuilding = "house";
    setActiveButton("btn-house");
  };
  document.getElementById("btn-factory").onclick = function () {
    selectedBuilding = "factory";
    setActiveButton("btn-factory");
  };
  document.getElementById("btn-gov").onclick = function () {
    selectedBuilding = "gov";
    setActiveButton("btn-gov");
  };

  function setActiveButton(activeId) {
    ["btn-house", "btn-factory", "btn-gov"].forEach(id => {
      const btn = document.getElementById(id);
      btn.style.outline = (id === activeId) ? "4px solid #fff" : "none";
      btn.style.opacity = (id === activeId) ? "1" : "0.7";
    });
  }

  setActiveButton("btn-house");

  function build(tile) {
    if (
      tile.classList.contains("tile-gray") ||
      tile.classList.contains("building-house") ||
      tile.classList.contains("building-factory") ||
      tile.classList.contains("building-gov") ||
      tile.querySelector('img') // 既に建物画像がある場合も設置不可
    ) {
      alert("設置できません");
      return;
    }

    let buildingType = selectedBuilding;
    let imgSrc;
    if (buildingType === "gov") {
      imgSrc = "../IMAGES/government_office.png";
    } else if (buildingType === "house") {
      imgSrc = "../IMAGES/house.png";
    } else {
      imgSrc = "../IMAGES/factory.png";
    }
    const cost = buildingCost[buildingType] || 0;
    const popInc = populationIncrease[buildingType] || 0;

    if (money >= cost) {
      tile.classList.add(`building-${buildingType}`);
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = buildingType;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      tile.appendChild(img);
      money -= cost;
      population += popInc;
      updateStats();
      updateUserMoneyOnServer(currentUserId, money);

      // --- **データベース保存処理の呼び出し** ---
      const [rowStr, colStr] = tile.id.split('.');
      const x_coordinate = parseInt(colStr, 10); // x_coordinate は列 (col)
      const y_coordinate = parseInt(rowStr, 10); // y_coordinate は行 (row)
      const building_id = buildingTypeToId[buildingType];

      if (building_id) {
        saveBuildingToDatabase(currentUserId, building_id, x_coordinate, y_coordinate);
      } else {
        console.error("Unknown building type or missing building_id mapping:", buildingType);
      }
      // --- ここまで ---

    } else {
      alert("お金が足りません！");
    }
  }

  function updateStats() {
    moneyDisplay.textContent = money;
    populationDisplay.textContent = population;
  }

  // --- **データベース保存用の関数** ---
  function saveBuildingToDatabase(cityId, buildingId, x, y) {
    // 実際には、サーバーサイドのエンドポイントにデータを送信します。
    // 例: fetch APIを使用
    fetch('/api/save_building', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city_id: cityId,
            building_id: buildingId,
            x_coordinate: x,
            y_coordinate: y
        }),
        credentials: 'include'
    })
    .then(response => {
        // HTTPステータスが200番台以外の場合もエラーとして処理
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'サーバーエラーが発生しました');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('建物がデータベースに保存されました:', data.message);
            // 成功時の追加処理があればここに追加
            // テスト用: 成功メッセージを画面に表示
            showSaveSuccessMessage('建物の配置に成功しました！');
        } else {
            console.error('建物の保存に失敗しました:', data.message);
        }
    })
    .catch((error) => {
        console.error('建物の保存中にネットワークまたはサーバーエラーが発生しました:', error);
        alert('建物の保存に失敗しました。ネットワーク接続を確認してください。'); // ユーザーへのフィードバック
    });
  }
  // --- ここまで ---

let tileSize = 45; // 初期値を小さめに
const minTileSize = 25;
const maxTileSize = 80;

  function updateTileSize(size) {
    grid.style.gridTemplateColumns = `repeat(${currentCols}, ${size}px)`;
    grid.style.gridTemplateRows = `repeat(${currentRows}, ${size}px)`;
    Array.from(grid.getElementsByClassName("tile")).forEach(tile => {
      tile.style.width = `${size}px`;
      tile.style.height = `${size}px`;
    });
  }

  // スクロール位置を記憶する変数 (この変数は現在未使用ですが、将来的な機能拡張のために残しておいても良いでしょう)
  let lastScrollLeft = 0;
  let lastScrollTop = 0;

  // 拡大縮小バー操作
  const zoomRange = document.getElementById("tile-zoom-range");
  const zoomInBtn = document.getElementById("tile-zoom-in");
  const zoomOutBtn = document.getElementById("tile-zoom-out");

  // 初期表示時に最小サイズで表示
  updateTileSize(tileSize);
  if (zoomRange) {
    zoomRange.value = tileSize;
  }
  // スクロールバーの初期位置を左上に
  if (gridWrapper) {
    gridWrapper.scrollLeft = 0;
    gridWrapper.scrollTop = 0;
  }

   function scrollToLeftTop() {
  if (gridWrapper) {
     gridWrapper.scrollLeft = 0;
       gridWrapper.scrollTop = 0;
     }
   }

  if (zoomRange) {
    zoomRange.addEventListener("input", function () {
      tileSize = parseInt(zoomRange.value, 10);
      updateTileSize(tileSize);
      // スクロール位置は維持（左上が見える）
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      if (tileSize < maxTileSize) {
        tileSize += 5;
        if (tileSize > maxTileSize) tileSize = maxTileSize;
        updateTileSize(tileSize);
        if (zoomRange) zoomRange.value = tileSize;
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      if (tileSize > minTileSize) {
        tileSize -= 5;
        if (tileSize < minTileSize) tileSize = minTileSize;
        updateTileSize(tileSize);
        if (zoomRange) zoomRange.value = tileSize;
      }
    });
  }

  const btnSpecial = document.getElementById("btn-special");
  if (btnSpecial) {
    btnSpecial.addEventListener("click", async function () {
      const expandCost = 1000;
      if (money < expandCost) {
        alert("お金が足りません！");
        return;
      }
      // 現在の緑タイルの範囲を特定
      const tiles = Array.from(document.querySelectorAll("#grid .tile"));
      let minRow = currentRows, maxRow = -1, minCol = currentCols, maxCol = -1;
      tiles.forEach(tile => {
        if (!tile.classList.contains("tile-gray")) {
          const [row, col] = tile.id.split(".").map(Number);
          if (row < minRow) minRow = row;
          if (row > maxRow) maxRow = row;
          if (col < minCol) minCol = col;
          if (col > maxCol) maxCol = col;
        }
      });
      // 周囲1マス拡大（1×1増やす）
      minRow = Math.max(0, minRow - 1);
      maxRow = Math.min(currentRows - 1, maxRow + 1);
      minCol = Math.max(0, minCol - 1);
      maxCol = Math.min(currentCols - 1, maxCol + 1);
      tiles.forEach(tile => {
        const [row, col] = tile.id.split(".").map(Number);
        if (
          row >= minRow && row <= maxRow &&
          col >= minCol && col <= maxCol &&
          tile.classList.contains("tile-gray")
        ) {
          tile.classList.remove("tile-gray");
        }
      });
      // city_rankを1増やすAPIリクエスト
      try {
        await fetch('/api/increment_city_rank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUserId }),
          credentials: 'include'
        });
      } catch (e) {
        console.error('city_rankの更新に失敗:', e);
      }
      money -= expandCost;
      updateStats();
      updateUserMoneyOnServer(currentUserId, money);
      // --- スクロール位置を中心にする ---
      const wrapper = document.getElementById("grid-fixed-wrapper");
      if (wrapper && grid) {
        const gridWidth = grid.scrollWidth;
        const gridHeight = grid.scrollHeight;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        wrapper.scrollLeft = (gridWidth - wrapperWidth) / 2;
        wrapper.scrollTop = (gridHeight - wrapperHeight) / 2;
      }
      // --- ここまで ---
    });
  }

  const btnGetMoney = document.getElementById("btn-get-money");
  if (btnGetMoney) {
    btnGetMoney.addEventListener("click", function () {
      money += 1000;
      updateStats();
      // サーバーに所持金を保存
      updateUserMoneyOnServer(currentUserId, money);
    });
  }

  // チュートリアルボタンのイベント
  const btnTutorial = document.getElementById("btn-tutorial");
  if (btnTutorial) {
    btnTutorial.addEventListener("click", function () {
      if (confirm("チュートリアルページに移動しますか？\n現在のゲーム状態は保存されます。")) {
        window.location.href = "tutorial.html";
      }
    });
  }

  // 名前変更ボタンのイベント
  const btnChangeName = document.getElementById("btn-change-name");
  if (btnChangeName) {
    btnChangeName.addEventListener("click", function () {
      if (confirm("街の名前を変更しますか？\n現在のゲーム状態は保存されます。")) {
        // 名前変更前の現在の名前をセッションストレージに保存
        const currentCityName = document.getElementById('city-name-text').textContent;
        sessionStorage.setItem('previous_city_name', currentCityName);
        window.location.href = "city-name-setting.html";
      }
    });
  }

  // テーマ属性をリセット
  document.body.removeAttribute('data-theme');
});

// ログアウト処理
function logout() {
  alert("ログアウトしました");
  window.location.href = "login.html";
}

// ============================
// 🌞 時間帯で背景色を変える処理
// ============================
function setBackgroundColorByTime() {
  const hour = new Date().getHours();
  let bgColor;

  if (hour >= 5 && hour < 10) {
    bgColor = "#FFFAE3";  // 朝
  } else if (hour >= 10 && hour < 17) {
    bgColor = "#E3F2FD";  // 昼
  } else if (hour >= 17 && hour < 19) {
    bgColor = "#FFE0B2";  // 夕方
  } else {
    bgColor = "#263238";  // 夜
  }

  document.body.style.setProperty('background-color', bgColor, 'important');
}

window.addEventListener('DOMContentLoaded', setBackgroundColorByTime);

// --- 所持金更新用の関数 ---
async function updateUserMoneyOnServer(userId, newMoney) {
  try {
    await fetch('/api/update_money', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, money: newMoney }),
      credentials: 'include'
    });
  } catch (e) {
    console.error('所持金の更新に失敗:', e);
  }
}

// テスト用: 成功メッセージを画面に表示する関数
function showSaveSuccessMessage(msg) {
    let msgDiv = document.getElementById('save-success-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'save-success-message';
        msgDiv.style.position = 'fixed';
        msgDiv.style.top = '20px';
        msgDiv.style.right = '20px';
        msgDiv.style.background = 'rgba(40,180,40,0.95)';
        msgDiv.style.color = '#fff';
        msgDiv.style.padding = '12px 24px';
        msgDiv.style.borderRadius = '8px';
        msgDiv.style.fontSize = '18px';
        msgDiv.style.zIndex = '9999';
        document.body.appendChild(msgDiv);
    }
    msgDiv.textContent = msg;
    msgDiv.style.display = 'block';
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 1200);
}