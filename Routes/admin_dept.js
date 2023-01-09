var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');

router.get('/', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'SELECT deptID, deptName FROM DEPT ORDER BY deptName;';

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                console.log('[ERROR] Select Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Table "DEPT" has problem\n' + err})
            }
    
            res.send({result: "SUCCESS", deptList: rows})
        })
    
        conn.release();
    })
})

router.post('/create', (req, res, next) => {

    if (!req.body.deptName) {
        res.send({result: "FAIL", msg: 'deptName cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'INSERT INTO DEPT(deptName) VALUES(?);';
        var body = req.body;
        var param = [body.deptName];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Insert Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Insert Table "DEPT" has problem\n' + err})
            }

            res.send({result: "SUCCESS"})
        })

        conn.release();
    })
})

router.post('/modify', (req, res, next) => {

    if (!req.body.deptID || !req.body.newDeptName) {
        res.send({result: "FAIL", msg: 'deptID/newDeptName cannot be blank'})
        return;
    }

    if (req.body.deptName == req.body.newDeptName) {
        res.send({result: "FAIL", msg: 'deptName and newDeptName are same'})
        return;
    }

    getConnection((conn) => {
        var sql = 'UPDATE DEPT SET deptName=? WHERE deptID=?'
        var body = req.body;
        var param = [body.newDeptName, body.deptID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Update Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Update Table "DEPT" has problem\n' + err})
            }

            res.send({result: "SUCCESS"})
        })

        conn.release();
    })
})

router.post('/delete', (req, res, next) => {

    if(!req.body.deptID) {
        res.send({result: "FAIL", msg: 'deptID cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'DELETE FROM DEPT WHERE deptID=?'
        var body = req.body;
        var param = [body.deptID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Delete Table "DEPT" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Delete Table "DEPT" has problem\n' + err})
            }

            res.send({result: "SUCCESS"})
        })

        conn.release();
    })
})

module.exports = router;