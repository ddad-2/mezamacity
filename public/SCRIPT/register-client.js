//registerのエラーメッセージの表示
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("register-form");
    const msgBox = document.getElementById("msg-box");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //ページ遷移を止める

        //jsonに変換
        const formData = new FormData(form);
        const jsonData = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
            "confirm-password": formData.get("confirm-password"),
        };

        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            const data = await res.json();

            if (res.ok) {
                msgBox.className = "success-msg";
                msgBox.textContent = data.message || data.error || "登録が完了しました"; // 成功時は message を期待
                form.reset(); // 登録成功時にフォームリセット
            } else {
                msgBox.className = "error-msg";
                msgBox.textContent = data.error || data.message || "不明なエラーが発生しました"; // エラー時は error を期待
            }

        } catch (err) {
            msgBox.className = "error-msg";
            msgBox.textContent = "通信エラーが発生しました";
            console.error(err);
        }
    });
});
