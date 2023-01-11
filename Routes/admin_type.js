var express = require('express')
var router = express.Router();

const getConnection = require('../Config/database');
const { logger } = require('../Config/winston')

router.get('/', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'SELECT typeID, typeName FROM TYPE ORDER BY typeName;';

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                console.log('[ERROR] Select Table "TYPE" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Table "TYPE" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS", typeList: rows})
            }
        })
    
        conn.release();
    })
})

router.post('/create', (req, res, next) => {

    if (!req.body.typeName) {
        res.send({result: "FAIL", msg: 'typeName cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'INSERT INTO TYPE(typeName) VALUES(?);';
        var body = req.body;
        var param = [body.typeName];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Insert Table "TYPE" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Insert Table "TYPE" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/modify', (req, res, next) => {

    if (!req.body.typeID || !req.body.newTypeName) {
        res.send({result: "FAIL", msg: 'typeID/newTypeName cannot be blank'})
        return;
    }

    if (req.body.typeName == req.body.newTypeName) {
        res.send({result: "FAIL", msg: 'typeName and newTypeName are same'})
        return;
    }

    getConnection((conn) => {
        var sql = 'UPDATE TYPE SET typeName=? WHERE typeID=?'
        var body = req.body;
        var param = [body.newTypeName, body.typeID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Update Table "TYPE" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Update Table "TYPE" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

router.post('/delete', (req, res, next) => {

    if(!req.body.typeID) {
        res.send({result: "FAIL", msg: 'typeID cannot be blank'})
        return;
    }

    getConnection((conn) => {
        var sql = 'DELETE FROM TYPE WHERE typeID=?'
        var body = req.body;
        var param = [body.typeID];

        conn.query(sql, param, (err) => {
            if(err) {
                console.log('[ERROR] Delete Table "TYPE" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Delete Table "TYPE" has problem\n' + err})
            } else {
                res.send({result: "SUCCESS"})
            }
        })

        conn.release();
    })
})

module.exports = router;