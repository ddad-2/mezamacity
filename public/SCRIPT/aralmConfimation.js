document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('alarm-delete-modal');
  const confirmBtn = document.getElementById('alarmConfirmDelete');
  const cancelBtn = document.getElementById('alarmCancelDelete');

  let currentCard = null; // 現在削除対象のカード

  // 全ての削除ボタンにイベントを追加
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCard = btn.closest('.alarm-card');
      modal.classList.remove('hidden');
    });
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    currentCard = null;
  });

  confirmBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (currentCard) {
      currentCard.remove(); // HTMLから削除
      alert("アラームを削除しました。");
    }
    currentCard = null;
  });
});
