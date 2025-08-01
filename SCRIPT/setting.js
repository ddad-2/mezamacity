document.addEventListener('DOMContentLoaded', () => {
  // ページのDOM構造が完全に読み込まれたら、ここから処理を開始する

  const themeSelect = document.getElementById('theme');
  // テーマ選択用の<select>要素を取得

  const fontsizeSelect = document.getElementById('fontsize');
  // フォントサイズ選択用の<select>要素を取得

  const languageSelect = document.getElementById('language');
  // 言語選択用の<select>要素を取得

  const deleteBtn = document.getElementById('deleteBtn');
  // アカウント削除ボタンの要素を取得

  const modal = document.getElementById('modal');
  // アカウント削除確認用のモーダル（ポップアップ）要素を取得

  const confirmDelete = document.getElementById('confirmDelete');
  // 削除確認モーダルの「削除」ボタンを取得

  const cancelDelete = document.getElementById('cancelDelete');
  // 削除確認モーダルの「キャンセル」ボタンを取得

  const saveModal = document.getElementById('save-modal');
  // 設定保存確認用のモーダル要素を取得

  const saveBtn = document.getElementById('saveBtn');
  // 設定保存ボタンの要素を取得

  const confirmSave = document.getElementById('confirmSave');
  // 保存確認モーダルの「はい」ボタンを取得

  const cancelSave = document.getElementById('cancelSave');
  // 保存確認モーダルの「キャンセル」ボタンを取得

  const currentPage = window.location.pathname.split('/').pop();
  // 現在のページのファイル名だけを取得（URLパスの最後の部分）

  const isGamePage = (currentPage === 'game.html');
  // 現在のページが「game.html」かどうかを真偽値で判定

  const init = () => {
    // 初期設定を画面に反映するための関数

    const theme = localStorage.getItem('theme') || 'dark';
    // localStorageからテーマ設定を取得。無ければ'dark'を使う

    const fontsize = localStorage.getItem('fontsize') || 'medium';
    // localStorageからフォントサイズを取得。無ければ'medium'を使う

    const language = localStorage.getItem('language') || 'ja';
    // localStorageから言語を取得。無ければ'ja'（日本語）を使う

    if (themeSelect) themeSelect.value = theme;
    // テーマのセレクトボックスに保存値をセット（セレクトボックスがあれば）

    if (fontsizeSelect) fontsizeSelect.value = fontsize;
    // フォントサイズのセレクトボックスに保存値をセット（あれば）

    if (languageSelect) languageSelect.value = language;
    // 言語のセレクトボックスに保存値をセット（あれば）

    if (!isGamePage) {
      // ゲーム画面でなければ、テーマとフォントサイズを適用

      applyTheme(theme);
      // テーマを画面に適用する関数を呼ぶ

      applyFontSize(fontsize);
      // フォントサイズを画面に適用する関数を呼ぶ
    }

    applyLanguage(language);
    // 言語はすべてのページで適用する
  };

  const applyTheme = theme => {
    if (isGamePage) return;
    // ゲーム画面ならテーマ適用処理をスキップ

    if (theme === 'light') {
      // ライトテーマの場合は背景を明るく、文字色を黒に設定

      document.body.style.background = 'linear-gradient(#f0f0f0, #e0e0e0)';
      document.body.style.color = '#000';
    } else {
      // ダークテーマの場合は背景を暗く、文字色を白に設定

      document.body.style.background = 'linear-gradient(#1a1a2e, #16213e)';
      document.body.style.color = '#fff';
    }
  };

  const applyFontSize = size => {
    if (isGamePage) return;
    // ゲーム画面ならフォントサイズ適用処理をスキップ

    const sizeMap = { small: '12px', medium: '16px', large: '20px' };
    // フォントサイズの値に対応したピクセル数を定義

    document.body.style.fontSize = sizeMap[size] || '16px';
    // サイズに応じてフォントサイズを設定。指定外は16pxがデフォルト
  };

  const applyLanguage = lang => {
    // data-en属性を持つ全ての要素を取得し、言語に応じてテキストを書き換える

    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ja || el.textContent;
      // 英語ならdata-en属性の値に、そうでなければdata-ja属性の値に切り替え
      // data-jaがなければ元のテキストのまま
    });
  };

  if (saveBtn && saveModal && confirmSave && cancelSave) {
    // 保存に関わるボタンやモーダル要素がすべて揃っていればイベントを登録

    saveBtn.addEventListener('click', () => saveModal.classList.remove('hidden'));
    // 「保存する」ボタンが押されたら、保存確認モーダルを表示

    cancelSave.addEventListener('click', () => saveModal.classList.add('hidden'));
    // 保存確認モーダルの「キャンセル」でモーダルを非表示に

    confirmSave.addEventListener('click', () => {
      // 保存確認モーダルの「はい」が押されたら

      const theme = themeSelect ? themeSelect.value : 'dark';
      // テーマの選択値を取得。なければ'dark'

      const fontsize = fontsizeSelect ? fontsizeSelect.value : 'medium';
      // フォントサイズの選択値を取得。なければ'medium'

      const language = languageSelect ? languageSelect.value : 'ja';
      // 言語の選択値を取得。なければ'ja'

      localStorage.setItem('theme', theme);
      localStorage.setItem('fontsize', fontsize);
      localStorage.setItem('language', language);
      // それぞれlocalStorageに保存して永続化

      if (!isGamePage) {
        applyTheme(theme);
        applyFontSize(fontsize);
      }
      // ゲーム画面でなければテーマ・フォントサイズを適用

      applyLanguage(language);
      // 言語はすべての画面で適用

      saveModal.classList.add('hidden');
      // 保存モーダルを非表示にする

      alert('設定を保存しました。');
      // ユーザーに保存完了を通知
    });
  }

  if (deleteBtn && modal && confirmDelete && cancelDelete) {
    // アカウント削除関連の要素が揃っていればイベント登録

    deleteBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    // 「アカウント削除」ボタン押下で削除確認モーダル表示

    cancelDelete.addEventListener('click', () => modal.classList.add('hidden'));
    // 削除確認モーダルのキャンセルボタンでモーダル非表示

    confirmDelete.addEventListener('click', () => {
      // 削除確認モーダルの「削除」ボタン押下時の処理

      localStorage.clear();
      // localStorageのデータをすべてクリア（アカウント情報なども含む想定）

      alert('アカウントを削除しました。');
      // ユーザーに削除完了を通知

      window.location.href = '../HTML/login.html';
      // ログイン画面に遷移させる
    });
  }

  init();
  // ページ読み込み時に初期化処理を実行
});
function logout() {
  // ログアウト処理（ページ上のログアウトボタンなどから呼び出し）

  localStorage.clear();
  // localStorageのデータをすべてクリア（ログイン情報も想定）

  window.location.href = "../HTML/login.html";
  // ログイン画面にリダイレクト
}
  // ログイン画面にリダイレクト

document.addEventListener('DOMContentLoaded', () => {
  // ページのDOM構造が完全に読み込まれたら、ここから処理を開始する

  const themeSelect = document.getElementById('theme');
  // テーマ選択用の<select>要素を取得

  const fontsizeSelect = document.getElementById('fontsize');
  // フォントサイズ選択用の<select>要素を取得

  const languageSelect = document.getElementById('language');
  // 言語選択用の<select>要素を取得

  const deleteBtn = document.getElementById('deleteBtn');
  // アカウント削除ボタンの要素を取得

  const modal = document.getElementById('modal');
  // アカウント削除確認用のモーダル（ポップアップ）要素を取得

  const confirmDelete = document.getElementById('confirmDelete');
  // 削除確認モーダルの「削除」ボタンを取得

  const cancelDelete = document.getElementById('cancelDelete');
  // 削除確認モーダルの「キャンセル」ボタンを取得

  const saveModal = document.getElementById('save-modal');
  // 設定保存確認用のモーダル要素を取得

  const saveBtn = document.getElementById('saveBtn');
  // 設定保存ボタンの要素を取得

  const confirmSave = document.getElementById('confirmSave');
  // 保存確認モーダルの「はい」ボタンを取得

  const cancelSave = document.getElementById('cancelSave');
  // 保存確認モーダルの「キャンセル」ボタンを取得

  const currentPage = window.location.pathname.split('/').pop();
  // 現在のページのファイル名だけを取得（URLパスの最後の部分）

  const isGamePage = (currentPage === 'game.html');
  // 現在のページが「game.html」かどうかを真偽値で判定

  const init = () => {
    // 初期設定を画面に反映するための関数

    const theme = localStorage.getItem('theme') || 'dark';
    // localStorageからテーマ設定を取得。無ければ'dark'を使う

    const fontsize = localStorage.getItem('fontsize') || 'medium';
    // localStorageからフォントサイズを取得。無ければ'medium'を使う

    const language = localStorage.getItem('language') || 'ja';
    // localStorageから言語を取得。無ければ'ja'（日本語）を使う

    if (themeSelect) themeSelect.value = theme;
    // テーマのセレクトボックスに保存値をセット（セレクトボックスがあれば）

    if (fontsizeSelect) fontsizeSelect.value = fontsize;
    // フォントサイズのセレクトボックスに保存値をセット（あれば）

    if (languageSelect) languageSelect.value = language;
    // 言語のセレクトボックスに保存値をセット（あれば）

    if (!isGamePage) {
      // ゲーム画面でなければ、テーマとフォントサイズを適用

      applyTheme(theme);
      // テーマを画面に適用する関数を呼ぶ

      applyFontSize(fontsize);
      // フォントサイズを画面に適用する関数を呼ぶ
    }

    applyLanguage(language);
    // 言語はすべてのページで適用する
  };

  const applyTheme = theme => {
    if (isGamePage) return;
    // ゲーム画面ならテーマ適用処理をスキップ

    if (theme === 'light') {
      // ライトテーマの場合は背景を明るく、文字色を黒に設定

      document.body.style.background = 'linear-gradient(#f0f0f0, #e0e0e0)';
      document.body.style.color = '#000';
    } else {
      // ダークテーマの場合は背景を暗く、文字色を白に設定

      document.body.style.background = 'linear-gradient(#1a1a2e, #16213e)';
      document.body.style.color = '#fff';
    }
  };

  const applyFontSize = size => {
    if (isGamePage) return;
    // ゲーム画面ならフォントサイズ適用処理をスキップ

    const sizeMap = { small: '12px', medium: '16px', large: '20px' };
    // フォントサイズの値に対応したピクセル数を定義

    document.body.style.fontSize = sizeMap[size] || '16px';
    // サイズに応じてフォントサイズを設定。指定外は16pxがデフォルト
  };

  const applyLanguage = lang => {
    // data-en属性を持つ全ての要素を取得し、言語に応じてテキストを書き換える

    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ja || el.textContent;
      // 英語ならdata-en属性の値に、そうでなければdata-ja属性の値に切り替え
      // data-jaがなければ元のテキストのまま
    });
  };

  if (saveBtn && saveModal && confirmSave && cancelSave) {
    // 保存に関わるボタンやモーダル要素がすべて揃っていればイベントを登録

    saveBtn.addEventListener('click', () => saveModal.classList.remove('hidden'));
    // 「保存する」ボタンが押されたら、保存確認モーダルを表示

    cancelSave.addEventListener('click', () => saveModal.classList.add('hidden'));
    // 保存確認モーダルの「キャンセル」でモーダルを非表示に

    confirmSave.addEventListener('click', () => {
      // 保存確認モーダルの「はい」が押されたら

      const theme = themeSelect ? themeSelect.value : 'dark';
      // テーマの選択値を取得。なければ'dark'

      const fontsize = fontsizeSelect ? fontsizeSelect.value : 'medium';
      // フォントサイズの選択値を取得。なければ'medium'

      const language = languageSelect ? languageSelect.value : 'ja';
      // 言語の選択値を取得。なければ'ja'

      localStorage.setItem('theme', theme);
      localStorage.setItem('fontsize', fontsize);
      localStorage.setItem('language', language);
      // それぞれlocalStorageに保存して永続化

      if (!isGamePage) {
        applyTheme(theme);
        applyFontSize(fontsize);
      }
      // ゲーム画面でなければテーマ・フォントサイズを適用

      applyLanguage(language);
      // 言語はすべての画面で適用

      saveModal.classList.add('hidden');
      // 保存モーダルを非表示にする

      alert('設定を保存しました。');
      // ユーザーに保存完了を通知
    });
  }

  if (deleteBtn && modal && confirmDelete && cancelDelete) {
    // アカウント削除関連の要素が揃っていればイベント登録

    deleteBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    // 「アカウント削除」ボタン押下で削除確認モーダル表示

    cancelDelete.addEventListener('click', () => modal.classList.add('hidden'));
    // 削除確認モーダルのキャンセルボタンでモーダル非表示

    confirmDelete.addEventListener('click', () => {
      // 削除確認モーダルの「削除」ボタン押下時の処理

      localStorage.clear();
      // localStorageのデータをすべてクリア（アカウント情報なども含む想定）

      alert('アカウントを削除しました。');
      // ユーザーに削除完了を通知

      window.location.href = '../HTML/login.html';
      // ログイン画面に遷移させる
    });
  }

  init();
  // ページ読み込み時に初期化処理を実行
});

function logout() {
  // ログアウト処理（ページ上のログアウトボタンなどから呼び出し）

  localStorage.clear();
  // localStorageのデータをすべてクリア（ログイン情報も想定）

  window.location.href = "../HTML/login.html";
  // ログイン画面にリダイレクト
}

document.addEventListener('DOMContentLoaded', () => {
  // ページのDOM構造が完全に読み込まれたら、ここから処理を開始する

  const themeSelect = document.getElementById('theme');
  // テーマ選択用の<select>要素を取得

  const fontsizeSelect = document.getElementById('fontsize');
  // フォントサイズ選択用の<select>要素を取得

  const languageSelect = document.getElementById('language');
  // 言語選択用の<select>要素を取得

  const deleteBtn = document.getElementById('deleteBtn');
  // アカウント削除ボタンの要素を取得

  const modal = document.getElementById('modal');
  // アカウント削除確認用のモーダル（ポップアップ）要素を取得

  const confirmDelete = document.getElementById('confirmDelete');
  // 削除確認モーダルの「削除」ボタンを取得

  const cancelDelete = document.getElementById('cancelDelete');
  // 削除確認モーダルの「キャンセル」ボタンを取得

  const saveModal = document.getElementById('save-modal');
  // 設定保存確認用のモーダル要素を取得

  const saveBtn = document.getElementById('saveBtn');
  // 設定保存ボタンの要素を取得

  const confirmSave = document.getElementById('confirmSave');
  // 保存確認モーダルの「はい」ボタンを取得

  const cancelSave = document.getElementById('cancelSave');
  // 保存確認モーダルの「キャンセル」ボタンを取得

  const currentPage = window.location.pathname.split('/').pop();
  // 現在のページのファイル名だけを取得（URLパスの最後の部分）

  const isGamePage = (currentPage === 'game.html');
  // 現在のページが「game.html」かどうかを真偽値で判定

  const init = () => {
    // 初期設定を画面に反映するための関数

    const theme = localStorage.getItem('theme') || 'dark';
    // localStorageからテーマ設定を取得。無ければ'dark'を使う

    const fontsize = localStorage.getItem('fontsize') || 'medium';
    // localStorageからフォントサイズを取得。無ければ'medium'を使う

    const language = localStorage.getItem('language') || 'ja';
    // localStorageから言語を取得。無ければ'ja'（日本語）を使う

    if (themeSelect) themeSelect.value = theme;
    // テーマのセレクトボックスに保存値をセット（セレクトボックスがあれば）

    if (fontsizeSelect) fontsizeSelect.value = fontsize;
    // フォントサイズのセレクトボックスに保存値をセット（あれば）

    if (languageSelect) languageSelect.value = language;
    // 言語のセレクトボックスに保存値をセット（あれば）

    if (!isGamePage) {
      // ゲーム画面でなければ、テーマとフォントサイズを適用

      applyTheme(theme);
      // テーマを画面に適用する関数を呼ぶ

      applyFontSize(fontsize);
      // フォントサイズを画面に適用する関数を呼ぶ
    }

    applyLanguage(language);
    // 言語はすべてのページで適用する
  };

  const applyTheme = theme => {
    if (isGamePage) return;
    // ゲーム画面ならテーマ適用処理をスキップ

    if (theme === 'light') {
      // ライトテーマの場合は背景を明るく、文字色を黒に設定

      document.body.style.background = 'linear-gradient(#f0f0f0, #e0e0e0)';
      document.body.style.color = '#000';
    } else {
      // ダークテーマの場合は背景を暗く、文字色を白に設定

      document.body.style.background = 'linear-gradient(#1a1a2e, #16213e)';
      document.body.style.color = '#fff';
    }
  };

  const applyFontSize = size => {
    if (isGamePage) return;
    // ゲーム画面ならフォントサイズ適用処理をスキップ

    const sizeMap = { small: '12px', medium: '16px', large: '20px' };
    // フォントサイズの値に対応したピクセル数を定義

    document.body.style.fontSize = sizeMap[size] || '16px';
    // サイズに応じてフォントサイズを設定。指定外は16pxがデフォルト
  };

  const applyLanguage = lang => {
    // data-en属性を持つ全ての要素を取得し、言語に応じてテキストを書き換える

    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ja || el.textContent;
      // 英語ならdata-en属性の値に、そうでなければdata-ja属性の値に切り替え
      // data-jaがなければ元のテキストのまま
    });
  };

  if (saveBtn && saveModal && confirmSave && cancelSave) {
    // 保存に関わるボタンやモーダル要素がすべて揃っていればイベントを登録

    saveBtn.addEventListener('click', () => saveModal.classList.remove('hidden'));
    // 「保存する」ボタンが押されたら、保存確認モーダルを表示

    cancelSave.addEventListener('click', () => saveModal.classList.add('hidden'));
    // 保存確認モーダルの「キャンセル」でモーダルを非表示に

    confirmSave.addEventListener('click', () => {
      // 保存確認モーダルの「はい」が押されたら

      const theme = themeSelect ? themeSelect.value : 'dark';
      // テーマの選択値を取得。なければ'dark'

      const fontsize = fontsizeSelect ? fontsizeSelect.value : 'medium';
      // フォントサイズの選択値を取得。なければ'medium'

      const language = languageSelect ? languageSelect.value : 'ja';
      // 言語の選択値を取得。なければ'ja'

      localStorage.setItem('theme', theme);
      localStorage.setItem('fontsize', fontsize);
      localStorage.setItem('language', language);
      // それぞれlocalStorageに保存して永続化

      if (!isGamePage) {
        applyTheme(theme);
        applyFontSize(fontsize);
      }
      // ゲーム画面でなければテーマ・フォントサイズを適用

      applyLanguage(language);
      // 言語はすべての画面で適用

      saveModal.classList.add('hidden');
      // 保存モーダルを非表示にする

      alert('設定を保存しました。');
      // ユーザーに保存完了を通知
    });
  }

  if (deleteBtn && modal && confirmDelete && cancelDelete) {
    // アカウント削除関連の要素が揃っていればイベント登録

    deleteBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    // 「アカウント削除」ボタン押下で削除確認モーダル表示

    cancelDelete.addEventListener('click', () => modal.classList.add('hidden'));
    // 削除確認モーダルのキャンセルボタンでモーダル非表示

    confirmDelete.addEventListener('click', () => {
      // 削除確認モーダルの「削除」ボタン押下時の処理

      localStorage.clear();
      // localStorageのデータをすべてクリア（アカウント情報なども含む想定）

      alert('アカウントを削除しました。');
      // ユーザーに削除完了を通知

      window.location.href = '../HTML/login.html';
      // ログイン画面に遷移させる
    });
  }

  init();
  // ページ読み込み時に初期化処理を実行
});

function logout() {
  // ログアウト処理（ページ上のログアウトボタンなどから呼び出し）

  localStorage.clear();
  // localStorageのデータをすべてクリア（ログイン情報も想定）

  window.location.href = "../HTML/login.html";
  // ログイン画面にリダイレクト
}

