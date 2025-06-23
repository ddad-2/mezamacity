//新規登録のデータを処理するAPIエンドポイント
// backend/register.js
const express = require("express");
const router = express.Router();
const pool = require("./db");
const bcrypt = require("bcryptjs");


//新規登録のデータを処理するAPIエンドポイント
router.post("/", (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword} = req.body;

    if (password !== confirmPassword) {
            return res.status(400).json({ error: "パスワードが一致しません" });
    }

    //パスワードのハッシュ化
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console,error("パスワードのハッシュ化エラー:", err);
            return res.status(500).json({error: "パスワードの処理中にエラーが発生しました。"});
        }

        const query = 'INSERT INTO users (user_name, password, email) VALUES (?, ?, ?)';
        const values = [username, hashedPassword, email]; //todo パスワードハッシュ化
        pool.query(query, values, (err, results) => {
            if(err) {
                console.error("ユーザー登録エラー:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "ユーザー名またはメールアドレスが既に使用されています" });
                }
                // その他のDBエラー
                return res.status(500).json({ error: "ユーザー登録中に予期せぬエラーが発生しました。" });
            }
            console.log("ユーザー登録成功:", results);
            res.status(201).json({ message: "ユーザー登録が完了しました!" });
        });
    })
});

module.exports = router;