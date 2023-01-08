const express = require('express')
const bodyParser = require('body-parser')

const getConnection = require('./Config/database')

// <------------------Router------------------>

const indexRouter = require('./Routes/index')
const adminDeptRouter = require('./Routes/admin_dept')

// <------------------/Router------------------>


// <------------------Express Settings------------------>

const app = express()
const port = 3000

// <------------------/Express Settings------------------>

app.use(bodyParser.json())

app.use('/', indexRouter)
app.use('/admin/dept', adminDeptRouter)

app.listen(port, () => {
    console.log(`CRM App listening at http://localhost:${port}`)
});