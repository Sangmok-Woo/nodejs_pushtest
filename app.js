// app.js

// --- 상단: require 문들 ---
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./db'); // db.js 에서 가져옴

// --- 미들웨어 설정 ---
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key-here',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// --- 데이터베이스 테이블 초기화 ---
db.serialize(() => {
    // 이 괄호 안의 내용 전체를 복사해주세요! 👇
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});


// --- ✨✨✨ 3단계: 라우터 연결 ✨✨✨ ---
// routes/posts.js 파일에서 내보낸 router 객체를 가져옵니다.
const postsRouter = require('./routes/posts');

// '/' 로 시작하는 모든 경로는 이제 postsRouter가 담당하게 됩니다.
app.use('/', postsRouter);
// 예를 들어, 사용자가 /write 로 접속하면, 실제로는 postsRouter에 정의된 router.get('/write', ...) 가 실행됩니다.


// --- 기존 라우트 코드들은 모두 삭제! ---
// app.get('/', ... )       <--- 삭제
// app.get('/write', ... )  <--- 삭제
// app.post('/write', ... ) <--- 삭제
// app.get('/view/:id', ...)<--- 삭제
// app.get('/edit/:id', ...)<--- 삭제
// app.post('/edit/:id', ...)<--- 삭제
// app.post('/delete/:id',...)<--- 삭제
// app.post('/like/:id', ...)<--- 삭제


// --- 서버 실행 ---
app.listen(3000, () => {
    console.log('게시판 서버 구동 중! 👉 http://localhost:3000');
});