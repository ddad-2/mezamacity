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

window.addEventListener('DOMContentLoaded', function() {
  // --- ここからHTMLから移動したゲームロジック ---
  const grid = document.getElementById("grid");
  const moneyDisplay = document.getElementById("money");
  const populationDisplay = document.getElementById("population");

  let money = 1000;
  let population = 0;

  const buildingCost = {
    house: 100,
    factory: 200,
    gov: 300 // 役所のコスト
  };

  const populationIncrease = {
    house: 10,
    factory: 0,
    gov: 0 // 役所の人口増加
  };

  // 初期化 - タイル作成
  const rows = 5;
  const cols = 5;
  const rowLabels = ["A", "B", "C", "D", "E"];
  for (let i = 0; i < rows * cols; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    const row = Math.floor(i / cols);
    const col = i % cols;
    tile.id = `${rowLabels[row]}-${col + 1}`; // 例: A-1, A-2 ...
    tile.addEventListener("click", () => build(tile));
    grid.appendChild(tile);
  }

  // 建物選択状態
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
      if (id === activeId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  setActiveButton("btn-house");

  function build(tile) {
    if (
      tile.classList.contains("building-house") ||
      tile.classList.contains("building-factory") ||
      tile.classList.contains("building-gov")
    ) {
      return; // 既に建物がある
    }

    let buildingType = selectedBuilding;
    let imgSrc;
    if (buildingType === "gov") {
      imgSrc = "../IMAGES/government_office.png";
    } else if (buildingType === "house") {
      imgSrc = "../IMAGES/house.png"; // ファイル名をhouse.pngに修正
    } else {
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
