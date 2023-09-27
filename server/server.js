const nocache = require('nocache')
const express = require("express");
const sessions = require('express-session');
const cookieParser = require("cookie-parser");

const oneDay = 1000 * 60 * 60 * 24;


const bodyParser = require("body-parser");
const { Client,Pool } = require("pg")
let timeout = require('connect-timeout');
const path = require('path')
const Cursor = require('pg-cursor')
const buffer = require("buffer");
const pool = new Pool({
    user: 'yashraj',
    host: 'localhost',
    database: 'hotel_transylvania',
    password: 'Raj',
    port: 5432,
})

const client = new Client({
    user: 'yashraj',
    host: 'localhost',
    database: 'hotel_transylvania',
    password: 'Raj',
    port: 5432,
})

client.connect()

const app = express();
app.use(timeout(5000))
app.use(nocache());
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(express.static(__dirname+'/../'))

app.use(sessions({
    secret: 'secretkey',
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

let users = []
let passwords = []

var session = []

let sessionCount = 0

app.get('/hotel-booking',function (req,res){
    res.sendFile(__dirname+'/../index.html')
})

app.get("/hotel-booking/index.html", function (req,res){
    res.sendFile(__dirname+'/../index.html')
})

app.get("/hotel-booking/reception.html", function (req,res){
    res.sendFile(path.resolve(__dirname+'/../reception.html'))
})

app.get("/hotel-booking/booked", function (req,res){
    const id = req.query.id;
    if(req.query.redir===true){
        res.sendFile(path.resolve(__dirname+'/../booked.html'));
        console.log('sen')
        return
    }
    const query = 'SELECT * FROM bookings WHERE booking_id = \''+id+'\'';
    const cursor = client.query(new Cursor(query));
    cursor.read(1, (err,rows) => {
        console.log(rows)
        console.log(req.query)
        if (rows.length===0){
            res.send(JSON.stringify({
                status: false
            }))
            cursor.close()
            return
        }
        if (err == null ) {
            res.send(JSON.stringify({
                status: true
            }))
        } else {
            if (err.routine === 'errorMissingColumn') {
                res.send(JSON.stringify({
                    status: false
                }))
            }
        }
        cursor.close();
    })
})

app.get("/hotel-booking/available", function (req,res){
    const str = 'SELECT * FROM rooms ORDER BY rent';
    let availableRoom = {};
    const cursor2 = client.query(new Cursor(str))
    cursor2.read(5, (err,rows)=>{
        const rooms_data = rows;
        cursor2.close();

        const single = rooms_data[0];
        availableRoom.single=single.available

        const double = rooms_data[1];

        availableRoom.double=double.available

        const triple = rooms_data[2];

        availableRoom.triple=triple.available

        const quad = rooms_data[3];
        availableRoom.quad=quad.available

        const king = rooms_data[4];

        availableRoom.king=king.available

        res.send(JSON.stringify(availableRoom))
    })
})

app.get("/hotel-booking/booked/booked-data", function (req,res){
    const data = req.query.data;
    const id = JSON.parse(data).id;
    console.log(id)
    const query = 'SELECT * FROM bookings WHERE booking_id = \''+id+'\'';
    const cursor = client.query(new Cursor(query));

    cursor.read(1, (err,rows) => {
        if (err == null ){
            if(rows.length>0){
                const booking = rows[0];
                cursor.close();
                if( booking.booking_id === id){
                    const str = 'SELECT * FROM booking_rooms WHERE booking_id = '+id;
                    const cursor1 = client.query(new Cursor(str));
                    cursor1.read(1, (err1,rows1) => {
                        const rooms = rows1[0];
                        cursor1.close();
                        const data = JSON.stringify({
                            status: true,
                            d1: Buffer.from(JSON.stringify(booking),'utf8').toString('base64'),
                            d2: Buffer.from(JSON.stringify(rooms),'utf8').toString('base64'),
                        })

                        res.send(data);
                    })
                }
            }else{
                res.send(JSON.stringify({status: false, reason: 'Invalid Booking ID'}))
            }

        }else{
            if(err.routine === 'errorMissingColumn'){
                res.send(JSON.stringify({
                    status:false
                }))
            }
        }
    })


})

app.post("/hotel-booking/reception.html/booked", function (req, res) {
    let data = req.body.data;
    data=JSON.parse(data)
    // console.log(JSON.parse(Buffer.from(data.userData,'base64').toString()))
    let user = JSON.parse(Buffer.from(data.userData,'base64').toString());
    let rooms = JSON.parse(Buffer.from(data.roomData,'base64').toString());

    if(rooms.single*2 + rooms.double*4 + rooms.triple*6 + rooms.quad*8 + rooms.king*2 >= user.guestCount){
        const cursor2 = client.query(new Cursor('SELECT * FROM rooms ORDER BY rent'))
        cursor2.read(5, (err,rows)=>{
            const rooms_data = rows;
            cursor2.close();
            console.log(rooms_data)
            const single = rooms_data[0];
            const double = rooms_data[1];
            const triple = rooms_data[2];
            const quad = rooms_data[3];
            const king = rooms_data[4];

            let noRoom = {
                single:single.available,
                double:double.available,
                triple:triple.available,
                quad:quad.available,
                king:king.available,
            };

            if(noRoom.king<rooms.king || noRoom.single<rooms.single || noRoom.double<rooms.double || noRoom.triple<rooms.triple || noRoom.quad<rooms.quad){
                res.send(JSON.stringify({status: false, data: noRoom, reason: 'Rooms Not Available'}))
            }else{
                const cursor = client.query(new Cursor('SELECT booking_id FROM bookings ORDER BY booking_id desc limit 1'));
                cursor.read(1, (err,rows) => {
                    console.log(rows)
                    var booking_id=1000
                    if(rows.length!==0){
                        booking_id = parseInt(rows[0].booking_id) + 1;

                    }
                    let str = `INSERT INTO bookings(user_name,booking_id,guests_count,email,booking_date,booking_time,arrival_datetime,contact,status) VALUES('${user.name}',${booking_id},${user.guestCount},'${user.email}','${new Date().toISOString().split('T')[0]}','${new Date().toISOString().split('T')[1].split('.')[0]}','${user.arrival.replace('T', ' ')}:00',${user.contact},${true})`;
                    pool.query(str)
                    cursor.close();
                    setTimeout(()=>{
                        const cursor1 = client.query(new Cursor('SELECT booking_id FROM bookings ORDER BY booking_id desc limit 1'));
                        cursor1.read(1, (err,rows) => {
                            const booked_id = parseInt(rows[0].booking_id);
                            cursor1.close();
                            if(booking_id === booked_id){
                                str = `INSERT INTO booking_rooms(booking_id,single,double,triple,quad,king) VALUES(${booked_id},${parseInt(rooms.single)},${parseInt(rooms.double)},${parseInt(rooms.triple)},${parseInt(rooms.quad)},${parseInt(rooms.king)})`
                                pool.query(str)

                                const cursor3 = client.query(new Cursor(`SELECT * FROM rooms ORDER BY rent`))
                                cursor3.read(5, (err,rows)=>{
                                    const rooms_data = rows;
                                    cursor3.close();
                                    console.log(rooms_data)
                                    pool.query(`UPDATE rooms SET booked=${parseInt(rooms_data[0].booked)+parseInt(rooms.single)}, available=${parseInt(rooms_data[0].available)-parseInt(rooms.single)} WHERE type='single'`)
                                    pool.query(`UPDATE rooms SET booked=${parseInt(rooms_data[1].booked)+parseInt(rooms.double)}, available=${parseInt(rooms_data[1].available)-parseInt(rooms.double)} WHERE type='double'`)
                                    pool.query(`UPDATE rooms SET booked=${parseInt(rooms_data[2].booked)+parseInt(rooms.triple)}, available=${parseInt(rooms_data[2].available)-parseInt(rooms.triple)} WHERE type='triple'`)
                                    pool.query(`UPDATE rooms SET booked=${parseInt(rooms_data[3].booked)+parseInt(rooms.quad)}, available=${parseInt(rooms_data[3].available)-parseInt(rooms.quad)} WHERE type='quad'`)
                                    pool.query(`UPDATE rooms SET booked=${parseInt(rooms_data[4].booked)+parseInt(rooms.king)}, available=${parseInt(rooms_data[4].available)-parseInt(rooms.king)} WHERE type='king'`)

                                })

                                setTimeout(()=>{res.send(JSON.stringify({status: true, booking_id: booked_id}))},500)
                                // return res.redirect('/hotel-booking');
                            }else {
                                setTimeout(()=>{res.send(JSON.stringify({status: false, booking_id: NaN, reason: 'unspecified'}))},500)
                                // return res.redirect('/hotel-booking/reception.html');
                            }
                        })
                    },500);
                });
            }
        })
    }else{
        res.send(JSON.stringify({status: false, reason: 'Invalid Room Configuration'}))
    }
});

app.get("/hotel-booking/cancel",function (req,res){
    const id = req.query.id;

    const cursor = client.query(new Cursor('SELECT contact FROM bookings WHERE booking_id=\''+id+'\''))

    cursor.read(1 , (err,rows)=>{
        if (err==null){
            let number = rows[0].contact;

            const otp = Math.floor(Math.random() * (999999 - 100000) + 100000);

            const cursor = client.query(new Cursor('SELECT * FROM cancellation WHERE booking_id=\''+id+'\''));

            cursor.read(1, (err,rows)=>{
                cursor.close();
                if(err==null){
                    if(rows.length>0){
                        const tries = rows[0].tries;
                        if(tries<5){
                            pool.query(`UPDATE cancellation SET otp=${otp} WHERE booking_id=\'${id}\'`)
                        }else{

                        }
                    }else{
                        pool.query(`INSERT INTO cancellation (booking_id,otp,cancelled,tries) VALUES ('${id}',${otp},false,0)`)
                    }
                }else{
                    pool.query(`INSERT INTO cancellation (booking_id,otp,cancelled,tries) VALUES (${id},${otp},false,0)`)
                }
            })
            console.log(otp)
            res.send(JSON.stringify({
                status:true,
                contact:Buffer.from(number.toString(), 'utf8').toString('base64'),
            }))
        }else{
            if(err.routine === 'errorMissingColumn'){
                res.send(JSON.stringify({
                    status:false,
                    reason: 'Invalid Booking ID'
                }))
            }
        }
        cursor.close();
    })
})


app.post("/hotel-booking/cancel-conf",function (req,res){
    const otp = Buffer.from(req.body.d1, 'base64').toString('utf8')
    const id = Buffer.from(req.body.d2, 'base64').toString('utf8')
    console.log(otp,id)
    const cursor = client.query(new Cursor('SELECT otp FROM cancellation WHERE booking_id=\''+id+'\''))

    cursor.read(1, (err,rows)=>{
        if(err==null){
            if(rows.length>0){
                const otp1 = rows[0].otp;
                cursor.close();
                console.log(otp,otp1,id)
                if(parseInt(otp1)===parseInt(otp)){
                    pool.query('UPDATE bookings SET status=false WHERE booking_id=\''+id+'\'');
                    const cursor1 = client.query(new Cursor('SELECT * FROM booking_rooms WHERE booking_id=\''+id+'\''));
                    cursor1.read(1, (err,rows)=>{
                        if(err==null){
                            const booked = rows[0];
                            cursor1.close();

                            const cursor2 = client.query(new Cursor('SELECT * FROM rooms ORDER BY rent'));

                            cursor2.read(5, (err,rows)=>{
                                cursor2.close();
                                if(err==null){
                                    if(rows.length>0){
                                        pool.query(`UPDATE rooms SET booked=${rows[0].booked - booked.single}, available=${rows[0].available + booked.single} WHERE type='single'`)
                                        pool.query(`UPDATE rooms SET booked=${rows[1].booked - booked.double}, available=${rows[1].available + booked.double} WHERE type='double'`)
                                        pool.query(`UPDATE rooms SET booked=${rows[2].booked - booked.triple}, available=${rows[2].available + booked.triple} WHERE type='triple'`)
                                        pool.query(`UPDATE rooms SET booked=${rows[3].booked - booked.quad}, available=${rows[3].available + booked.quad} WHERE type='quad'`)
                                        pool.query(`UPDATE rooms SET booked=${rows[4].booked - booked.king}, available=${rows[4].available + booked.king} WHERE type='king'`)
                                    }
                                }
                            })


                            res.send(JSON.stringify({
                                status: true
                            }))
                        }
                    })
                }else{
                    pool.query(`UPDATE cancellation SET tries = (SELECT tries FROM cancellation WHERE booking_id = ${id})+1 WHERE booking_id = ${id}`)
                    res.send(JSON.stringify({
                        status:false,
                        reason: 'Invalid OTP'
                    }))
                }
            }else{
                console.log()
            }
        }else{
            res.send(JSON.stringify({
                status: false,
                reason: 'Please Try Again'
            }))
        }
    })
})

app.get('/login',(req,res)=>{
    res.sendFile(path.resolve(__dirname+'/../employee/index.html'))
})


var ud = []

app.post('/check', (req,res)=>{
    const id = atob(JSON.parse(req.body.data).d1)
    const pass = atob(JSON.parse(req.body.data).d2)
    console.log(id,pass)
    const cursor = client.query(new Cursor(`SELECT * from users WHERE user_id='${id}'`));

    cursor.read(1, (err,rows)=>{
        if(err==null){
            if(rows.length>0){
                if(pass==rows[0].password){
                    var se = req.session;
                    se.userid = id;
                    se.seid = sessionCount;
                    session[sessionCount] = se;
                    ud[sessionCount] = JSON.stringify({
                        id: rows[0].user_id,
                        name: rows[0].name,
                        contact: rows[0].contact
                    });
                    sessionCount++;
                    res.send(JSON.stringify({status: 'true'}))
                }else{
                    res.send(JSON.stringify({status: 'false', reason: 'pass'}))
                }
            }else{
                res.send(JSON.stringify({status: 'false', reason: 'id'}))
            }
        }
        cursor.close()
    })
})


app.get('/dashboard', (req,res)=>{
    console.log(`user logged in: ${req.session.seid}`);
    res.sendFile(path.resolve(__dirname+'/../employee/dashboard.html'))
})

app.post('/employee', (req,res)=>{
    console.log(req.session.userid)
    res.send(ud[req.session.seid])
})

app.get('/getBookings',(req,res)=>{
    const cursor = client.query(new Cursor('SELECT * FROM bookings '));
    var rowCount = 0
    var data = []


        cursor.read(200, (err, rows)=>{
            if(err==null){
                if(rows.length>0){
                    for(var i=0;i<rows.length;i++){
                        rowCount++;
                        console.log(rows[i])
                        data[i]=rows[i];
                    }
                    cursor.close();
                    console.log(data)
                    res.send(JSON.stringify({
                        total: rowCount,
                        bookings: data
                    }))
                }
            }
        })

})

app.get('/logout',(req,res)=>{
    const seid = req.session.seid
    ud[seid]=null
    req.session.destroy();
    res.redirect('/login')
})

app.listen(3000,function (){
    console.log('Listening on port 3000')
})
