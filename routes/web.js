const express = require('express')
const router = express.Router()

router.get('/',  (req, res) => {
    res.render('./pages/dashboard');
})

router.get('/login',  (req, res) => {
    res.render('./pages/login');
})

module.exports = router