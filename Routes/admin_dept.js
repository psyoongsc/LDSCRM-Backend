var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');
const { logger } = require('../Config/winston')

router.get('/', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'SELECT deptID, deptName FROM DEPT ORDER BY deptName;';

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                logger.error('Request /admin/dept : Select Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Table "DEPT" has problem\n' + err})
            } else {
                logger.info('Request /admin/dept : SUCCESS')
                res.send({result: "SUCCESS", deptList: rows})
            }
        })
    
        conn.release();
    })
})

router.post('/create', (req, res, next) => {

    if (!req.body.deptName) {
        logger.error('Request /admin/dept/create : deptName cannot be blank')
        res.send({result: "FAIL", msg: 'deptName cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'INSERT INTO DEPT(deptName) VALUES(?);';
        var body = req.body;
        var param = [body.deptName];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/dept/create : Insert Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Insert Table "DEPT" has problem\n' + err})
            } else {
                logger.info('Request /admin/dept/create : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/modify', (req, res, next) => {

    if (!req.body.deptID || !req.body.newDeptName) {
        logger.error('Request /admin/dept/modify : deptID/newDeptName cannot be blank')
        res.send({result: "FAIL", msg: 'deptID/newDeptName cannot be blank'})
        return;
    }

    if (req.body.deptName == req.body.newDeptName) {
        logger.error('Request /admin/dept/modify : deptName and newDeptName are same')
        res.send({result: "FAIL", msg: 'deptName and newDeptName are same'})
        return;
    }

    getConnection((conn) => {
        var sql = 'UPDATE DEPT SET deptName=? WHERE deptID=?'
        var body = req.body;
        var param = [body.newDeptName, body.deptID];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/dept/modify : Update Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Update Table "DEPT" has problem\n' + err})
            } else {
                logger.info('Request /admin/dept/modify : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/delete', (req, res, next) => {

    if(!req.body.deptID) {
        logger.error('Request /admin/dept/delete : deptID cannot be blank')
        res.send({result: "FAIL", msg: 'deptID cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'DELETE FROM DEPT WHERE deptID=?'
        var body = req.body;
        var param = [body.deptID];

        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /admin/dept/delete : Delete Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Delete Table "DEPT" has problem\n' + err})
            } else {
                logger.info('Request /admin/dept/delete : SUCCESS')
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/deletes', (req, res, next) => {
    if(!req.body.deptIDs) {
        logger.error('Request /admin/dept/deletes : deptIDs cannot be blank')
        res.send({result: "FAIL", msg: 'deptIDs cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'DELETE FROM DEPT WHERE deptID=?'
        var body = req.body;

        var num;
        for(num=0; num<req.body.deptIDs.length; num++) {
            var param = [req.body.deptIDs[num]];

            conn.query(sql, param, (err) => {
                if(err) {
                    logger.error('Request /admin/dept/deletes : Delete Table "DEPT" has problem\n' + err)
                    res.send({result: "FAIL", msg: '[ERROR] Delete Table "DEPT" has problem\n' + err})

                    conn.release();
                    return;
                }
            })
        }
        logger.info('Request /admin/dept/deletes : SUCCESS')
        res.send({result: "SUCCESS"})

        conn.release();
    })
})

module.exports = router;