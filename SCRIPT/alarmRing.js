// alarmRing.js

//backend/ring-alarm.jsでalarmの設定されている時間に
//通知を受け取ってalarmRing.htmlを表示する
const socket = io();

// アラームが鳴り始めた時間を記録
let alarmStartTime = null;
let responseTimeInterval = null;

// ページが読み込まれた時にアラーム開始時間を記録
window.addEventListener('DOMContentLoaded', () => {
    alarmStartTime = Date.now();
    console.log("アラーム開始時間を記録:", new Date(alarmStartTime));
    
    // リアルタイム表示を開始
    startResponseTimeDisplay();
});

// リアルタイムで反応時間と報酬を表示する関数
function startResponseTimeDisplay() {
    responseTimeInterval = setInterval(() => {
        if (alarmStartTime) {
            const currentTime = Date.now();
            const responseTime = currentTime - alarmStartTime;
            const responseTimeSec = (responseTime / 1000).toFixed(1);
            const potentialReward = calculateReward(responseTime);
            
            // 表示を更新
            const responseTimeEl = document.getElementById('response-time');
            const potentialRewardEl = document.getElementById('potential-reward');
            
            if (responseTimeEl) {
                responseTimeEl.textContent = responseTimeSec;
            }
            if (potentialRewardEl) {
                potentialRewardEl.textContent = potentialReward;
                
                // 報酬レベルに応じて色を変更
                if (potentialReward >= 2000) {
                    potentialRewardEl.style.color = '#4caf50'; // 緑（最高報酬）
                } else if (potentialReward >= 1500) {
                    potentialRewardEl.style.color = '#8bc34a'; // 薄緑
                } else if (potentialReward >= 1000) {
                    potentialRewardEl.style.color = '#ff9800'; // オレンジ
                } else if (potentialReward >= 500) {
                    potentialRewardEl.style.color = '#f44336'; // 赤
                } else {
                    potentialRewardEl.style.color = '#9e9e9e'; // グレー（報酬なし）
                }
            }
        }
    }, 100); // 100msごとに更新
}

// リアルタイム表示を停止する関数
function stopResponseTimeDisplay() {
    if (responseTimeInterval) {
        clearInterval(responseTimeInterval);
        responseTimeInterval = null;
    }
}

socket.on("alarm", (data) => {
    console.log("アラーム通知受信", data);

    //アラーム時間をローカルストレージに保存
    if (data.alarm_time) {
      localStorage.setItem("alarm_time", data.alarm_time);
    }

    // アラーム開始時間を記録
    alarmStartTime = Date.now();

    //localStorageから現在のユーザーIDを取得
    const currentLoggedInUserId = localStorage.getItem('user_id');

    // サーバー（DB）から通知されたアラームのuser_id
    // これがDBのalarm_settingsテーブルから取得されたuser_id
    const alarmTriggeredUserId = data.user_id;

    // 現在ログインしているユーザーのIDと、アラームがトリガーされたユーザーのIDを比較
    if (currentLoggedInUserId && currentLoggedInUserId === String(alarmTriggeredUserId)) {
        console.log(`現在のユーザー(${currentLoggedInUserId})向けのアラームです。画面遷移します。`);
        window.location.href = "/HTML/alarmRing.html";
    } else {
        // user_idが一致しない場合、または現在のユーザーIDが取得できない場合
        console.log(`別ユーザー(${alarmTriggeredUserId})向けのアラーム通知のため、画面遷移しません。現在のユーザーID: ${currentLoggedInUserId}`);
    }
});

// ユーザーIDを取得する関数
async function getCurrentUserId() {
    try {
        const res = await fetch("/api/get_current_user");
        const data = await res.json();
        if (data.success && data.user_id) {
            return data.user_id;
        }
    } catch (e) {
        console.error("ユーザーIDの取得に失敗:", e);
    }
    return null;
}

// 現在のお金を取得する関数
async function getCurrentMoney(userId) {
    try {
        const res = await fetch(`/api/get_money?user_id=${userId}`);
        const data = await res.json();
        if (data.success && data.money !== undefined) {
            return data.money;
        }
    } catch (e) {
        console.error("お金の取得に失敗:", e);
    }
    return 0;
}

// お金を更新する関数
async function updateMoney(userId, newAmount) {
    try {
        const res = await fetch("/api/update_money", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                money: newAmount
            })
        });
        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error("お金の更新に失敗:", e);
        return false;
    }
}

// 反応速度に応じたお金を計算する関数
function calculateReward(responseTimeMs) {
    // 反応時間（秒）を計算
    const responseTimeSec = responseTimeMs / 1000;
    
    let reward = 0;
    
    if (responseTimeSec <= 60) {
        // 1分以内: 2000円
        reward = 2000;
    } else if (responseTimeSec <= 90) {
        // 1分30秒以内: 1500円
        reward = 1500;
    } else if (responseTimeSec <= 120) {
        // 2分以内: 1000円
        reward = 1000;
    } else if (responseTimeSec <= 150) {
        // 2分30秒以内: 500円
        reward = 500;
    } else if (responseTimeSec <= 180) {
        // 3分以内: 0円
        reward = 0;
    } else {
        // 3分超: 0円
        reward = 0;
    }
    
    return reward;
}

async function stopAlarm() {
    // リアルタイム表示を停止
    stopResponseTimeDisplay();
    
    const iframe = document.getElementById("alarm-sound");
    if (iframe) {
        iframe.remove(); // YouTubeの音を止める簡易的な方法
    }

    // 反応時間を計算
    if (alarmStartTime) {
        const responseTime = Date.now() - alarmStartTime;
        const responseTimeSec = (responseTime / 1000).toFixed(1);
        
        console.log(`アラーム反応時間: ${responseTimeSec}秒`);
        
        // 報酬を計算
        const reward = calculateReward(responseTime);
        
        try {
            // ユーザーIDを取得
            const userId = await getCurrentUserId();
            if (userId) {
                // 現在のお金を取得
                const currentMoney = await getCurrentMoney(userId);
                const newMoney = currentMoney + reward;
                
                // お金を更新
                const success = await updateMoney(userId, newMoney);
                
                if (success) {
                    alert(`アラームを停止しました！\n反応時間: ${responseTimeSec}秒\n報酬: ${reward}円\n現在の所持金: ${newMoney}円`);
                } else {
                    alert(`アラームを停止しました！\n反応時間: ${responseTimeSec}秒\n報酬: ${reward}円（保存に失敗）`);
                }
            } else {
                alert(`アラームを停止しました！\n反応時間: ${responseTimeSec}秒\n報酬: ${reward}円（ユーザー情報取得失敗）`);
            }
        } catch (error) {
            console.error("報酬処理エラー:", error);
            alert(`アラームを停止しました！\n反応時間: ${responseTimeSec}秒\n（報酬処理でエラーが発生しました）`);
        }
    } else {
        alert("アラームを停止しました");
    }
    
    window.location.href = "home.html"; // ここでhome.htmlに遷移
}

async function snoozeAlarm() {
    // リアルタイム表示を停止
    stopResponseTimeDisplay();
    
    const iframe = document.getElementById("alarm-sound");
    if (iframe) {
        iframe.remove(); // 音を止める
    }

    // 反応時間を計算（スヌーズの場合は報酬を半分にする）
    if (alarmStartTime) {
        const responseTime = Date.now() - alarmStartTime;
        const responseTimeSec = (responseTime / 1000).toFixed(1);
        
        console.log(`スヌーズ反応時間: ${responseTimeSec}秒`);
        
        // 報酬を計算（スヌーズなので半分）
        const baseReward = calculateReward(responseTime);
        const reward = Math.floor(baseReward / 2);
        
        try {
            // ユーザーIDを取得
            const userId = await getCurrentUserId();
            if (userId) {
                // 現在のお金を取得
                const currentMoney = await getCurrentMoney(userId);
                const newMoney = currentMoney + reward;
                
                // お金を更新
                const success = await updateMoney(userId, newMoney);
                
                if (success) {
                    alert(`5分後に再アラームします\n反応時間: ${responseTimeSec}秒\nスヌーズ報酬: ${reward}円\n現在の所持金: ${newMoney}円`);
                } else {
                    alert(`5分後に再アラームします\n反応時間: ${responseTimeSec}秒\nスヌーズ報酬: ${reward}円（保存に失敗）`);
                }
            } else {
                alert(`5分後に再アラームします\n反応時間: ${responseTimeSec}秒\nスヌーズ報酬: ${reward}円（ユーザー情報取得失敗）`);
            }
        } catch (error) {
            console.error("スヌーズ報酬処理エラー:", error);
            alert(`5分後に再アラームします\n反応時間: ${responseTimeSec}秒\n（報酬処理でエラーが発生しました）`);
        }
    } else {
        alert("5分後に再アラームします");
    }

    // 本当に5分後に再び鳴らす処理を行いたいなら、ここで別の処理が必要ですが、
    // 今回は仮に一旦ホームに戻るとしておきます。
    window.location.href = "home.html";
}
