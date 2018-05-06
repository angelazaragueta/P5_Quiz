var express = require('express');
var router = express.Router();


const Sequelize = require("sequelize");

const {models}=require('../models/index.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'P5_Quiz' });
});
router.get('/credits', function(req, res, next) {
    res.render('credits', { title: 'Angela Zaragüeta' });
});
router.get('/quizzes', function(req, res, next) {
    sequelize.models.quiz.findAll()
        .then(quizzes =>{
            res.render('quizzes',{quizzes});
        })
        .catch(error=> next(error))
});

module.exports = router;
