import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ocrImageToText, extractBillsFromText } from "./ocr.js";
import { planPayoff } from "./debt/planner.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// simple in-memory store for demo
const users = new Map(); // email -> {id,email,pass}
const debts = new Map(); // id -> debt

function auth(req,res,next){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if(!token) return res.status(401).json({error:"No token"});
  // accept "demo" token for quick start
  if(token === "demo"){ req.user = { uid: "demo" }; return next(); }
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch(e){ return res.status(401).json({error:"Invalid token"}); }
}

app.post("/auth/register", async (req,res)=>{
  const {email,password} = req.body||{};
  if(!email || !password) return res.status(400).json({error:"missing"});
  if(users.has(email)) return res.status(409).json({error:"exists"});
  const hash = await bcrypt.hash(password, 10);
  const id = "u_"+Math.random().toString(36).slice(2);
  users.set(email, { id, email, pass: hash });
  const token = jwt.sign({ uid: id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.post("/auth/login", async (req,res)=>{
  const {email,password} = req.body||{};
  const u = users.get(email);
  if(!u) return res.status(401).json({error:"bad creds"});
  const ok = await bcrypt.compare(password, u.pass);
  if(!ok) return res.status(401).json({error:"bad creds"});
  const token = jwt.sign({ uid: u.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/health", (_,res)=> res.json({ok:true}));

// uploads
const upload = multer({ dest: path.join(__dirname, "..", "uploads") });

app.post("/import/image", auth, upload.single("file"), async (req,res)=>{
  try{
    const text = await ocrImageToText(req.file.path);
    const bills = extractBillsFromText(text);
    res.json({ bills, textSnippet: text.slice(0, 400) });
  }catch(e){ res.status(400).json({ error: String(e) }); }
});

// debts
app.get("/debts", auth, (req,res)=>{
  const items = [...debts.values()].filter(d=> d.userId===req.user.uid);
  res.json({ items });
});

app.post("/debts", auth, (req,res)=>{
  const { name, principal, apr, min } = req.body||{};
  const id = "d_"+Math.random().toString(36).slice(2);
  const debt = { id, userId: req.user.uid, name, principal:Number(principal), apr:Number(apr), min:Number(min)||0 };
  debts.set(id, debt);
  res.json({ debt });
});

app.post("/debts/plan", auth, (req,res)=>{
  const { monthlyBudget, method } = req.body||{};
  const list = [...debts.values()].filter(d=> d.userId===req.user.uid);
  const plan = planPayoff({ debts:list, monthlyBudget:Number(monthlyBudget), method });
  res.json(plan);
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log("API on :"+port));
