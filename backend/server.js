import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

/* =========================
ESTADO GLOBAL DO JOGO
========================= */

let currentCharacter = null;
let attemptsLeft = 3;

/* =========================
PERSONAGENS (EXEMPLOS)
SÓ FAMOSOS MUNDIAIS
========================= */

const characters = {
cinema: [
{ name: "Leonardo DiCaprio", gender: "male" },
{ name: "Meryl Streep", gender: "female" },
{ name: "Brad Pitt", gender: "male" },
{ name: "Angelina Jolie", gender: "female" }
],
desporto: [
{ name: "Cristiano Ronaldo" },
{ name: "Lionel Messi" }
],
historia: [
{ name: "Napoleon Bonaparte" },
{ name: "Cleopatra" }
],
musica: [
{ name: "Michael Jackson" },
{ name: "Madonna" }
]
};

/* =========================
START GAME
========================= */

app.post("/start", async (req, res) => {
const { category, difficulty } = req.body;

const list = characters[category];
if (!list) {
return res.status(400).json({ error: "Categoria inválida" });
}

currentCharacter = list[Math.floor(Math.random() * list.length)];
attemptsLeft = 3;

console.log("🎭 Personagem escolhida:", currentCharacter.name);

res.json({ message: "Jogo iniciado" });
});

/* =========================
ASK QUESTION
========================= */

app.post("/ask", async (req, res) => {
if (!currentCharacter) {
return res.json({ answer: "O jogo ainda não começou." });
}

const { question } = req.body;

const systemPrompt = `
Estás a jogar "Quem Sou Eu".

REGRAS OBRIGATÓRIAS:
- A personagem é ${currentCharacter.gender === "female" ? "uma mulher" : "um homem"}
- NUNCA digas o nome da personagem
- Responde de forma clara, humana e objetiva
- Podes dizer factos verdadeiros (Óscares, anos, filmes)
- Se a pergunta pedir diretamente o nome → responde: "Não posso dizer o meu nome."
`;

const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: question }
]
});

res.json({
answer: completion.choices[0].message.content
});
});

/* =========================
GUESS CHARACTER
========================= */

app.post("/guess", (req, res) => {
if (!currentCharacter) {
return res.json({ result: "O jogo ainda não começou." });
}

const guess = req.body.name.toLowerCase().trim();
const correctName = currentCharacter.name.toLowerCase();

if (guess === correctName) {
return res.json({
correct: true,
gameOver: true,
result: `🎉 Acertaste! Eu sou ${currentCharacter.name}.`
});
}

attemptsLeft--;

if (attemptsLeft <= 0) {
return res.json({
correct: false,
gameOver: true,
result: `❌ Fim do jogo! Eu era ${currentCharacter.name}.`
});
}

return res.json({
correct: false,
gameOver: false,
result: `❌ Errado. Restam ${attemptsLeft} tentativas.`
});
});

/* =========================
START SERVER
========================= */

app.listen(PORT, () => {
console.log(`✅ Servidor ativo em http://localhost:${PORT}`);
});