const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user_jwt = require('../middleware/user_jwt');
// const token = require('morgan');

router.get('/', user_jwt, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success: true,
            user: user
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            msg: 'server error'
        })
        next();
    }
});



router.post('/register', async (req, res, next) => {
    // const jwtUserSecret = "userToken"
    const { username, email, password } = req.body;

    try {

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                msg: 'Please provide username, email, and password.',
            });
        }

        let user_exist = await User.findOne({ email: email });
        if (user_exist) {
            return res.json({
                success: false,
                msg: "User already exists"
            });
        }

        // Ensure the password is a string
        if (typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                msg: 'Invalid password format',
            });
        }

        let user = new User();

        user.username = username;
        user.email = email;

        const salt = await bcryptjs.genSalt(4);
        user.password = await bcryptjs.hash(password, salt);

        let size = 200;
        user.avatar = "https://gravatar.com/avatar/?s=" + size + "&d=retro";

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.JWT_USER_SECREATE, {
            // expireIn: 360000
        }, (err, token) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    success: false,
                    msg: 'Server error',
                });
            }
            else {
                res.status(200).json({
                    success: true,
                    token: token
                })
            }

        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server error',
        });
    }
});


router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'User not exists go and register to continue'
            });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid password'
            })
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.JWT_USER_SECREATE, {
            // expireIn: 360000
        }, (err, token) => {
            if (err) {
                console.error(err);
                res.status(500).json({
                    success: false,
                    msg: 'Server error',
                });
            } else {
                res.status(200).json({
                    success: true,
                    msg: 'User logged in',
                    token: token,
                    user: user
                });
            }

        })


    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: true,
            msg: 'Server error'
        })
    }
});


module.exports = router;