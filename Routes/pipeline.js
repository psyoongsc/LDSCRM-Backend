const { json } = require('body-parser');
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
        var sql = sql + ' AND a.date = ? AND a.isDelete = ? ORDER BY deptName, date desc;'
        var param = [date, 'N'];

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

router.get('/additions', (req, res, next) => {
    getConnection((conn) => {
        var sql = 'SELECT deptID, deptName FROM DEPT ORDER BY deptName; '
        sql = sql + 'SELECT customerID, customerName FROM CUSTOMER ORDER BY customerName; '
        sql = sql + 'SELECT typeID, typeName FROM TYPE ORDER BY typeName'

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                logger.error('Request /pipeline/additions : Select "Related Pipeline inputs" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select "Related Pipeline inputs" has problem\n' + err})
            } else {
                logger.info('Request /pipeline/additions : SUCCESS')
                res.send({result: "SUCCESS", depts: rows[0], customers: rows[1], types: rows[2]})
            }
        })

        conn.release();
    })
})

router.get('/:pipelineID', (req, res, next) => {
    getConnection((conn) => {
        var sql = 'SELECT a.pipelineID, b.deptName, c.customerName, d.typeName, a.title, a.date, a.createAt, a.modifyAt, expectedSales, expectedPurchase, expectedProfit' 
        var sql = sql + ' FROM PIPELINE a, DEPT b, CUSTOMER c, TYPE d'
        var sql = sql + ' WHERE a.deptID = b.deptID AND a.customerID = c.customerID AND a.typeID = d.typeID'
        var sql = sql + ' AND a.pipelineID = ?;'
        var sql = sql + ' SELECT seqnum, font, color, content'
        var sql = sql + ' FROM PIPELINE_CONTENTS'
        var sql = sql + ' WHERE pipelineID = ? ORDER BY seqnum'
        var param = [req.params.pipelineID, req.params.pipelineID];

        conn.query(sql, param, (err, rows, fields) => {
            if(err) {
                logger.error('Request /pipeline/' + req.params.pipelineID + ' : Select Contents "Related Pipeline" has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] Select Contents "Related Pipeline" has problem\n' + err})
            } else {
                logger.info('Request /pipeline/' + req.params.pipelineID + ' : SUCCESS')
                res.send({result: "SUCCESS", pipeline: rows[0], content: rows[1]})
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

    if(!body.deptID || !body.customerID || !body.typeID || !body.title || !body.date || !body.expectedSales || !body.expectedPurchase || !body.expectedProfit) {
        logger.error('Request /pipeline/create : please request with required informations (deptID, customerID, typeID, title, date, expectedSales, expectedPurchase, expectedProfit)')
        res.send({result: "FAIL", msg: '[ERROR] please request with required informations (deptID, customerID, typeID, title, date, expectedSales, expectedPurchase, expectedProfit)'})
        return;
    }

    var date = req.body.date;
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    let extractResult = date.match(dateRegex);
    if(!extractResult) {
        logger.error('Request /pipeline/create : date value is not valid')
        res.send({result: "FAIL", msg: '[ERROR] date value is not valid'})
        return;
    }

    var getLastID = new Promise((resolve, reject) => getConnection((conn) => {
        var sql = 'SELECT max(pipelineID) as last_id FROM PIPELINE;'

        conn.query(sql, (err, rows, fields) => {
            if(err) {
                reject(err);
            } else {
                var last_id = JSON.parse(JSON.stringify(rows[0])).last_id;
                resolve(++last_id);
            }
        })

        conn.release();
    }))

    var createPipeline = new Promise((resolve, reject) => getConnection((conn) => {
        var sql = 'INSERT INTO PIPELINE(deptID, customerID, typeID, title, date, expectedSales, expectedPurchase, expectedProfit, createAt, modifyAt, isDelete) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)'
        var param = [body.deptID, body.customerID, body.typeID, body.title, body.date, body.expectedSales, body.expectedPurchase, body.expectedProfit, 'N'];

        conn.query(sql, param, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })

        conn.release();
    }))

    createPipeline.then(() => {
        getLastID.then((last_id) => {
            getConnection((conn) => {
                var seqnum;
                for(seqnum=1; seqnum<=req.body.contents.length; seqnum++) {
                    var sql = 'INSERT INTO PIPELINE_CONTENTS(pipelineID, seqnum, font, color, content, createAt) VALUES(?, ?, ?, ?, ?, NOW())'
                    var param = [last_id, seqnum, req.body.contents[seqnum-1].font, req.body.contents[seqnum-1].color, req.body.contents[seqnum-1].content]

                    conn.query(sql, param, (err) => {
                        if(err) {
                            logger.error('Request /pipeline/create : Cannot create new Pipeline Content\n' + err)
                            res.send({result: "FAIL", msg: '[ERROR] Cannot create new Pipeline Content\n' + err})

                            conn.release();
                            return;
                        }
                    })
                }
                logger.info('Request /pipeline/create : SUCCESS')
                res.send({result: "SUCCESS"})

                conn.release();
            })
        }, (err) => {
            logger.error('Request /pipeline/create : DB Connection has problem\n' + err)
            res.send({result: "FAIL", msg: '[ERROR] DB Connection has problem\n' + err})
        })
    }, (err) => {
        logger.error('Request /pipeline/create : Cannot create New Pipeline\n' + err)
        res.send({result: "FAIL", msg: '[ERROR] Cannot create New Pipeline\n' + err})
    })
})

router.post('/modify/:pipelineID', (req, res, next) => {
    var body = req.body;

    if(!req.params.pipelineID || !body.deptID || !body.customerID || !body.typeID || !body.title || !body.date || !body.expectedSales || !body.expectedPurchase || !body.expectedProfit) {
        logger.error('Request /pipeline/modify : please request with required informations (pipelineID, deptID, customerID, typeID, title, date, expectedSales, expectedPurchase, expectedProfit)')
        res.send({result: "FAIL", msg: '[ERROR] please request with required informations (pipelineID, deptID, customerID, typeID, title, date, expectedSales, expectedPurchase, expectedProfit)'})
        return;
    }

    var date = req.body.date;
    const dateRegex = /^\d{4}\-\d{2}\-\d{2}$/;
    let extractResult = date.match(dateRegex);
    if(!extractResult) {
        logger.error('Request /pipeline/modify : date value is not valid')
        res.send({result: "FAIL", msg: '[ERROR] date value is not valid'})
        return;
    }

    var updatePipeline = new Promise((resolve, reject) => getConnection((conn) => {
        var sql = 'UPDATE PIPELINE SET deptID=?, customerID=?, typeID=?, title=?, date=?, expectedSales=?, expectedPurchase=?, expectedProfit=?, modifyAt=NOW() WHERE pipelineID=?'
        var param = [body.deptID, body.customerID, body.typeID, body.title, body.date, body.expectedSales, body.expectedPurchase, body.expectedProfit, req.params.pipelineID]

        conn.query(sql, param, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })

        conn.release();
    }))

    updatePipeline.then(() => {
        getConnection((conn) => {
            var sql = 'DELETE FROM PIPELINE_CONTENTS WHERE pipelineID=?'
            var param = [req.params.pipelineID]

            conn.query(sql, param, (err) => {
                if(err) {
                    logger.error('Request /pipeline/modify : Cannot create new Pipeline\n' + err)
                    res.send({result: "FAIL", msg: '[ERROR] Cannot create new Pipeline\n' + err})

                    conn.release();
                    return;
                }
            })

            var seqnum;
            for(seqnum=1; seqnum<=req.body.contents.length; seqnum++) {
                var sql = 'INSERT INTO PIPELINE_CONTENTS(pipelineID, seqnum, font, color, content, createAt) VALUES(?, ?, ?, ?, ?, NOW())'
                var param = [req.params.pipelineID, seqnum, req.body.contents[seqnum-1].font, req.body.contents[seqnum-1].color, req.body.contents[seqnum-1].content]

                conn.query(sql, param, (err) => {
                    if(err) {
                        logger.error('Request /pipeline/modify : Cannot create new Pipeline Content\n' + err)
                        res.send({result: "FAIL", msg: '[ERROR] Cannot create new Pipeline Content\n' + err})

                        conn.release();
                        return;
                    }
                })
            }
            logger.info('Request /pipeline/modify : SUCCESS')
            res.send({result: "SUCCESS"})

            conn.release();
        })
    }, (err) => {
        logger.error('Request /pipeline/modify : Cannot create New Pipeline\n' + err)
        res.send({result: "FAIL", msg: '[ERROR] Cannot create New Pipeline\n' + err})
    })
})

router.post('/delete/:pipelineID', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'UPDATE PIPELINE SET isDelete=?, deleteAt=NOW() WHERE pipelineID=?'
        var param = ['Y', req.params.pipelineID]
    
        conn.query(sql, param, (err) => {
            if(err) {
                logger.error('Request /pipeline/delete : delete pipeline has problem\n' + err)
                res.send({result: "FAIL", msg: '[ERROR] delete pipeline has problem\n' + err})
            } else {
                logger.info('Request /pipeline/delete : SUCCESS');
                res.send({result: "SUCCESS"});
            }
        })
    
        conn.release();
    })

})

router.post('/deletes', (req, res, next) => {

    getConnection((conn) => {
        var sql = 'UPDATE PIPELINE SET isDelete=?, deleteAt=NOW() WHERE pipelineID=?'

        var num;
        for(num=0; num<req.body.pipelineIDs.length; num++) {
            var param = ['Y', req.body.pipelineIDs[num]]
    
            conn.query(sql, param, (err) => {
                if(err) {
                    logger.error('Request /pipeline/deletes : delete pipeline has problem\n' + err)
                    res.send({result: "FAIL", msg: '[ERROR] delete pipeline has problem\n' + err})

                    conn.release();
                    return;
                }
            })
        }
        logger.info('Request /pipeline/deletes : SUCCESS');
        res.send({result: "SUCCESS"});

        conn.release();
    })
})

module.exports = router;