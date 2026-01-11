/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbz7oyxwHcqq6x7sQWZoyLRowMKxCGtfjfLijcX9iF_ONYqCt5lYvce2qbH5oKPPxSmelg/exec";

/* =====================================================
   RELÓGIO
===================================================== */
function atualizarRelogio() {
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString("pt-BR");
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

/* =====================================================
   ELEMENTOS
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
   UX TIPO
===================================================== */
tipoInput.addEventListener("change", () => {
  horasInput.style.borderColor =
    tipoInput.value === "quitacao" ? "#ff6b6b" : "#00ffcc";
});

/* =====================================================
   CONSULTA DE SALDO
===================================================== */
async function consultarSaldo() {
  const nome = nomeInput.value.trim();

  if (!nome) {
    saldoEl.textContent = "+0h";
    saldoEl.classList.remove("positivo", "negativo");
    return;
  }

  saldoEl.textContent = "⏳";

  try {
    const res = await fetch(
      `${API_URL}?action=saldo&nome=${encodeURIComponent(nome)}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    console.log("API:", data);

    const saldo = Number(data.saldo);

    if (!saldo) {
      saldoEl.textContent = "+0h";
      saldoEl.classList.remove("positivo", "negativo");
      return;
    }

    saldoEl.textContent = `${saldo > 0 ? "+" : ""}${saldo}h`;
    saldoEl.classList.toggle("positivo", saldo > 0);
    saldoEl.classList.toggle("negativo", saldo < 0);

  } catch (err) {
    console.error(err);
    saldoEl.textContent = "+0h";
  }
}

/* =====================================================
   EVENTOS
===================================================== */
nomeInput.addEventListener("input", () => {
  if (nomeInput.value.length >= 3) consultarSaldo();
});
nomeInput.addEventListener("blur", consultarSaldo);

/* =====================================================
   SUBMIT
===================================================== */
form.addEventListener("submit", () => {
  tsInput.value = Date.now();
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
  setTimeout(consultarSaldo, 1500);
});

/* =====================================================
   AO ABRIR
===================================================== */
window.addEventListener("load", () => {
  saldoEl.textContent = "+0h";
});
