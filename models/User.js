const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 저장하기 전에 
userSchema.pre('save', function( next ){
    var user = this

    // 비밀번호가 변경되면 암호화
    if(user.isModified('password')) {
        // 비밀번호 암호화를 위한 salt 생성
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            // 비밀번호에 salt를 사용하여 암호화한 비밀번호 hash 생성
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                // 에러가 발생하지 않으면 암호화된 비밀번호를 저장
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

// 메소드는 index.js와 이름이 같아야함.
userSchema.methods.comparePassword = function(plainPassword, cb) {
    // plainPassword 1234567    암호화된 비밀번호(this.password) $2b$10$1A5GvnvAIty5BFr20icJxOP4FdNGN7MOxZuBVjCNpmBntyn268PTu
    // isMatch -> plainPassword와 this.password 비교하여 같으면 true, 다르면 false
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this

    // jsonwebtoken을 사용하여 토큰 생성
    // 'secretToken'이 토큰을 생성하고 찾는 키
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secertToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

const User = mongoose.model('User',userSchema)

module.exports = { User }