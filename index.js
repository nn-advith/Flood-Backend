import express from 'express';
import router from './routes/routes.js'
import cors from 'cors'


const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use("/", router)

app.listen(PORT, function () {    
 console.log(`Server is running on port ${PORT}`) 
}) 