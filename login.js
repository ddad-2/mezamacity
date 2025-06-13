//ログイン

const express = require("express");
const router = express.Router();
const pool = require("./db");
const bcrypt = require("bcryptjs");

//ログインのデータを処理するAPIエンドポイント
router.post("/", (req, res) => {
    const { email, password} = req.body;

    const query = ('SELECT * FROM users WHERE email = ?');
    pool.query(query, [email], async (err, results) => {
        if (err) {
            console.error("ログイン時のDBエラー:", err);
            return res.status(500).json({error: "サーバーエラーが発生しました。"});
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。"});

        }

        const user = results[0];
        //ハッシュ化の比較
        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // ログイン成功
                console.log("ログイン成功:", user.user_name);
                // 成功時のステータスコードを 200 OK に修正
                // (201 Created は新規リソース作成時に使うのが一般的)
                res.status(200).json({ message: "ログインに成功しました！", user: { username: user.user_name, email: user.email } });
            } else {
                // パスワードが一致しない場合
                return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。" });
            }
        } catch (compareError) {
            console.error("パスワード比較エラー:", compareError);
            return res.status(500).json({ error: "パスワードの検証中にエラーが発生しました。" });
        }
    });
})

module.exports = router;