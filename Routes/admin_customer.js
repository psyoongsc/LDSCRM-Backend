var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');
const { logger } = require('../Config/winston')

router.get('/', (req, res, next) => {

    getConnection(res, (conn) => {
        var sql = 'SELECT customerID, customerName FROM CUSTOMER ORDER BY customerName;';

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                logger.error('Request /admin/customer : Select Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Table "CUSTOMER" has problem\n' + err})
            } else {
                logger.info('Request /admin/customer : SUCCESS')
                res.send({result: "SUCCESS", customerList: rows})
            }
        })
    
        conn.release();
    })
})

router.get('/error', (req, res, next) => {
    res.send({result: "FAIL", msg: '[ERROR] Select Table "CUSTOMER" has problem\n' + 'error messages'})
})

router.post('/create', (req, res, next) => {

    if (!req.body.customerName) {
        logger.error('Request /admin/customer/create : customerName cannot be blank')
        res.send({result: "FAIL", msg: 'customerName cannot be blank'})
        return;
    }

    getConnection(res, (conn) => {
        var sql = 'INSERT INTO CUSTOMER(customerName) VALUES(?);';
        var body = req.body;
        var param = [body.customerName];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/customer/create : Insert Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Insert Table "CUSTOMER" has problem\n' + err})
            } else {
                logger.info('Request /admin/customer/create : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/modify', (req, res, next) => {

    if (!req.body.customerID || !req.body.newCustomerName) {
        logger.error('Request /admin/customer/modify : customerID/newCustomerName cannot be blank')
        res.send({result: "FAIL", msg: 'customerID/newCustomerName cannot be blank'})
        return;
    }

    if (req.body.customerName == req.body.newCustomerName) {
        logger.error('Request /admin/customer/modify : customerName and newCustomerName are same')
        res.send({result: "FAIL", msg: 'customerName and newCustomerName are same'})
        return;
    }

    getConnection(res, (conn) => {
        var sql = 'UPDATE CUSTOMER SET customerName=? WHERE customerID=?'
        var body = req.body;
        var param = [body.newCustomerName, body.customerID];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/customer/modify : Update Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Update Table "CUSTOMER" has problem\n' + err})
            } else {
                logger.info('Request /admin/customer/modify : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/delete', (req, res, next) => {

    if(!req.body.customerID) {
        logger.error('Request /admin/customer/delete : customerID cannot be blank')
        res.send({result: "FAIL", msg: 'customerID cannot be blank'})
        return;
    }

    getConnection(res, (conn) => {
        var sql = 'DELETE FROM CUSTOMER WHERE customerID=?'
        var body = req.body;
        var param = [body.customerID];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/customer/delete : Delete Table "CUSTOMER" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Delete Table "CUSTOMER" has problem\n' + err})
            } else {
                logger.info('Request /admin/customer/delete : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/deletes', (req, res, next) => {
    if(!req.body.customerIDs) {
        logger.error('Request /admin/customer/deletes : customerIDs cannot be blank')
        res.send({result: "FAIL", msg: 'customerIDs cannot be blank'})
        return;
    }

    getConnection(res, (conn) => {
        var sql = 'DELETE FROM CUSTOMER WHERE customerID=?'
        var body = req.body;

        var num;
        for(num=0; num<req.body.customerIDs.length; num++) {
            var param = [req.body.customerIDs[num]];

            conn.query(sql, param, (err) => {
                if(err) {
                    logger.error('Request /admin/customer/deletes : Delete Table "CUSTOMER" has problem\n' + err)
                    res.send({result: "FAIL", msg: '[ERROR] Delete Table "CUSTOMER" has problem\n' + err})

                    conn.release();
                    return;
                }
            })
        }
        logger.info('Request /admin/customer/deletes : SUCCESS')
        res.send({result: "SUCCESS"})

        conn.release();
    })
})

module.exports = router;