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
      margin-bottom: 10px;
      font-size: 18px;
    }
    #grid {
      display: grid;
      gap: 2px;
      transform-origin: 0 0;
    }
    .tile {
      width: 50px;
      height: 50px;
      background-color: #4caf50;
      background-size: cover;
      border: 1px solid #333;
      cursor: pointer;
      transition: transform 0.1s;
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

  const fixedTileSize = 50;
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
    grid.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 50px)`;
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

  // --- メイン処理 ---
  const userId = await getCurrentUserId();
  if (!userId) {
    alert('ログイン情報が取得できません。再ログインしてください。');
    return;
  }
  const currentUserId = userId;
  // const currentCityId = 1; // 必要に応じてユーザーごとに取得

  createGrid(currentRows, currentCols);
  await loadBuildingsFromDatabase(currentCityId);
  await loadUserMoney(currentUserId);

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
      tile.classList.contains("building-gov")
    ) {
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
        saveBuildingToDatabase(currentCityId, building_id, x_coordinate, y_coordinate);
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
    fetch('/api/save_building', { // Node.js/Express用のエンドポイントに修正
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

  let tileSize = 30; // 初期値を最小値に
  const minTileSize = 30;
  const maxTileSize = 100;

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
    btnSpecial.addEventListener("click", function () {
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
      // 周囲1マス拡大
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