/* =====================================================
   CONFIGURAÇÃO DA API (CONFIRMADA FUNCIONAL)
===================================================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbz7oyxwHcqq6x7sQWZoyLRowMKxCGtfjfLijcX9iF_ONYqCt5lYvce2qbH5oKPPxSmelg/exec";

/* =====================================================
   RELÓGIO
===================================================== */
function atualizarRelogio() {
  const agora = new Date();
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    clockEl.textContent = agora.toLocaleTimeString("pt-BR");
  }
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

/* =====================================================
   ELEMENTOS DO DOM
===================================================== */
const form = document.getElementById("formBancoHoras");
const nomeInput = document.getElementById("nome");
const tipoInput = document.getElementById("tipo");
const dataInput = document.getElementById("data");
const horasInput = document.getElementById("horas");
const descricaoInput = document.getElementById("descricao");
const saldoEl = document.getElementById("saldoValor");
const tsInput = document.getElementById("ts");
const toast = document.getElementById("toast");

/* =====================================================
   DATA PADRÃO
===================================================== */
if (dataInput) {
  dataInput.value = new Date().toISOString().split("T")[0];
}

/* =====================================================
   UX – TIPO (EXTRA / QUITAÇÃO)
===================================================== */
tipoInput.addEventListener("change", () => {
  if (tipoInput.value === "quitacao") {
    descricaoInput.placeholder = "Quitação / pagamento de horas";
    horasInput.style.borderColor = "#ff6b6b";
  } else {
    descricaoInput.placeholder = "Descrição";
    horasInput.style.borderColor = "#00ffcc";
  }
});

/* =====================================================
   CONSULTA DE SALDO (BACKEND CONFIRMADO)
===================================================== */
async function consultarSaldo() {
  const nome = nomeInput.value.trim();

  // estado neutro
  if (!nome) {
    saldoEl.textContent = "+0h";
    saldoEl.classList.remove("positivo", "negativo");
    return;
  }

  saldoEl.textContent = "⏳";

  try {
    const response = await fetch(
      `${API_URL}?action=saldo&nome=${encodeURIComponent(nome)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Falha na resposta da API");
    }

    const data = await response.json();
    console.log("Resposta da API:", data); // DEBUG VISUAL

    const saldo = Number(data.saldo);

    // tratamento EXATO do zero
    if (isNaN(saldo) || saldo === 0) {
      saldoEl.textContent = "+0h";
      saldoEl.classList.remove("positivo", "negativo");
      return;
    }

    saldoEl.textContent = `${saldo > 0 ? "+" : ""}${saldo}h`;

    saldoEl.classList.remove("positivo", "negativo");
    if (saldo > 0) saldoEl.classList.add("positivo");
    if (saldo < 0) saldoEl.classList.add("negativo");

  } catch (erro) {
    console.error("Erro ao consultar saldo:", erro);
    saldoEl.textContent = "+0h";
    saldoEl.classList.remove("positivo", "negativo");
  }
}

/* =====================================================
   EVENTOS DE CONSULTA
===================================================== */
nomeInput.addEventListener("input", () => {
  if (nomeInput.value.trim().length >= 3) {
    consultarSaldo();
  }
});

nomeInput.addEventListener("blur", consultarSaldo);

/* =====================================================
   SUBMIT DO FORMULÁRIO
===================================================== */
form.addEventListener("submit", () => {
  // timestamp para evitar cache no Apps Script
  tsInput.value = Date.now();

  // feedback visual
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);

  // aguarda gravação no Sheets e recalcula
  setTimeout(consultarSaldo, 1500);
});

/* =====================================================
   CONSULTA AO ABRIR A PÁGINA
===================================================== */
window.addEventListener("load", () => {
  if (nomeInput.value.trim()) {
    consultarSaldo();
  } else {
    saldoEl.textContent = "+0h";
  }
});
