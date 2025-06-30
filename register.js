const express = require("express");
const router = express.Router();
const pool = require("./db");
const bcrypt = require("bcryptjs");

// 新規登録のAPIエンドポイント
router.post("/", (req, res) => {
    const { username, email, password } = req.body;

    // ここでパスワードの一致チェックは不要（クライアント側で済ませる）

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error("パスワードのハッシュ化エラー:", err);
            return res.status(500).json({ error: "パスワードの処理中にエラーが発生しました。" });
        }

        const query = 'INSERT INTO users (user_name, password, email) VALUES (?, ?, ?)';
        const values = [username, hashedPassword, email];

        pool.query(query, values, (err, results) => {
            if (err) {
                console.error("ユーザー登録エラー:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "ユーザー名またはメールアドレスが既に使用されています" });
                }
                return res.status(500).json({ error: "ユーザー登録中に予期せぬエラーが発生しました。" });
            }
            console.log("ユーザー登録成功:", results);
            res.status(201).json({ message: "ユーザー登録が完了しました!" });
        });
    });
});

module.exports = router;
