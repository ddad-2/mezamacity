<<<<<<< HEAD
// alarmEditing.js
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingId = urlParams.get("id"); // URLクエリから ?id= 取得

  const youtubeCheckbox = document.getElementById("use-youtube");
  const youtubeSection = document.getElementById("youtube-section");
  const defaultSoundSection = document.getElementById("default-sound-section");

  // 初期非表示
  youtubeSection.style.display = "none";
  defaultSoundSection.style.display = "flex";

  youtubeCheckbox.addEventListener("change", () => {
    if (youtubeCheckbox.checked) {
      youtubeSection.style.display = "flex";
      defaultSoundSection.style.display = "none";
      document.getElementById("youtube-url").required = true;
      document.getElementById("sound-a").required = false;
    } else {
      youtubeSection.style.display = "none";
      defaultSoundSection.style.display = "flex";
      document.getElementById("youtube-url").required = false;
      document.getElementById("sound-a").required = true;
    }
  });

  // 既存のアラーム情報を取得してフォームに反映
  if (settingId) {
    try {
      const res = await fetch(`/alarm/detail/${settingId}`);
      const data = await res.json();

      document.querySelector("input[name='alarmTime']").value = data.alarm_time;

      if (data.source_type === 1) {
        youtubeCheckbox.checked = true;
        youtubeSection.style.display = "flex";
        defaultSoundSection.style.display = "none";
        document.getElementById("youtube-url").value = data.sound_url;
        document.getElementById("youtube-url").required = true;
        document.getElementById("sound-a").required = false;
      } else {
        youtubeCheckbox.checked = false;
        youtubeSection.style.display = "none";
        defaultSoundSection.style.display = "flex";
        document.getElementById("sound-a").value = data.sound_id;
        document.getElementById("youtube-url").required = false;
        document.getElementById("sound-a").required = true;
      }

      // 曜日チェックを反映
      data.weekdays.forEach(wd => {
        const checkbox = document.querySelector(`input[name='weekdays'][value='${weekdayEnToJa(wd)}']`);
        if (checkbox) checkbox.checked = true;
      });

    } catch (err) {
      alert("アラーム情報の取得に失敗しました。");
      console.error(err);
    }
  }

  // 保存処理（PUT）
  document.getElementById("alarmEditing-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const alarmTime = document.querySelector("input[name='alarmTime']").value;
    const soundId = document.getElementById("sound-a").value;
    const youtubeUrl = document.getElementById("youtube-url").value;
    const weekdays = Array.from(document.querySelectorAll("input[name='weekdays']:checked"))
                          .map(cb => cb.value);

    try {
      await fetch(`/alarm/${settingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alarmTime,
          soundId,
          youtubeUrl,
          weekdays
        })
      });

      window.location.href = "alarmConfimation.html";
    } catch (err) {
      alert("アラームの更新に失敗しました。");
      console.error(err);
      window.location.href = "alarmConfimation.html";
    }
  });

  function weekdayEnToJa(wd) {
    const map = { Mon: "月", Tue: "火", Wed: "水", Thu: "木", Fri: "金", Sat: "土", Sun: "日" };
    return map[wd] || wd;
  }
});
=======
// alarmEditing.js
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const settingId = urlParams.get("id"); // URLクエリから ?id= 取得

  const youtubeCheckbox = document.getElementById("use-youtube");
  const youtubeSection = document.getElementById("youtube-section");
  const defaultSoundSection = document.getElementById("default-sound-section");

  // 初期非表示
  youtubeSection.style.display = "none";
  defaultSoundSection.style.display = "flex";

  youtubeCheckbox.addEventListener("change", () => {
    if (youtubeCheckbox.checked) {
      youtubeSection.style.display = "flex";
      defaultSoundSection.style.display = "none";
      document.getElementById("youtube-url").required = true;
      document.getElementById("sound-a").required = false;
    } else {
      youtubeSection.style.display = "none";
      defaultSoundSection.style.display = "flex";
      document.getElementById("youtube-url").required = false;
      document.getElementById("sound-a").required = true;
    }
  });

  // 既存のアラーム情報を取得してフォームに反映
  if (settingId) {
    try {
      const res = await fetch(`/alarm/detail/${settingId}`);
      const data = await res.json();

      document.querySelector("input[name='alarmTime']").value = data.alarm_time;

      if (data.source_type === 1) {
        youtubeCheckbox.checked = true;
        youtubeSection.style.display = "flex";
        defaultSoundSection.style.display = "none";
        document.getElementById("youtube-url").value = data.sound_url;
        document.getElementById("youtube-url").required = true;
        document.getElementById("sound-a").required = false;
      } else {
        youtubeCheckbox.checked = false;
        youtubeSection.style.display = "none";
        defaultSoundSection.style.display = "flex";
        document.getElementById("sound-a").value = data.sound_id;
        document.getElementById("youtube-url").required = false;
        document.getElementById("sound-a").required = true;
      }

      // 曜日チェックを反映
      data.weekdays.forEach(wd => {
        const checkbox = document.querySelector(`input[name='weekdays'][value='${weekdayEnToJa(wd)}']`);
        if (checkbox) checkbox.checked = true;
      });

    } catch (err) {
      alert("アラーム情報の取得に失敗しました。");
      console.error(err);
    }
  }

  // 保存処理（PUT）
  document.getElementById("alarmEditing-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const alarmTime = document.querySelector("input[name='alarmTime']").value;
    const soundId = document.getElementById("sound-a").value;
    const youtubeUrl = document.getElementById("youtube-url").value;
    const weekdays = Array.from(document.querySelectorAll("input[name='weekdays']:checked"))
                          .map(cb => cb.value);

    try {
      await fetch(`/alarm/${settingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alarmTime,
          soundId,
          youtubeUrl,
          weekdays
        })
      });

      window.location.href = "alarmConfimation.html";
    } catch (err) {
      alert("アラームの更新に失敗しました。");
      console.error(err);
      window.location.href = "alarmConfimation.html";
    }
  });

  function weekdayEnToJa(wd) {
    const map = { Mon: "月", Tue: "火", Wed: "水", Thu: "木", Fri: "金", Sat: "土", Sun: "日" };
    return map[wd] || wd;
  }
});
>>>>>>> a34aa9bbd2c57d00de2652b37fd1b460dabdb918
