    document.addEventListener("DOMContentLoaded", () => {
      const youtubeCheckbox = document.getElementById("use-youtube");
      const youtubeSection = document.getElementById("youtube-section");
      const defaultSoundSection = document.getElementById("default-sound-section");

      // 初期表示
      youtubeSection.style.display = "none";
      defaultSoundSection.style.display = "flex";

      // YouTubeチェックボックスの切替処理
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

      // フォーム送信処理
      document.getElementById("alarm-form").addEventListener("submit", function(e) {
        e.preventDefault();
        const form = e.target;
        const alarmTime = form.alarmTime.value;
        const soundId = form.soundId.value;
        const youtubeUrl = form.youtubeUrl.value;

        const weekdays = Array.from(form.querySelectorAll("input[name='weekdays']:checked"))
          .map(cb => cb.value);

        // 送信内容の確認（本来はここでサーバーへ送信）
        alert(
          `アラーム登録内容：\n` +
          `時刻: ${alarmTime}\n` +
          `曜日: ${weekdays.length > 0 ? weekdays.join(" ") : "指定なし"}\n` +
          (youtubeCheckbox.checked ? `YouTube URL: ${youtubeUrl}` : `音: ${soundId}`)
        );

        form.reset();
        youtubeSection.style.display = "none";
        defaultSoundSection.style.display = "flex";
        document.getElementById("youtube-url").required = false;
        document.getElementById("sound-a").required = true;
      });
    });
