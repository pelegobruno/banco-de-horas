// =======================================
// CONFIGURAÇÃO
// =======================================
const STORAGE_KEY = "bancoHorasRegistros";

// =======================================
// RELÓGIO
// =======================================
function atualizarRelogio() {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, "0");
  const m = String(agora.getMinutes()).padStart(2, "0");
  const s = String(agora.getSeconds()).padStart(2, "0");

  const clock = document.getElementById("clock");
  if (clock) clock.textContent = `${h}:${m}:${s}`;
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// =======================================
// TOAST
// =======================================
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.className = `toast ${tipo} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// =======================================
// LOCAL STORAGE
// =======================================
function obterRegistros() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function salvarRegistroLocal(registro) {
  const registros = obterRegistros();
  registros.push(registro);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

// =======================================
// SALDO
// =======================================
function calcularSaldo(registros) {
  return registros.reduce(
    (total, r) => total + (r.tipo === "extra" ? r.horas : -r.horas),
    0
  );
}

function atualizarSaldo(valor) {
  const saldoEl = document.getElementById("saldo");
  if (!saldoEl) return;

  saldoEl.textContent = `${valor >= 0 ? "+" : ""}${valor}h`;

  saldoEl.className =
    valor > 0
      ? "saldo-positivo"
      : valor < 0
      ? "saldo-negativo"
      : "saldo-neutro";
}

// =======================================
// RENDER HISTÓRICO
// =======================================
function renderizarHistorico() {
  const registros = obterRegistros();
  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = "";

  registros.forEach((r) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${r.data}</strong><br>
        <small>${r.descricao}</small>
      </div>
      <span class="${r.tipo === "extra" ? "positivo" : "negativo"}">
        ${r.tipo === "extra" ? "+" : "-"}${r.horas}h
      </span>
    `;

    lista.appendChild(li);
  });

  atualizarSaldo(calcularSaldo(registros));
}

// =======================================
// FORM SUBMIT (ÚNICO E DEFINITIVO)
// =======================================
function onSubmitForm() {
  const tipo = document.getElementById("tipo").value;
  const data = document.getElementById("data").value;
  const horas = Number(document.getElementById("horas").value);
  const descricao = document.getElementById("descricao").value.trim();

  if (!data || !horas || horas <= 0 || !descricao) {
    mostrarToast("Preencha todos os campos corretamente", "erro");
    return false;
  }

  // 🔥 cache buster (OBRIGATÓRIO)
  const tsInput = document.getElementById("ts");
  if (tsInput) tsInput.value = Date.now();

  const registro = { tipo, data, horas, descricao };

  salvarRegistroLocal(registro);
  renderizarHistorico();

  mostrarToast(
    "Registro salvo localmente e enviado ao Google Sheets",
    "sucesso"
  );

  document.getElementById("horas").value = "";
  document.getElementById("descricao").value = "";

  return true; // deixa o FORM enviar
}

// =======================================
// EXPORTAR JSON
// =======================================
function exportarJSON() {
  const registros = obterRegistros();

  const blob = new Blob(
    [
      JSON.stringify(
        {
          saldo: calcularSaldo(registros),
          registros,
          exportadoEm: new Date().toISOString(),
        },
        null,
        2
      ),
    ],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "banco-horas.json";
  a.click();
}

// =======================================
// LIMPAR HISTÓRICO
// =======================================
function limparHistorico() {
  if (!confirm("Deseja limpar todo o histórico local?")) return;

  localStorage.removeItem(STORAGE_KEY);
  renderizarHistorico();
  mostrarToast("Histórico local limpo", "sucesso");
}

// =======================================
// INIT
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  if (dataInput) {
    dataInput.value = new Date().toISOString().split("T")[0];
  }

  renderizarHistorico();

  const btnLimpar = document.getElementById("btnLimpar");
  const btnExportar = document.getElementById("btnExportar");

  if (btnLimpar) btnLimpar.onclick = limparHistorico;
  if (btnExportar) btnExportar.onclick = exportarJSON;
});
