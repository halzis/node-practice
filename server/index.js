const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const { auth } = require('./middleware/auth')
const { User } = require('./models/User')

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

// 몽고DB에 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('err'))



// http://localhost:3000/ 으로 접속할 경우
app.get('/', (req, res) => {res.send('Hello World! 아 해위 해윙')})

app.get('/api/hello', (req, res) => {
    res.send("안녕하세요~")
})

// http://localhost:3000/register 로 회원가입 정보를 보낼 때
app.post('/api/users/register', (req, res) => {
    // 회원가입시 필요한 정보들 client에서 가져오면
    // 데이터베이스에 저장

    // 전송한 정보(req)의 JSON형식 body를 유저스키마에 맞게 DB에 저장 
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

// http://localhost:3000/login 으로 로그인 정보를 보낼 때
app.post('/api/users/login', (req, res) => {
    // 전송된 JSON 형식의 정보(req)의 이메일을 DB에서 찾음
    User.findOne({ email: req.body.email }, (err, user) => {
        // DB에 로그인한 이메일이 없을 경우
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        // DB에 이메일이 있다면 비밀번호 맞는지 확인
        // 입력한 비밀번호와 DB에 암호화되어 저장된 비밀번호가 같을 경우
        // isMatch에 true 반환하는 메소드('./models/User' - comparePassword)
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

            // 비밀번호도 같다면 Token 생성
            user.generateToken((err, user) => {
                // status(400)은 에러. status(200)은 성공. 
                if(err) return res.status(400).send(err);

                // 토큰 저장(어디? 쿠키, 로컬스토리지)
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// 미들웨어 auth
app.get('/api/users/auth', auth, (req,res) => {
    // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentocation이 true라는 말.
    res.status(200).json({
        _id: req.user._id,
        // role이 0이면 일반유저, 0이 아니면 어드민(관리자)
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id },
        { token: '' },
        (err, user) => {
            if(err) return res.json({ success: false, err})
            return res.status(200).send({
                success: true
            })
        })
})

const port = 5000

app.listen(port, () => {console.log(`Example app listening at http://localhost:${port}`)})