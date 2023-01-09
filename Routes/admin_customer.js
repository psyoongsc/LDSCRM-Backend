var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');

router.get('/', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'SELECT customerID, customerName FROM CUSTOMER ORDER BY customerName;';

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                console.log('[ERROR] Select Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Table "CUSTOMER" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS", customerList: rows})
            }
        })
    
        conn.release();
    })
})

router.post('/create', (req, res, next) => {

    if (!req.body.customerName) {
        res.send({result: "FAIL", msg: 'customerName cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'INSERT INTO CUSTOMER(customerName) VALUES(?);';
        var body = req.body;
        var param = [body.customerName];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Insert Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Insert Table "CUSTOMER" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/modify', (req, res, next) => {

    if (!req.body.customerID || !req.body.newCustomerName) {
        res.send({result: "FAIL", msg: 'customerID/newCustomerName cannot be blank'})
        return;
    }

    if (req.body.customerName == req.body.newCustomerName) {
        res.send({result: "FAIL", msg: 'customerName and newCustomerName are same'})
        return;
    }

    getConnection((conn) => {
        var sql = 'UPDATE CUSTOMER SET customerName=? WHERE customerID=?'
        var body = req.body;
        var param = [body.newCustomerName, body.customerID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Update Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Update Table "CUSTOMER" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/delete', (req, res, next) => {

    if(!req.body.customerID) {
        res.send({result: "FAIL", msg: 'customerID cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'DELETE FROM CUSTOMER WHERE customerID=?'
        var body = req.body;
        var param = [body.customerID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Delete Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Delete Table "CUSTOMER" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

module.exports = router;