var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');
const { logger } = require('../Config/winston')

router.post('/', (req, res, next) => {

    if(!req.body.date) {
        logger.error('Request /pipeline : select date is required')
        res.send({result: "FAIL", msg: 'select date is required'})
        return;
    }

    var date = req.body.date;
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    let extractResult = date.match(dateRegex);
    if(!extractResult) {
        logger.error('Request /pipeline : date value is not valid')
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
                logger.error('Request /pipeline : Select Contents "Related Pipeline" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Contents "Related Pipeline" has problem\n' + err})
            } else {
                logger.info('Request /pipeline : SUCCESS')
                res.send({result: "SUCCESS", pipelineList: rows})
            }
        })
    
        conn.release();
    })
})

router.get('/:pipelineID', (req, res, next) => {

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
        var sql = 'SELECT a.pipelineID, b.deptName, c.customerName, d.typeName, a.title, a.date, a.content, a.createAt, a.modifyAt, expectedSales, expectedPurchase, expectedProfit' 
        var sql = sql + ' FROM PIPELINE a, DEPT b, CUSTOMER c, TYPE d'
        var sql = sql + ' WHERE a.deptID = b.deptID AND a.customerID = c.customerID AND a.typeID = d.typeID'
        var sql = sql + ' AND a.date = ? AND a.pipelineID = ?;'
        var param = [date, req.params.pipelineID];

        conn.query(sql, param, (err, rows, fields) => {
            if(err) {
                console.log('[ERROR] Select Contents "Related Pipeline" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Contents "Related Pipeline" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS", pipeline: rows[0]})
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

router.post('/create', (req, res, next) => {
    var body = req.body;

    if(!body.deptID || !body.customerID || !body.typeID || !body.title || !body.date) {

    }
})

module.exports = router;