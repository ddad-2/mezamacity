document.addEventListener("DOMContentLoaded", () => {
  const youtubeCheckbox = document.getElementById("use-youtube");
  const youtubeSection = document.getElementById("youtube-section");
  const defaultSoundSection = document.getElementById("default-sound-section");

  // 現在時刻をデフォルト値として設定
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM形式
  const timeInput = document.querySelector("input[name='alarmTime']");
  if (timeInput && timeInput.value === "07:00") {
    timeInput.value = currentTime;
  }

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

  document.getElementById("alarm-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const alarmTime = form.alarmTime.value;
    const soundId = form.soundId.value;
    const youtubeUrl = form.youtubeUrl.value;
    const weekdays = Array.from(form.querySelectorAll("input[name='weekdays']:checked")).map(cb => cb.value);

    // alert(
    //   `アラーム登録内容：\n` +
    //   `時刻: ${alarmTime}\n` +
    //   `曜日: ${weekdays.length > 0 ? weekdays.join(" ") : "指定なし"}\n` +
    //   (youtubeCheckbox.checked ? `YouTube URL: ${youtubeUrl}` : `音: ${soundId}`)
    // );

    // 🔊 ここで音を鳴らす
    if (youtubeCheckbox.checked) {
      const videoId = extractVideoId(youtubeUrl);
      if (videoId) {
        playYouTube(videoId);
      } else {
        alert("YouTubeのURLが正しくありません。");
      }
    } else {
      playDefaultSound(soundId);
    }

    // --- ここから保存API呼び出し ---
    try {
      const userId = localStorage.getItem("user_id");
      const res = await fetch("/alarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          soundId,
          alarmTime,
          youtubeUrl,
          weekdays
        })
      });
      // 成功・失敗に関わらず遷移
      window.location.href = "alarmConfimation.html";
    } catch (err) {
      // 通信エラー時も遷移
      window.location.href = "alarmConfimation.html";
    }
    // --- ここまで保存API呼び出し ---

    // フォームリセット等は画面遷移するので不要
  });

  function extractVideoId(url) {
    // YouTubeのURLから動画IDを抽出（短縮URLと通常URL両対応）
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/i
    );
    return match ? match[1] : null;
  }

  function playYouTube(videoId) {
    // 既存のiframeがあれば削除（多重再生防止）
    const oldIframe = document.getElementById("alarm-youtube-iframe");
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "alarm-youtube-iframe";
    iframe.width = "1";
    iframe.height = "1";
    iframe.style = "position:absolute; left:-9999px;";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
    iframe.allow = "autoplay";
    iframe.setAttribute("allowfullscreen", "");
    document.body.appendChild(iframe);
  }

  function playDefaultSound(id) {
    let audioSrc = "";
    switch (id) {
      case "picoon":
        audioSrc = "../SOUND/picoon.mp3";
        break;
      case "bell":
        audioSrc = "../SOUND/bell.mp3";
        break;
      case "bird":
        audioSrc = "../SOUND/bird.mp3";
        break;
      case "eva":
        audioSrc = "../SOUND/eva.mp3";
        break;
      default:
        alert("音声が選択されていません。");
        return;
    }

    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.play();
  }
});

