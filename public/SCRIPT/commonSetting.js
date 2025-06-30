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
