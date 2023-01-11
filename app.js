
// <------------------Package Define------------------>
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
// custom packages
const getConnection = require('./Config/database')
const { logger } = require('./Config/winston')
// <------------------/Package Define------------------>

// <------------------Router------------------>
const indexRouter = require('./Routes/index')
const adminDeptRouter = require('./Routes/admin_dept')
const adminCustomerRouter = require('./Routes/admin_customer')
const pipelineRouter = require('./Routes/pipeline')
// <------------------/Router------------------>

// <------------------Express Settings------------------>
const app = express()
const port = 3000
// <------------------/Express Settings------------------>

app.use(bodyParser.json())
app.use(cors())

app.use('/', indexRouter)
app.use('/admin/dept', adminDeptRouter)
app.use('/admin/customer', adminCustomerRouter)
app.use('/pipeline', pipelineRouter)

app.listen(port, () => {
    console.log(`CRM App listening at http://localhost:${port}`)
});