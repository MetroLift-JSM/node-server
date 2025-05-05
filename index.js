const { json } = require('body-parser');
const express = require('express');
const app = express();
const PORT = 3000;
const HOST = "192.168.1.3";


app.use(express.json());
app.use(express.text());


let lastSignal = null;


app.post('/', (req, res) => {
    console.log("박재민이 신호 받음");
    //req -> 클라이언트가 요청
    const { message } = req.body;
    console.log(message)

   //Res -> 응답
    res.send("민경이 신호 받음 고맙다람쥐");
});







app.listen(PORT, HOST, function() {
    console.log(`서버가 http://${HOST}:${PORT} 에서 실행 중~`);
});

