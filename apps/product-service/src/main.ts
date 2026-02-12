import express from 'express';
import "./jobs/product-cron.job"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/product.router';

const app = express();

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello Product API'});
})

app.use("/api", router)
app.use(errorMiddleware)

const port = Number(process.env.PORT) || 6002
const server = app.listen(port, ()=>{
    console.log(`\n\n//===== Product service is running at http://localhost:${port}/api ====//\n\n`)
})

server.on("error", (err)=>{
    console.log("Server Error: ", err)
})