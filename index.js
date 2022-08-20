import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/routes.js'
import cors from 'cors'


const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false })) 
app.use("/", router)
app.use(cors())


app.listen(PORT, function () {    
 console.log(`Server is running on port ${PORT}`) 
}) 