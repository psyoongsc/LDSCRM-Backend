const mysql = require('mysql');
const config = require('./db_config.json');
const { logger } = require('./winston')

// config.ssl = {ca: fs.readFileSync(__dirname + '/BaltimoreCyberTrustRoot.crt.pem')};
let pool = mysql.createPool(config);

function getConnection(res, callback) {
    pool.getConnection(function (err, conn) {
        if(!err) {
            callback(conn);
        }
        else {
            logger.error('get connection pool is not working. Check the database server status OR network connectivity.\n' + err);
            res.send({result: "FAIL", msg: 'get connection pool is not working. Check the database server status OR network connectivity.\n' + err})
            return;
        }
    })
}

module.exports = getConnection;