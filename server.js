const express = require("express");
const app = express();

//포트설정
const Port = process.env.port || 5000;

const mysql = require('mysql');
const db = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: '1234',
    database: 'noticedb'
});

//CORS 정책
const cors = require("cors");
//CORS 설정
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}
//cors 미들웨어 적용
app.use(cors(corsOptions));

//json 파싱 미들웨어 적용
app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.listen(Port, ()=>{
    console.log("listening on 5000")
});

//html 연동
app.get("/",(require,respond)=>{
    respond.sendFile(__dirname + '/index.html')
});

//data 페이지
app.post("/data",(request,respond)=>{
    console.log(request.body);
    respond.send('전송완료')
});

//게시글 수
app.get('/posts/total',(req,res)=>{
    db.query('select count(*) from posts;', (err,result)=>{
        res.send(result);
    });
});

//게시글 목록 10개씩 페이징
app.get('/posts',(req,res)=>{
    const page = req.query.page;
    const start = (page-1)*10;

    const sql = `select * from posts order by id desc limit ${start}, 10`
    
    db.query(sql,(err,result)=>{
        res.send(result);
    });
});

//게시글 읽기
app.get('/posts/read/:id',(req,res)=>{
    const id = req.params.id;
    db.query(`select * from posts where id=${id}`,(err,result)=>{
        res.send(result[0])
    })
});

//게시글 쓰기
app.post('/posts/insert',(req,res)=>{
    const title = req.body.title;
    const body = req.body.body;
    const writer = req.body.writer;

    const sql = `insert into posts(title,body,writer) values('${title}', '${body}', '${writer}');`
    db.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(500).send('internal Server Error');
        }else{
            res.send(result);
        }
    })
});

//게시글 수정
app.put('/posts/update',(req,res)=>{
    const id = req.body.id;
    const title = req.body.title;
    const body = req.body.body;

    const sql = `update posts set title='${title}', body='${body}' where id='${id}'`
    db.query(sql,(err,result)=>{
        if(err){
            console.log(err)
            res.status(500).send('internal Server Error');
        }else{
            res.sendStatus(200)
        }
    })
});

//게시글 삭제
app.delete('/posts/delete/:id',(req,res)=>{
    const id = req.params.id;

    const sql = `delete from posts where id='${id}'`
    db.query(sql,(err,result)=>{
        res.sendStatus(200)
    })
})