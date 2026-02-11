import express from 'express'
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import { errorMiddleware } from "@packages/error-handler/error-middleware"
import router from './routers/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();

app.post("/api/create-order", bodyParser.raw({ type: "application/json" }), (req, res, next) => {
  (req as any).rawBody = req.body;
  next();
},
  createOrder
)
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
})

app.use("/api", router)

app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`\n\n//===== Order Service Listening at http://localhost:${port}/api ====//\n\n`);
});
server.on('error', console.error);
