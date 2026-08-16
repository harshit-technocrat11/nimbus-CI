import express from "express";
import cors from "cors";
import helmet from "helmet";

const app: express.Express = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "nimbus-api",
  });

  console.log("/health - ok")
});

export default app;
