// geme.js - ゲーム画面用スタイルをJSで適用
(function() {
  const style = document.createElement('style');
  style.textContent = `
    body {
      background: #222;
      color: #fff;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
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
  `;
  document.head.appendChild(style);
})();

// --- ここからゲームロジック ---
window.addEventListener('DOMContentLoaded', function() {
  let money = 10000; // テスト用に初期値を増やす
  let population = 0;

  const rows = 5;
  const cols = 5;
  const rowLabels = ["A", "B", "C", "D", "E"];

  const grid = document.getElementById("grid");
  const moneyDisplay = document.getElementById("money");
  const populationDisplay = document.getElementById("population");

  // グリッド初期化
  function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < rows * cols; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      const row = Math.floor(i / cols);
      const col = i % cols;
      tile.id = `${rowLabels[row]}-${col + 1}`; // 例: A-1, A-2 ...
      tile.addEventListener("click", () => build(tile));
      grid.appendChild(tile);
    }
  }

  createGrid();

  const buildingCost = {
    house: 100,
    factory: 200,
  };

  const populationIncrease = {
    house: 10,
    factory: 0,
  };

  function build(tile) {
    if (
      tile.classList.contains("building-house") ||
      tile.classList.contains("building-factory") ||
      tile.classList.contains("building-gov")
    ) {
      return; // 既に建物がある
    }

    // 建物タイプを選択（例：ランダム or 固定で役所/government_office）
    let buildingType;
    let imgSrc;
    if (Math.random() < 0.33) {
      buildingType = "gov";
      imgSrc = "../IMAGES/government_office.png";
    } else if (Math.random() < 0.5) {
      buildingType = "house";
      imgSrc = "https://i.imgur.com/2RHRvYW.png";
    } else {
      buildingType = "factory";
      imgSrc = "https://i.imgur.com/Q8Wqg6m.png";
    }
    const cost = buildingCost[buildingType] || 0;
    const popInc = populationIncrease[buildingType] || 0;

    if (money >= cost) {
      tile.classList.add(`building-${buildingType}`);
      // 画像を追加
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
});
