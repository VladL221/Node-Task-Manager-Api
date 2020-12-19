const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
},  
    password:{
        type:String,
        required:true,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error('Password cant be password...')
            }else if(value.length <=6){
                throw new Error('Password must be longer than 6 characters!')
            }
        },
        trim:true
    },
    age: {
        type: Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type:Buffer
    }
}, {
    timestamps:true
})

//virtual relationship of tasks and user
userSchema.virtual('tasks', { 
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


// returns user object as json without password and tokens
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this 
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token

}

// User for login api, compares the given credentials with the database
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to log in!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to log in!')
    }
    return user
}

// Hash the plain text password before saving
userSchema.pre('save',async function (next) {
    const user = this 

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    console.log('just before saving!')

    next()
})


// Delete user tasks when user removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner:user._id })
    next()
})


const User = mongoose.model('User',userSchema)

module.exports = User