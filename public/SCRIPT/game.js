// game.js - ゲーム画面用スタイルをJSで適用
(function() {
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: sans-serif;
      text-align: center;
      padding: 0px;
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

window.addEventListener('DOMContentLoaded', function() {
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

  // グリッド生成関数
  function createGrid(rows, cols) {
    grid.innerHTML = "";
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // 中心5x5の範囲を計算
    const centerRowStart = Math.floor((rows - 5) / 2);
    const centerColStart = Math.floor((cols - 5) / 2);
    for (let i = 0; i < rows * cols; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      const row = Math.floor(i / cols);
      const col = i % cols;
      tile.id = `${rowLabels[row]}-${col + 1}`;
      // 中心5x5以外は灰色
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
    grid.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 50px)`;
  }

  let currentRows = 11;
  let currentCols = 11;
  createGrid(currentRows, currentCols);

  let selectedBuilding = "house";
  document.getElementById("btn-house").onclick = function() {
    selectedBuilding = "house";
    setActiveButton("btn-house");
  };
  document.getElementById("btn-factory").onclick = function() {
    selectedBuilding = "factory";
    setActiveButton("btn-factory");
  };
  document.getElementById("btn-gov").onclick = function() {
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
    // 灰色タイルには設置できないようにする
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

  // タイルサイズ設定
  let tileSize = 50;
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

  // 拡大縮小バー操作
  const zoomRange = document.getElementById("tile-zoom-range");
  const zoomInBtn = document.getElementById("tile-zoom-in");
  const zoomOutBtn = document.getElementById("tile-zoom-out");

  if (zoomRange) {
    zoomRange.addEventListener("input", function() {
      tileSize = parseInt(zoomRange.value, 10);
      updateTileSize(tileSize);
    });
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function() {
      if (tileSize < maxTileSize) {
        tileSize += 5;
        if (tileSize > maxTileSize) tileSize = maxTileSize;
        updateTileSize(tileSize);
        if (zoomRange) zoomRange.value = tileSize;
      }
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function() {
      if (tileSize > minTileSize) {
        tileSize -= 5;
        if (tileSize < minTileSize) tileSize = minTileSize;
        updateTileSize(tileSize);
        if (zoomRange) zoomRange.value = tileSize;
      }
    });
  }

  // 拡大ボタン処理
  const btnSpecial = document.getElementById("btn-special");
  if (btnSpecial) {
    btnSpecial.addEventListener("click", function() {
      // 現在の緑タイル範囲を取得
      const tiles = Array.from(document.querySelectorAll("#grid .tile"));
      const rows = currentRows;
      const cols = currentCols;
      // 緑範囲を計算
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
      // 拡張範囲
      minRow = Math.max(0, minRow - 1);
      maxRow = Math.min(rows - 1, maxRow + 1);
      minCol = Math.max(0, minCol - 1);
      maxCol = Math.min(cols - 1, maxCol + 1);
      // 拡張範囲に含まれるタイルを緑に
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
    });
  }
});

// ログアウト処理（例）
function logout() {
  alert("ログアウトしました");
  window.location.href = "login.html";
}


const theme = localStorage.getItem('theme') || 'dark'; // ← ここで初期値を暗くする
