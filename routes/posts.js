// routes/posts.js
const express = require('express');
const router = express.Router(); // ✨ Express의 Router 사용!
const db = require('../db'); // ✨ db.js 가져오기 (../ 는 상위 폴더로 이동)

// --- 기존 app.js에 있던 게시글 관련 라우트들을 여기로 옮깁니다 ---
// --- app.get, app.post 대신 router.get, router.post 사용 ---

// 게시글 목록 페이지 (GET /)
router.get('/', (req, res) => {
    db.all('SELECT * FROM posts ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error("목록 로딩 중 DB 오류:", err);
            req.flash('error_msg', '게시글 목록을 불러오는 중 오류가 발생했습니다.');
            // 오류 시 빈 목록이라도 보여주거나, 별도의 에러 페이지를 보여줄 수 있습니다.
            return res.render('index', { posts: [] }); // 빈 배열 전달
        }
        res.render('index', { posts: rows }); // posts 변수는 그대로 사용
    });
});

// 게시글 작성 페이지 (GET /write)
router.get('/write', (req, res) => {
    res.render('write');
});

// 게시글 작성 처리 (POST /write)
router.post('/write', (req, res) => {
    const { title, content } = req.body;
    // 간단한 서버 측 유효성 검사 추가 (예시)
    if (!title || !content) {
        req.flash('error_msg', '제목과 내용을 모두 입력해주세요.');
        return res.redirect('/write');
    }
    db.run('INSERT INTO posts (title, content) VALUES (?, ?)', [title, content], (err) => {
        if (err) {
            console.error("글 작성 중 DB 오류:", err);
            req.flash('error_msg', '글 작성 중 오류가 발생했습니다.');
            return res.redirect('/write');
        }
        req.flash('success_msg', '🎉 새 글이 성공적으로 등록되었습니다!');
        res.redirect('/');
    });
});

// 게시글 상세 보기 (GET /view/:id)
router.get('/view/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error("상세 보기 로딩 중 DB 오류:", err);
            req.flash('error_msg', '게시글을 불러오는 중 오류가 발생했습니다.');
            return res.redirect('/');
        }
        if (!row) {
            console.log(`[${id}]번 게시글을 찾을 수 없습니다.`);
            req.flash('error_msg', '해당 게시글을 찾을 수 없습니다.');
            return res.redirect('/');
        }
        res.render('view', { post: row }); // post 변수 그대로 사용
    });
});

// 게시글 수정 페이지 보여주기 (GET /edit/:id)
router.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error("수정 페이지 로딩 중 DB 오류:", err);
            req.flash('error_msg', '수정할 게시글 정보를 가져오는 중 오류가 발생했습니다.');
            return res.redirect('/');
        }
        if (!row) {
            console.log(`[${id}]번 게시글을 찾을 수 없어 수정 페이지를 열 수 없습니다.`);
            req.flash('error_msg', '수정할 게시글을 찾을 수 없습니다.');
            return res.redirect('/');
        }
        res.render('edit', { post: row }); // post 변수 그대로 사용
    });
});

// 게시글 수정 처리 (POST /edit/:id)
router.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { title, content } = req.body;
     if (!title || !content) {
        req.flash('error_msg', '제목과 내용을 모두 입력해주세요.');
        // 수정 실패 시, 다시 수정 페이지로 가야하는데, 이때 post 데이터가 없으므로
        // 다시 조회해서 넘겨주거나, 혹은 간단히 상세보기 페이지로 보낼 수 있습니다.
        // 여기서는 간단히 상세보기 페이지로 리다이렉트합니다.
        return res.redirect(`/view/${id}`);
    }
    db.run('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], (err) => {
        if (err) {
            console.error("게시글 수정 중 DB 오류:", err);
            req.flash('error_msg', '글 수정 중 오류가 발생했습니다.');
            return res.redirect(`/edit/${id}`); // 오류 시 다시 수정 페이지로
        }
        console.log(`[${id}]번 게시글 수정 완료!`);
        req.flash('success_msg', '✅ 글이 성공적으로 수정되었습니다!');
        res.redirect(`/view/${id}`);
    });
});

// 게시글 삭제 처리 (POST /delete/:id)
router.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("게시글 삭제 중 DB 오류:", err);
            req.flash('error_msg', '글 삭제 중 오류가 발생했습니다.');
            return res.redirect('/');
        }
        console.log(`[${id}]번 게시글 삭제 완료!`);
        req.flash('success_msg', '🗑️ 글이 성공적으로 삭제되었습니다!');
        res.redirect('/');
    });
});

// 게시글 추천 처리 (POST /like/:id)
router.post('/like/:id', (req, res) => {
    const id = req.params.id;
    db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("게시글 추천 중 DB 오류:", err);
            req.flash('error_msg', '추천 처리 중 오류가 발생했습니다.');
            // 이전 페이지로 돌아가도록 시도
            return res.redirect('back');
        }
        console.log(`[${id}]번 게시글 추천 완료! (likes +1)`);
        // 추천 성공은 굳이 메시지 안 띄워도 자연스러움
        res.redirect('back'); // 이전 페이지로 돌아가기
    });
});


// 이 라우터 객체를 외부에서 사용할 수 있도록 내보냅니다.
module.exports = router;