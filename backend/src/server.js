import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { router as authRouter } from "./routes/auth.js";
import { router as leadsRouter } from "./routes/leads.js";
import { router as dealsRouter } from "./routes/deals.js";
import { router as tasksRouter } from "./routes/tasks.js";
import { router as usersRouter } from "./routes/users.js";
import { settings } from "./shared/settings.js";

dotenv.config();

const app = express();

app.use(cors({
	origin: settings.corsOrigins,
	credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
	return res.json("CRM API running");
});

app.get("/health", (req, res) => {
	return res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`Node CRM backend listening on :${port}`);
});


