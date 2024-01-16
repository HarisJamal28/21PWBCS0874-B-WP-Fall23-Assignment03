
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema.js');
const Admin = require('../models/adminSchema.js');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 5 }).withMessage('Password should be at least 5 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, mobile, password, address } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ firstname, lastname, email, mobile, password: hashedPassword, address });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid password');
        }
        const secretKey = '#7kfE*4tGz$LQW9!sP@u2MxY6vJhNpC'; 

        const token = jwt.sign({ user }, secretKey);



        res.status(200).json({ message: 'Sign In successful', token });
    } catch (error) {
        res.status(500).send('Error signing in');
    }

    
});

router.get('/user/profile', authMiddleware.authenticateUser, async (req, res) => {
    res.send('User profile page');
  });

module.exports = router;