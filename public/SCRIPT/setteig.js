document.addEventListener('DOMContentLoaded', () => {
      const modal = document.getElementById('modal');
      const deleteBtn = document.getElementById('deleteBtn');
      const confirmDelete = document.getElementById('confirmDelete');
      const cancelDelete = document.getElementById('cancelDelete');

      deleteBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });

      cancelDelete.addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      confirmDelete.addEventListener('click', () => {
        modal.classList.add('hidden');
        alert('アカウントを削除しました。');
        // 削除処理をここに書く（API呼び出しなど）
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const deleteBtn = document.getElementById('deleteBtn');
  const confirmDelete = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');

  const saveModal = document.getElementById('save-modal');
  const saveBtn = document.querySelector('.primary-button');
  const confirmSave = document.getElementById('confirmSave');
  const cancelSave = document.getElementById('cancelSave');

  // アカウント削除の処理
  deleteBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  cancelDelete.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  confirmDelete.addEventListener('click', () => {
    modal.classList.add('hidden');
    alert('アカウントを削除しました。');
    // 削除処理をここに書く（API呼び出しなど）
  });

  // 保存の確認モーダル表示
  saveBtn.addEventListener('click', () => {
    saveModal.classList.remove('hidden');
  });

  cancelSave.addEventListener('click', () => {
    saveModal.classList.add('hidden');
  });

  confirmSave.addEventListener('click', () => {
    saveModal.classList.add('hidden');
    alert('設定を保存しました。');
    // 保存処理をここに書く（フォーム送信、ローカル保存など）
  });
});

function logout() {
  // ここでログアウト処理（セッション破棄やトークン削除など）を実装するなら行う
  // 例: localStorage.clear(); セッション削除等

  // ログインページへリダイレクト
  window.location.href = "../HTML/login.html";
}
