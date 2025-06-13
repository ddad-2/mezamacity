//ログイン時のエラーメッセージの表示

// public/frontend/login-client.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const msgBox = document.getElementById("msg-box");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // ページ遷移を止める

        msgBox.textContent = ''; // メッセージボックスをクリア
        msgBox.className = "msg-box"; // クラスをリセット

        const formData = new FormData(form);
        const jsonData = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            const data = await res.json();

            if (res.ok) { // ステータスコードが2xxの場合（成功）
                msgBox.className = "success-msg";
                msgBox.textContent = data.message;
                form.reset(); // フォームをリセット
                // 成功したらダッシュボードやホーム画面へリダイレクト
                // 例: window.location.href = "/dashboard.html";
                console.log("ログイン成功！", data.user);
            } else { // ステータスコードが2xx以外の場合（エラー）
                msgBox.className = "error-msg";
                msgBox.textContent = data.error || "不明なログインエラーが発生しました";
            }
        } catch (err) {
            msgBox.className = "error-msg";
            msgBox.textContent = "通信エラーが発生しました";
            console.error("Fetch error:", err);
        }
    });
});