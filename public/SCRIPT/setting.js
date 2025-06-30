document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('theme');
  const fontsizeSelect = document.getElementById('fontsize');
  const languageSelect = document.getElementById('language');
  const deleteBtn = document.getElementById('deleteBtn');
  const modal = document.getElementById('modal');
  const confirmDelete = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');
  const saveModal = document.getElementById('save-modal');
  const saveBtn = document.getElementById('saveBtn');
  const confirmSave = document.getElementById('confirmSave');
  const cancelSave = document.getElementById('cancelSave');

  // 初期設定読み込み
  const init = () => {
    const theme = localStorage.getItem('theme') || 'dark';
    const fontsize = localStorage.getItem('fontsize') || 'medium';
    const language = localStorage.getItem('language') || 'ja';

    themeSelect.value = theme;
    fontsizeSelect.value = fontsize;
    languageSelect.value = language;

    applyTheme(theme);
    applyFontSize(fontsize);
    applyLanguage(language);
  };

  // テーマ・フォント・言語適用関数
  const applyTheme = theme => {
    document.body.style.background = theme === 'light'
      ? 'linear-gradient(#f0f0f0, #e0e0e0)'
      : 'linear-gradient(#1a1a2e, #16213e)';
    document.body.style.color = theme === 'light' ? '#000' : '#fff';
  };

  const applyFontSize = size => {
    document.body.style.fontSize = {
      small: '12px',
      medium: '16px',
      large: '20px',
    }[size] || '16px';
  };

  const applyLanguage = lang => {
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ja || el.textContent;
    });
  };

  // 保存モーダル表示
  saveBtn.addEventListener('click', () => {
    saveModal.classList.remove('hidden');
  });

  cancelSave.addEventListener('click', () => {
    saveModal.classList.add('hidden');
  });

  confirmSave.addEventListener('click', () => {
    const theme = themeSelect.value;
    const fontsize = fontsizeSelect.value;
    const language = languageSelect.value;

    localStorage.setItem('theme', theme);
    localStorage.setItem('fontsize', fontsize);
    localStorage.setItem('language', language);

    applyTheme(theme);
    applyFontSize(fontsize);
    applyLanguage(language);

    saveModal.classList.add('hidden');
    alert('設定を保存しました。');
  });

  // アカウント削除モーダル
  deleteBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  cancelDelete.addEventListener('click', () => modal.classList.add('hidden'));
  confirmDelete.addEventListener('click', () => {
    localStorage.clear();
    alert('アカウントを削除しました。');
    window.location.href = '../HTML/login.html';
  });

  init();
});

// ログアウト処理
function logout() {
  localStorage.clear();
  window.location.href = "../HTML/login.html";
}
