<<<<<<< HEAD
// ページ読み込み時にテーマ・フォントサイズ・言語を適用する
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme') || 'dark';               // テーマ設定を取得（なければ'dark'）
  const fontsize = localStorage.getItem('fontsize') || 'medium';       // フォントサイズ設定を取得（なければ'medium'）
  const language = localStorage.getItem('language') || 'ja';           // 言語設定を取得（なければ'ja'）

  applyTheme(theme);        // テーマを適用
  applyFontSize(fontsize);  // フォントサイズを適用
  applyLanguage(language);  // 言語を適用
});

// テーマ（darkまたはlight）を適用する関数
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);  // body に data-theme 属性を設定

  const clock = document.getElementById("clock");   // 時計が存在するか確認
  if (clock) {
    const numbers = clock.querySelectorAll(".number"); // 時計の数字をすべて取得
    numbers.forEach(el => el.remove());                // 一旦すべて削除
    if (typeof placeNumbers === 'function') placeNumbers(); // placeNumbers 関数が定義されていれば再配置
  }
}

// フォントサイズ（small, medium, large）を適用する関数
function applyFontSize(size) {
  let fontSize;                                       // 適用するフォントサイズを保持する変数
  switch (size) {
    case 'small': fontSize = '12px'; break;           // small の場合
    case 'medium': fontSize = '16px'; break;          // medium の場合
    case 'large': fontSize = '20px'; break;           // large の場合
    default: fontSize = '16px';                       // 不正値なら medium を適用
  }
  document.body.style.fontSize = fontSize;            // body にフォントサイズを反映
}

// 言語（日本語または英語）を適用する関数
function applyLanguage(lang) {
  document.querySelectorAll('[data-ja], [data-en]').forEach(el => { // 両言語属性を持つ要素を取得
    if (lang === 'en' && el.dataset.en) {
      el.textContent = el.dataset.en;               // 英語に切り替え
    } else if (el.dataset.ja) {
      el.textContent = el.dataset.ja;               // 日本語に切り替え（またはデフォルト）
    }
  });
}
=======
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme') || 'dark';
  const fontsize = localStorage.getItem('fontsize') || 'medium';
  const language = localStorage.getItem('language') || 'ja';

  applyTheme(theme);
  applyFontSize(fontsize);
  applyLanguage(language);
});

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.style.background = 'linear-gradient(#f0f0f0, #e0e0e0)';
    document.body.style.color = '#000';
  } else {
    document.body.style.background = 'linear-gradient(#1a1a2e, #16213e)';
    document.body.style.color = '#fff';
  }
}

function applyFontSize(size) {
  let fontSize;
  switch (size) {
    case 'small': fontSize = '12px'; break;
    case 'medium': fontSize = '16px'; break;
    case 'large': fontSize = '20px'; break;
    default: fontSize = '16px';
  }
  document.body.style.fontSize = fontSize;
}

function applyLanguage(lang) {
  document.querySelectorAll('[data-ja], [data-en]').forEach(el => {
    if (lang === 'en' && el.dataset.en) {
      el.textContent = el.dataset.en;
    } else if (el.dataset.ja) {
      el.textContent = el.dataset.ja;
    }
  });
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  
  // 時計サイズが変わって数字がズレるのを防ぐため再配置（必要なら）
  const clock = document.getElementById("clock");
  if (clock) {
    const numbers = clock.querySelectorAll(".number");
    numbers.forEach(el => el.remove());
    placeNumbers(); // 再配置（既に定義されている関数）
  }
}
>>>>>>> a34aa9bbd2c57d00de2652b37fd1b460dabdb918
