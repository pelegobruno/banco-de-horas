/* =====================================================
   CONFIGURAÇÃO
===================================================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwBJvFgLYiCbcQPkCDH9wBse69NLaiLulJD0FgoW7NwAoF2LUQm2cA1oUY_ezecVREt9g/exec";

const TOKEN = "CERTA-2026";

/* =====================================================
   ESTADO (MEMÓRIA)
===================================================== */
let isAuthenticated = false;
let usuarioLogado = null;

/* =====================================================
   ELEMENTOS LOGIN
===================================================== */
const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const btnLogin = document.getElementById("btnLogin");
const loginUsuario = document.getElementById("loginUsuario");
const loginSenha = document.getElementById("loginSenha");
const loginErro = document.getElementById("loginErro");

/* =====================================================
   ELEMENTOS DASH
===================================================== */
const form = document.getElementById("formBancoHoras");
const nomeInput = document.getElementById("nome");
const tipoInput = document.getElementById("tipo");
const dataInput = document.getElementById("data");
const horasInput = document.getElementById("horas");
const descricaoInput = document.getElementById("descricao");
const saldoEl = document.getElementById("saldoValor");
const toast = document.getElementById("toast");

/* =====================================================
   LOGIN
===================================================== */
btnLogin.addEventListener("click", async () => {
  loginErro.textContent = "";

  const usuario = loginUsuario.value.trim();
  const senha = loginSenha.value.trim();

  if (!usuario || !senha) {
    loginErro.textContent = "Preencha usuário e senha";
    return;
  }

  try {
    const res = await fetch(
      `${API_URL}?action=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}&token=${TOKEN}`
    );

    const data = await res.json();

    if (data.status === "OK" && data.usuario) {
      isAuthenticated = true;
      usuarioLogado = data.usuario;

      // identidade automática
      nomeInput.value = usuarioLogado;
      nomeInput.readOnly = true;

      loginScreen.style.display = "none";
      appScreen.style.display = "grid";

      consultarSaldo();
    } else {
      loginErro.textContent = "Usuário ou senha inválidos";
    }
  } catch (err) {
    console.error(err);
    loginErro.textContent = "Erro de conexão";
  }
});

/* =====================================================
   RELÓGIO (SÓ APÓS LOGIN)
===================================================== */
function atualizarRelogio() {
  if (!isAuthenticated) return;
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString("pt-BR");
}
setInterval(atualizarRelogio, 1000);

/* =====================================================
   DATA PADRÃO
===================================================== */
if (dataInput) {
  dataInput.value = new Date().toISOString().split("T")[0];
}

/* =====================================================
   CONSULTA DE SALDO (PROTEGIDA)
===================================================== */
async function consultarSaldo() {
  if (!isAuthenticated || !usuarioLogado) return;

  saldoEl.textContent = "⏳";

  try {
    const res = await fetch(
      `${API_URL}?action=saldo&nome=${encodeURIComponent(usuarioLogado)}&token=${TOKEN}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    const saldo = Number(data.saldo) || 0;

    saldoEl.textContent = `${saldo >= 0 ? "+" : ""}${saldo}h`;
    saldoEl.classList.toggle("positivo", saldo > 0);
    saldoEl.classList.toggle("negativo", saldo < 0);

  } catch (err) {
    console.error(err);
    saldoEl.textContent = "+0h";
    saldoEl.classList.remove("positivo", "negativo");
  }
}

/* =====================================================
   REGISTRO DE HORAS (PROTEGIDO)
===================================================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isAuthenticated || !usuarioLogado) return;

  const payload = new URLSearchParams({
    nome: usuarioLogado,
    tipo: tipoInput.value,
    data: dataInput.value,
    horas: horasInput.value,
    descricao: descricaoInput.value,
    ts: Date.now(),
    token: TOKEN
  });

  try {
    const res = await fetch(`${API_URL}?${payload.toString()}`);
    const data = await res.json();

    if (data.status === "OK") {
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3000);

      horasInput.value = "";
      descricaoInput.value = "";
      consultarSaldo();
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao registrar");
  }
});

/* =====================================================
   AO ABRIR A PÁGINA (SEMPRE LOGIN)
===================================================== */
window.addEventListener("load", () => {
  isAuthenticated = false;
  usuarioLogado = null;

  loginScreen.style.display = "flex";
  appScreen.style.display = "none";
});
