import express from 'express';
import cors from "cors"
import "./jobs/product-cron.job"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/product.router';
// import router from '@auth-service/src/routes/auth.router';
// import swaggerUi from "swagger-ui-express"
// import swaggerDocument from "@auth-service/src/swagger-output.json"

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello Product API'});
})

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
// app.get("/docs-json", (req, res) => {
//     res.json(swaggerDocument)
// })
app.use("/api", router)
app.use(errorMiddleware)

const port = process.env.PORT || 6002
const server = app.listen(port, ()=>{
    console.log(`Product service is running at http://localhost:${port}/api`)
    // console.log(`Swagger docs available at http://localhost:${port}/docs`)
})

server.on("error", (err)=>{
    console.log("Server Error: ", err)
})