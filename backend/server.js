import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let personagemAtual = null;

/* ===============================
   FUNÇÃO: carregar categoria
================================ */
function carregarCategoria(nomeFicheiro) {
  const caminho = path.join(process.cwd(), "backend", "data", nomeFicheiro);
  const conteudo = fs.readFileSync(caminho, "utf-8");
  return JSON.parse(conteudo);
}

/* ===============================
   ESCOLHER PERSONAGEM
================================ */
app.post("/start", (req, res) => {
  const { categoria } = req.body;

  let dados;

  switch (categoria) {
    case "cinema":
      dados = carregarCategoria("cinema.json");
      break;
    case "historia":
      dados = carregarCategoria("historia.json");
      break;
    case "ciencia":
      dados = carregarCategoria("ciencia.json");
      break;
    case "politica":
      dados = carregarCategoria("politica.json");
      break;
    default:
      return res.status(400).json({ erro: "Categoria inválida" });
  }

  const lista = dados.personagens;
  const sorteado = lista[Math.floor(Math.random() * lista.length)];

  personagemAtual = {
    categoria: dados.categoria,
    dados: sorteado
  };

  console.log("🎯 Personagem escolhida:", personagemAtual.dados.nome);

  res.json({
    mensagem: "Personagem escolhida. Podes começar a perguntar."
  });
});

/* ===============================
   PERGUNTAS (SIM / NÃO)
================================ */
app.post("/pergunta", (req, res) => {
  if (!personagemAtual) {
    return res.status(400).json({ erro: "Jogo não iniciado" });
  }

  const { pergunta } = req.body;
  const p = pergunta.toLowerCase();
  const dados = personagemAtual.dados;

  let resposta = "Não sei responder a isso.";

  if (p.includes("homem") || p.includes("masculino")) {
    resposta = dados.sexo === "masculino" ? "Sim" : "Não";
  }

  if (p.includes("mulher") || p.includes("feminino")) {
    resposta = dados.sexo === "feminino" ? "Sim" : "Não";
  }

  if (p.includes("vivo")) {
    resposta = dados.vivo ? "Sim" : "Não";
  }

  if (p.includes("oscar")) {
    resposta = dados.oscar ? "Sim" : "Não";
  }

  if (p.includes("ator")) {
    resposta = dados.tipo === "ator" ? "Sim" : "Não";
  }

  if (p.includes("americana")) {
    resposta = dados.nacionalidade === "americana" ? "Sim" : "Não";
  }

  res.json({ resposta });
});

/* ===============================
   ADIVINHAR NOME
================================ */
app.post("/adivinhar", (req, res) => {
  if (!personagemAtual) {
    return res.status(400).json({ erro: "Jogo não iniciado" });
  }

  const { nome } = req.body;

  const nomeJogador = nome.toLowerCase().trim();
  const nomeReal = personagemAtual.dados.nome.toLowerCase();

  if (nomeJogador === nomeReal) {
    const vencedor = personagemAtual.dados.nome;
    personagemAtual = null;

    return res.json({
      resultado: "certo",
      mensagem: `🎉 Correto! A personagem era ${vencedor}`
    });
  }

  res.json({
    resultado: "errado",
    mensagem: "❌ Errado. Continua a tentar."
  });
});

/* ===============================
   RESET JOGO
================================ */
app.post("/reset", (req, res) => {
  personagemAtual = null;
  res.json({ mensagem: "Jogo reiniciado." });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Servidor ativo em http://localhost:${PORT}`);
});