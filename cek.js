// ================================
// FORMAT TANGGAL INDONESIA
// ================================
function formatTanggalIndonesia(tanggalISO){
if(!tanggalISO) return "-";

try{
const tanggal = new Date(tanggalISO);

if(isNaN(tanggal)) return tanggalISO;

return tanggal.toLocaleDateString("id-ID", {
day: "numeric",
month: "long",
year: "numeric"
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

function getStatusClass(status){
if(status === "On Progress") return "status-progress";
if(status === "Done") return "status-done";
if(status === "Pending") return "status-pending";
return "status-open";
}

function renderPhotoButton(url){
const fotos = parseFotoList(url);

if(fotos.length === 0){
return "-";
}

const label = fotos.length > 1 ? "Lihat " + fotos.length + " Foto" : "Lihat Foto";
const payload = encodeURIComponent(JSON.stringify(fotos));

return `<button type="button" class="inline-action" onclick="openFotoStatus('${payload}')">${label}</button>`;
}

function parseFotoList(value){
const foto = safeText(value);

if(foto === "-"){
return [];
}

try{
const parsed = JSON.parse(foto);
if(Array.isArray(parsed)){
return parsed.filter(function(url){
return safeText(url) !== "-";
});
}
}catch(error){
}

return [foto];
}

function copyTicketId(event, ticketId){
if(event){
event.stopPropagation();
}

const button = event ? event.currentTarget : null;
const originalText = button ? button.textContent : "";

function showCopied(){
if(button){
button.textContent = "Copied";
button.classList.add("copied");
setTimeout(function(){
button.textContent = originalText || "Copy";
button.classList.remove("copied");
}, 1200);
}
}

if(navigator.clipboard && window.isSecureContext){
navigator.clipboard.writeText(ticketId).then(showCopied).catch(function(){
fallbackCopyTicket(ticketId);
showCopied();
});
return;
}

fallbackCopyTicket(ticketId);
showCopied();
}

function fallbackCopyTicket(ticketId){
const input = document.createElement("input");
input.value = ticketId;
input.setAttribute("readonly", "");
input.style.position = "fixed";
input.style.left = "-9999px";
document.body.appendChild(input);
input.select();
document.execCommand("copy");
document.body.removeChild(input);
}

function renderHistoryItem(item){
const note = safeText(item.note);
const vendor = safeText(item.vendor);
const cabang = safeText(item.cabang);
const kategori = safeText(item.kategori);
const estimasi = safeText(item.estimasi);
const details = safeText(item.details);

return `
<div class="history-item">
  <div class="history-date">${formatTanggalIndonesia(item.tanggal)}</div>
  <div class="history-body">
    <div class="history-action">${safeText(item.action)}</div>
    <div class="history-meta">Status: ${safeText(item.status)}</div>
    ${cabang !== "-" ? `<div class="history-meta">Cabang: ${cabang}</div>` : ""}
    ${kategori !== "-" ? `<div class="history-meta">Kategori: ${kategori}</div>` : ""}
    ${note !== "-" ? `<div class="history-text">${note}</div>` : ""}
    ${vendor !== "-" ? `<div class="history-meta">Vendor: ${vendor}</div>` : ""}
    ${estimasi !== "-" ? `<div class="history-meta">Estimasi: ${estimasi}</div>` : ""}
    ${details !== "-" ? `<div class="history-meta">${details}</div>` : ""}
  </div>
</div>
`;
}

function renderHistory(history){
if(!Array.isArray(history) || history.length === 0){
return "<div class='history-empty'>Belum ada histori update.</div>";
}

return history.map(renderHistoryItem).join("");
}

// Render list item (header yang diklik untuk expand)
function renderTicketListItem(ticket){
const statusText = safeText(ticket.status) === "-" ? "Waiting" : safeText(ticket.status);
const statusClass = getStatusClass(statusText);
const ticketId = safeText(ticket.id);

// Detail yang akan ditampilkan saat expand
const detailHTML = `
<div class="ticket-detail">
  <div class="ticket-grid">
    <div class="ticket-field">
      <div class="label">Tanggal Lapor</div>
      <div class="value">${formatTanggalIndonesia(ticket.tanggal)}</div>
    </div>
    <div class="ticket-field">
      <div class="label">Update Terakhir</div>
      <div class="value">${formatTanggalIndonesia(ticket.update)}</div>
    </div>
    <div class="ticket-field">
      <div class="label">Cabang</div>
      <div class="value">${safeText(ticket.departemen)}</div>
    </div>
    <div class="ticket-field">
      <div class="label">Nama Aset</div>
      <div class="value">${safeText(ticket.aset)}</div>
    </div>
    <div class="ticket-field">
      <div class="label">Kategori</div>
      <div class="value">${safeText(ticket.kategori)}</div>
    </div>
    <div class="ticket-field">
      <div class="label">Estimasi Selesai</div>
      <div class="value">${safeText(ticket.estimasi)}</div>
    </div>
  </div>

  <div class="label">Deskripsi Kerusakan</div>
  <div class="value">${safeText(ticket.deskripsi)}</div>

  <div class="label">Catatan GA</div>
  <div class="value">${safeText(ticket.catatan)}</div>

  <div class="ticket-footer">
    <div>
      <div class="label">Vendor</div>
      <div class="value">${safeText(ticket.vendor)}</div>
    </div>
    <div>
      <div class="label">Foto Pelaporan</div>
      <div class="value">${renderPhotoButton(ticket.foto)}</div>
    </div>
  </div>
</div>
`;

return `
<div class="ticket-list-item" id="ticket-${ticketId}">
  <div class="ticket-list-header" onclick="toggleTicketDetail('${ticketId}')">
    <div class="ticket-list-info">
      <div class="ticket-id-row">
        <div class="ticket-list-id">#${ticketId}</div>
        <button type="button" class="copy-ticket-btn" onclick="copyTicketId(event, '${ticketId}')">Copy</button>
      </div>
      <div class="ticket-list-meta">
        <span>📦 ${safeText(ticket.aset)}</span>
        <span>🏢 ${safeText(ticket.departemen)}</span>
        <span>📅 ${formatTanggalIndonesia(ticket.tanggal)}</span>
      </div>
    </div>
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
      <span class="${statusClass}">${statusText}</span>
      <div class="ticket-expand-icon">▼</div>
    </div>
  </div>
  ${detailHTML}
</div>
`;
}

async function loadMyTickets(){
const hasil = document.getElementById("hasil");

hasil.innerHTML = "<div class='loading-box'>Memuat laporan Anda...</div>";

try{
const response = await fetch(
API_URL +
"?action=myTickets" +
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
hasil.innerHTML = "<div class='empty-state'>Laporan tidak bisa dimuat.</div>";
return;
}

const tickets = Array.isArray(data.tickets) ? data.tickets : [];

if(tickets.length === 0){
hasil.innerHTML = `<div class='empty-state'>Tidak ada laporan aktif untuk akun ini.<br>Laporan dengan status Selesai tidak ditampilkan.</div>`;
return;
}

tickets.sort(function(a,b){
return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
});

hasil.innerHTML = tickets.map(renderTicketListItem).join("");

}catch(err){
hasil.innerHTML = "<div class='empty-state'>Data laporan tidak bisa ditampilkan. Silakan hubungi admin.</div>";
console.error(err);
}
}

document.addEventListener("DOMContentLoaded", loadMyTickets);
