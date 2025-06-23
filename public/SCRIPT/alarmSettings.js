document.addEventListener("DOMContentLoaded", () => {
  const youtubeCheckbox = document.getElementById("use-youtube");
  const youtubeSection = document.getElementById("youtube-section");
  const defaultSoundSection = document.getElementById("default-sound-section");

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

  document.getElementById("alarm-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const form = e.target;
    const alarmTime = form.alarmTime.value;
    const soundId = form.soundId.value;
    const youtubeUrl = form.youtubeUrl.value;
    const weekdays = Array.from(form.querySelectorAll("input[name='weekdays']:checked")).map(cb => cb.value);

    alert(
      `アラーム登録内容：\n` +
      `時刻: ${alarmTime}\n` +
      `曜日: ${weekdays.length > 0 ? weekdays.join(" ") : "指定なし"}\n` +
      (youtubeCheckbox.checked ? `YouTube URL: ${youtubeUrl}` : `音: ${soundId}`)
    );

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

    form.reset();
    youtubeSection.style.display = "none";
    defaultSoundSection.style.display = "flex";
    document.getElementById("youtube-url").required = false;
    document.getElementById("sound-a").required = true;
  });

  function extractVideoId(url) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([^\s&]+)/);
    return match ? match[1] : null;
  }

  function playYouTube(videoId) {
    const iframe = document.createElement("iframe");
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
