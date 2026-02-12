import express from 'express';
import cors from "cors"
import morgan from "morgan"
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import proxy from "express-http-proxy"
import cookieParser from "cookie-parser"
import { initializeConfig } from './libs/initializeSiteConfig';


const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.SELLER_UI_URL,
      process.env.USER_UI_URL
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(morgan("dev"))
app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({limit: "100mb", extended: true}))
app.use(cookieParser())
app.set("trust proxy", 1)

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: {error: "Too many requests, please try again later!"},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req, res) => {
  return ipKeyGenerator(req.ip!, 64); // 64-bit subnet for IPv6
}
})

app.use(limiter)


app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
})

app.use("/product", proxy(process.env.PRODUCT_SERVICE_URL!));
app.use("/order", proxy(process.env.ORDER_SERVICE_URL!));
app.use("/", proxy(process.env.AUTH_SERVICE_URL!));

const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`\n\n//===== API Gateway Listening at http://0.0.0.0:${port} ====//\n\n`)
  try {
    initializeConfig()
    console.log("Site config Initialized successfully!")
  } catch (error) {
    console.log(error)
  };
});
server.on('error', console.error);
