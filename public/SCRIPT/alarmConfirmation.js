//アラームの削除処理
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("alarm-delete-modal");
  const confirmBtn = document.getElementById("alarmConfirmDelete");
  const cancelBtn = document.getElementById("alarmCancelDelete");

  let currentCard = null;
  let currentSettingId = null;

  // ボタンの追加は後からレンダリングされるので、少し遅延させて探す
  setTimeout(() => {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentCard = btn.closest(".alarm-card");
        currentSettingId = btn.getAttribute("data-id");
        modal.classList.remove("hidden");
      });
    });
  }, 300); // 300ms後に探す（DOM描画後）
  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    currentCard = null;
    currentSettingId = null;
  });

  confirmBtn.addEventListener("click", () => {
    if (!currentSettingId) return;

    fetch(`/alarm/delete/${currentSettingId}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(() => {
        if (currentCard) currentCard.remove();
        alert("アラームを削除しました。");
        modal.classList.add("hidden");
        currentCard = null;
        currentSettingId = null;
      })
      .catch(err => {
        console.error("削除エラー:", err);
        alert("削除に失敗しました。");
      });
  });
});
