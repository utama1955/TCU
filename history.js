function formatTanggalIndonesia(tanggalISO){
if(!tanggalISO) return "-";

try{
const tanggal = new Date(tanggalISO);

if(isNaN(tanggal)) return tanggalISO;

return tanggal.toLocaleDateString("id-ID", {
day: "numeric",
month: "long",
year: "numeric",
hour: "2-digit",
minute: "2-digit"
});

}catch{
return tanggalISO;
}
}

function safeText(value){
if(value === null || value === undefined) return "-";

const text = String(value).trim();
return text !== "" ? text : "-";
}

function renderHistoryItem(item){
const note = safeText(item.note);
const cabang = safeText(item.cabang);
const kategori = safeText(item.kategori);
const vendor = safeText(item.vendor);
const estimasi = safeText(item.estimasi);
const details = safeText(item.details);

return `
<div class="history-item">
  <div class="history-date">${formatTanggalIndonesia(item.tanggal)}</div>
  <div class="history-action">${safeText(item.action)}</div>
  <div class="history-meta">Status: ${safeText(item.status)}</div>
  ${cabang !== "-" ? `<div class="history-meta">Cabang : ${cabang}</div>` : ""}
  ${kategori !== "-" ? `<div class="history-meta">Kategori : ${kategori}</div>` : ""}
  ${note !== "-" ? `<div class="history-text">${note}</div>` : ""}
  ${vendor !== "-" ? `<div class="history-meta">Vendor : ${vendor}</div>` : ""}
  ${estimasi !== "-" ? `<div class="history-meta">Estimasi : ${estimasi}</div>` : ""}
  ${details !== "-" ? `<div class="history-meta">${details}</div>` : ""}
</div>
`;
}

async function loadTicketHistory(){
const btn = document.getElementById("btnCekHistory");
const hasil = document.getElementById("hasil");
const ticket = document.getElementById("ticket").value.trim().toUpperCase();

if(!ticket){
alert("Masukkan Ticket ID");
return;
}

btn.disabled = true;
btn.innerText = "Memuat...";
hasil.innerHTML = "<div class='loading-box'>Memuat history laporan...</div>";

try{
const response = await fetch(
API_URL +
"?action=history" +
"&ticket_id=" + encodeURIComponent(ticket) +
"&token=" + encodeURIComponent(localStorage.getItem("token"))
);

const data = await response.json();

if(data.session_expired){
alert("Session berakhir. Silakan login ulang.");
localStorage.clear();
window.location.href = "login.html";
return;
}

if(!data || data.success === false){
hasil.innerHTML = "<div class='empty-state'>History laporan tidak bisa dimuat.</div>";
return;
}

const history = Array.isArray(data.history) ? data.history : [];

if(history.length === 0){
hasil.innerHTML = `<div class='empty-state'>Belum ada history untuk ${ticket}.</div>`;
return;
}

hasil.innerHTML = `
<div class="ticket-title">${ticket}</div>
<div class="history-list">
  ${history.map(renderHistoryItem).join("")}
</div>
`;

}catch(error){
console.error("LOAD HISTORY ERROR:", error);
hasil.innerHTML = "<div class='empty-state'>Terjadi kesalahan saat memuat history.</div>";
}finally{
btn.disabled = false;
btn.innerText = "CEK HISTORY";
}
}

document.addEventListener("DOMContentLoaded", function(){
const ticketInput = document.getElementById("ticket");

ticketInput.addEventListener("keydown", function(event){
if(event.key === "Enter"){
event.preventDefault();
loadTicketHistory();
}
});
});
