import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import loginRoute from './routes/loginRoute.js';
import userRoute from './routes/useRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './services/mongo.js';


const app = express();

dotenv.config({path:'.env'})
const PORT = process.env.PORT || 8080

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3005",
  ];

app.use(
    cors({
      origin: (origin, callback) => {
     
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );

app.use("/auth", loginRoute);
app.use("/users", userRoute);



app.use((req, res, next) => {
  console.log(`Unhandled route: ${req.method} ${req.url}`);
  res.status(404).send('Route not found');
});



app.listen(PORT,()=>{(console.log(`Server is running on http://localhost:${PORT}`))});

connectDB();
