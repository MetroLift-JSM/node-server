const { json } = require('body-parser');
const express = require('express');
const mysql = require('mysql2');
const { message } = require('statuses');
const app = express();
const PORT = 3000;
const HOST = "192.168.1.3";


app.use(express.json());
app.use(express.text());


// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234', // ← 여기에 본인 MySQL 비번 입력
    database: 'beacons'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공!');
});

// POST 요청 처리 - 신호 저장 및 오래된 신호 제거
app.post('/', (req, res) => {
    console.log("박재민이 신호 받음");

    const { message } = req.body;
    console.log(message);

    if (!message) {
        return res.status(400).send('message 없음');
    }

    // 1. 신호 저장
    const insertQuery = 'INSERT INTO signals (message) VALUES (?)';
    db.query(insertQuery, [message], (err, result) => {
        if (err) {
            console.error('MySQL 저장 실패:', err);
            return res.status(500).send('DB 저장 실패');
        }

        console.log('DB 저장 성공:', result.insertId);

        // 2. 전체 개수 확인
        const countQuery = 'SELECT COUNT(*) AS count FROM signals';
        db.query(countQuery, (err, rows) => {
            if (err) {
                console.error('카운트 조회 실패:', err);
                return res.status(500).send('DB 카운트 실패');
            }

            const count = rows[0].count;

            if (count > 10) {
                // 3. 가장 오래된 1개 삭제
                const deleteQuery = 'DELETE FROM signals ORDER BY created_at ASC LIMIT 1';
                db.query(deleteQuery, (err, deleteResult) => {
                    if (err) {
                        console.error('오래된 데이터 삭제 실패:', err);
                        return res.status(500).send('DB 삭제 실패');
                    }
                    console.log('오래된 데이터 삭제 완료');
                    res.send("민경이 신호 받음 고맙다람쥐");
                });
            } else {
                res.send("민경이 신호 받음 고맙다람쥐");
            }
        });
    });
});










// 선하가 역 선택 할 때 나한테 보내는 값
app.post('/api/station', (req, res) => {
    const station = req.body.station;

    if (!station) {
        console.log("'station' 필드가 없음");
        return res.status(400).send("역 이름(station)이 없습니다.");
    }

    console.log("받은 역 이름:", station);
    res.status(200).send("역 이름 수신 완료");
});







// app.post('/', (req, res) => {
//     console.log("박재민이 신호 받음");
//     //req -> 클라이언트가 요청
//     const { message } = req.body;
//     console.log(message)

//    //Res -> 응답
//     res.send("민경이 신호 받음 고맙다람쥐");
// });




// 안드로이로 보내는 과정
app.get('/', (req, res) => {
    const query = 'SELECT * FROM signals ORDER BY created_at DESC LIMIT 1';

    db.query(query, (err, rows) => {
        if (err) {
            console.error('최신 메시지 조회 실패:', err);
            return res.status(500).send('조회 실패');
        }

        if (rows.length === 0) {
            return res.status(200).send('데이터 없음');
        }

        const latest = rows[0];
        res.json({
            message: latest.message,
            time: latest.created_at
        });
    });
});


// app.get('/api/status', (req, res) => {
//     const elevator = req.query.elevator;
//     console.log("요청받은 엘리베이터:", elevator);
//     res.json({
//         status: {message}
//     });
// });

app.get('/api/status', (req, res) => {
    const elevator = req.query.elevator;
    console.log("요청받은 엘리베이터:", elevator);

    const query = 'SELECT message FROM signals ORDER BY created_at DESC LIMIT 1';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('DB 조회 실패:', err);
            return res.status(500).send('DB 조회 오류');
        }

        if (rows.length === 0) {
            return res.status(200).json({ status: "NONE" }); // 신호 없음
        }

        const latestMessage = rows[0].message;
        console.log("응답할 최신 신호:", latestMessage);

        res.json({
            status: latestMessage
        });
    });
});



app.listen(PORT, HOST, function() {
    console.log(`서버가 http://${HOST}:${PORT} 에서 실행 중~`);
});

