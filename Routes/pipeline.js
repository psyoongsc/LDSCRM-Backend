var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');

router.get('/', (req, res, next) => {

    if(!req.body.date) {
        res.send({result: "FAIL", msg: 'select date is required'})
        return;
    }

    var date = req.body.date;
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    let extractResult = date.match(dateRegex);
    if(!extractResult) {
        res.send({result: "FAIL", msg: 'date value is not valid'})
        return;
    }

    getConnection((conn) => {
        var sql = 'SELECT a.pipelineID, b.deptName, c.customerName, d.typeName, a.title, a.date' 
        var sql = sql + ' FROM PIPELINE a, DEPT b, CUSTOMER c, TYPE d'
        var sql = sql + ' WHERE a.deptID = b.deptID AND a.customerID = c.customerID AND a.typeID = d.typeID'
        var sql = sql + ' AND a.date = ? ORDER BY deptName, date desc;'
        var param = [date];

        conn.query(sql, param, (err, rows, fields) => {
            if(err) {
                console.log('[ERROR] Select Contents "Related Pipeline" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Contents "Related Pipeline" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS", pipelineList: rows})
            }
        })
    
        conn.release();
    })
})

router.post('/dateValidationCheck', (req, res, next) => {

    var input = req.body.date;

    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    const dateExtract = input.match(dateRegex);
    
    if(!dateExtract) {
        res.send({isDate: "false"})
    } else {
        res.send({isDate: "true"})
    }
})

module.exports = router;