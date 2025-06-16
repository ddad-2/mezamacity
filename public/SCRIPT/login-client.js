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

                //サーバーから受け取ったuser_idをlocalStorageに保存
                // サーバーのlogin.jsでレスポンスにuser.user_idが含まれていることを確認してください
                if (data.user && data.user.user_id) {
                    localStorage.setItem('user_id', data.user.user_id);
                    console.log('User ID saved to localStorage:', data.user.user_id);
                }

                // ログイン成功後、ホーム画面へリダイレクト
                window.location.href = "/HTML/home.html";
                console.log("ログイン成功！", data.user);
            } else { // ステータスコードが2xx以外の場合（エラー）
                msgBox.className = "error-msg";
                msgBox.textContent = data.error || "不明なログインエラーが発生しました";
                console.error("ログインエラー:", data.error);
            }
        } catch (err) {
            msgBox.className = "error-msg";
            msgBox.textContent = "通信エラーが発生しました";
            console.error("Fetch error:", err);
        }
    });
});
