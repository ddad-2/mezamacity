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
      grid-template-columns: repeat(5, 50px);
      grid-template-rows: repeat(5, 50px);
      gap: 2px;
      justify-content: center;
      margin: 0 auto;
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

window.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById("grid");
  const moneyDisplay = document.getElementById("money");
  const populationDisplay = document.getElementById("population");

  let money = 1000;
  let population = 0;

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

  function createGrid(rows, cols) {
    grid.innerHTML = "";
    // 左上を(0,0)として設置
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

  let currentRows = 11;
  let currentCols = 11;
  createGrid(currentRows, currentCols);

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
    } else {
      alert("お金が足りません！");
    }
  }

  function updateStats() {
    moneyDisplay.textContent = money;
    populationDisplay.textContent = population;
  }

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
  const gridWrapper = document.getElementById("grid-fixed-wrapper");

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
      const tiles = Array.from(document.querySelectorAll("#grid .tile"));
      const rows = currentRows;
      const cols = currentCols;
      let minRow = rows, maxRow = -1, minCol = cols, maxCol = -1;
      tiles.forEach(tile => {
        if (!tile.classList.contains("tile-gray")) {
          const [rowLabel, colStr] = tile.id.split("-");
          const row = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(rowLabel);
          const col = parseInt(colStr, 10) - 1;
          if (row < minRow) minRow = row;
          if (row > maxRow) maxRow = row;
          if (col < minCol) minCol = col;
          if (col > maxCol) maxCol = col;
        }
      });
      minRow = Math.max(0, minRow - 1);
      maxRow = Math.min(rows - 1, maxRow + 1);
      minCol = Math.max(0, minCol - 1);
      maxCol = Math.min(cols - 1, maxCol + 1);
      tiles.forEach(tile => {
        const [rowLabel, colStr] = tile.id.split("-");
        const row = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(rowLabel);
        const col = parseInt(colStr, 10) - 1;
        if (
          row >= minRow && row <= maxRow &&
          col >= minCol && col <= maxCol
        ) {
          tile.classList.remove("tile-gray");
        }
      });

      // --- スクロール位置を中心にする ---
      const wrapper = document.getElementById("grid-fixed-wrapper");
      if (wrapper && grid) {
        // グリッド全体のサイズを取得
        const gridWidth = grid.scrollWidth;
        const gridHeight = grid.scrollHeight;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        // スクロール位置を中央へ
        wrapper.scrollLeft = (gridWidth - wrapperWidth) / 2;
        wrapper.scrollTop = (gridHeight - wrapperHeight) / 2;
      }
      // --- ここまで ---
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