const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const db = new sqlite3.Database('./database.db');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// 게시판 테이블 생성
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// 게시글 목록 페이지
app.get('/', (req, res) => {
    db.all('SELECT * FROM posts ORDER BY created_at DESC', (err, rows) => {
        res.render('index', { posts: rows });
    });
});

// 게시글 작성 페이지
app.get('/write', (req, res) => {
    res.render('write');
});

// 게시글 작성 처리
app.post('/write', (req, res) => {
    const { title, content } = req.body;
    db.run('INSERT INTO posts (title, content) VALUES (?, ?)', [title, content], (err) => {
        res.redirect('/');
    });
});

// 게시글 상세 보기
app.get('/view/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        res.render('view', { post: row });
    });
});

// 서버 실행
app.listen(3000, () => {
    console.log('게시판 서버 구동 중! 👉 http://localhost:3000');
});
