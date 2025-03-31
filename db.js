// db.js
const sqlite3 = require('sqlite3').verbose();
// 데이터베이스 파일 경로가 app.js와 같은 위치에 있다고 가정합니다.
// 만약 다르다면 경로를 맞게 수정해주세요. (예: './data/database.db')
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("데이터베이스 연결 실패:", err.message);
    } else {
        console.log("데이터베이스에 성공적으로 연결되었습니다.");
    }
});

// 다른 파일에서 이 db 객체를 사용할 수 있도록 내보냅니다.
module.exports = db;