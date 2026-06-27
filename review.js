function formatTanggalIndonesia(tanggalISO){
if(!tanggalISO) return "-";

try{
const tanggal = new Date(tanggalISO);
if(isNaN(tanggal)) return tanggalISO;

return tanggal.toLocaleDateString("id-ID", {
day:"numeric",
month:"long",
year:"numeric"
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

function safeHtml(value){
return safeText(value)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#39;");
}

function setRating(ticketId, rating){
const card = document.getElementById("review-" + ticketId);
if(!card) return;

card.dataset.rating = String(rating);

card.querySelectorAll(".rating-btn").forEach(function(button){
button.classList.toggle("active", Number(button.dataset.rating) === Number(rating));
});
}

function renderReviewCard(ticket){
const ticketId = safeText(ticket.id);
const existingRating = Number(ticket.review_rating || 0);
const existingNote = safeText(ticket.review_note) === "-" ? "" : safeText(ticket.review_note);
const alreadyReviewed = existingRating > 0;
const isAdmin = localStorage.getItem("role") === "admin";
const isLocked = isAdmin || alreadyReviewed;
const disabledAttr = isLocked ? " disabled" : "";

const ratingButtons = [1,2,3,4,5].map(function(value){
const activeClass = value === existingRating ? " active" : "";
const clickAttr = isLocked ? "" : ` onclick="setRating('${ticketId}', ${value})"`;
return `<button type="button" class="rating-btn${activeClass}" data-rating="${value}"${clickAttr}${disabledAttr}>${value}</button>`;
}).join("");

let reviewInfo = "";
let actionButton = "";

if(isAdmin){
reviewInfo = alreadyReviewed
? `<div class="review-note">Review pelapor: ${existingRating}/5</div>`
: `<div class="review-note locked">Belum ada review dari pelapor.</div>`;
}else if(alreadyReviewed){
reviewInfo = `<div class="review-note locked">Review sudah dikirim dan tidak bisa diubah.</div>`;
}else{
actionButton = `
    <button type="button" class="save-review-btn" id="save-${ticketId}" onclick="submitReview('${ticketId}')">
      Simpan Review
    </button>`;
}

return `
<div class="review-card" id="review-${ticketId}" data-rating="${existingRating || ""}">
  <div class="review-header">
    <div>
      <div class="ticket-id">#${ticketId}</div>
      <div class="value">${safeHtml(ticket.aset)} - ${safeHtml(ticket.departemen)}</div>
    </div>
    <span class="status-done">Done</span>
  </div>

  <div class="review-body">
    <div class="meta-grid">
      <div>
        <div class="label">Tanggal Lapor</div>
        <div class="value">${formatTanggalIndonesia(ticket.tanggal)}</div>
      </div>
      <div>
        <div class="label">Tanggal Selesai</div>
        <div class="value">${formatTanggalIndonesia(ticket.done_at || ticket.update)}</div>
      </div>
      <div>
        <div class="label">Kategori</div>
        <div class="value">${safeHtml(ticket.kategori)}</div>
      </div>
      <div>
        <div class="label">Vendor</div>
        <div class="value">${safeHtml(ticket.vendor)}</div>
      </div>
    </div>

    <div class="label">Deskripsi Kerusakan</div>
    <div class="value">${safeHtml(ticket.deskripsi)}</div>

    <div class="label" style="margin-top:14px;">Rating</div>
    <div class="rating-row">${ratingButtons}</div>

    <label class="label" for="note-${ticketId}">Keterangan Review</label>
    <textarea id="note-${ticketId}" placeholder="Tulis keterangan review untuk laporan ini..."${disabledAttr}>${safeHtml(existingNote)}</textarea>

    ${reviewInfo}
    ${actionButton}
  </div>
</div>
`;
}

async function loadReviewTickets(){
const hasil = document.getElementById("hasil");
hasil.innerHTML = "<div class='loading-box'>Memuat laporan selesai...</div>";

try{
const response = await fetch(
API_URL +
"?action=reviewTickets" +
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
hasil.innerHTML = "<div class='empty-state'>Data review tidak bisa dimuat.</div>";
return;
}

const tickets = Array.isArray(data.tickets) ? data.tickets : [];

if(tickets.length === 0){
hasil.innerHTML = "<div class='empty-state'>Belum ada laporan berstatus Done yang bisa direview.</div>";
return;
}

tickets.sort(function(a,b){
return new Date(b.done_at || b.update || b.tanggal).getTime() - new Date(a.done_at || a.update || a.tanggal).getTime();
});

hasil.innerHTML = tickets.map(renderReviewCard).join("");
}catch(error){
console.error(error);
hasil.innerHTML = "<div class='empty-state'>Data review tidak bisa ditampilkan. Silakan hubungi admin.</div>";
}
}

async function submitReview(ticketId){
const card = document.getElementById("review-" + ticketId);
const button = document.getElementById("save-" + ticketId);
const noteInput = document.getElementById("note-" + ticketId);
const rating = Number(card ? card.dataset.rating : 0);
const note = noteInput ? noteInput.value.trim() : "";

if(!rating || rating < 1 || rating > 5){
alert("Pilih rating 1 sampai 5 terlebih dahulu.");
return;
}

if(!note){
alert("Keterangan review wajib diisi.");
return;
}

button.disabled = true;
const originalText = button.textContent;
button.textContent = "Menyimpan...";

try{
const formData = new FormData();
formData.append("action", "saveReview");
formData.append("token", localStorage.getItem("token") || "");
formData.append("ticket_id", ticketId);
formData.append("rating", String(rating));
formData.append("note", note);

const response = await fetch(API_URL, {
method:"POST",
body:formData
});

const result = await response.json();

if(result.session_expired){
alert("Session berakhir. Silakan login ulang.");
localStorage.clear();
window.location.href = "login.html";
return;
}

if(result.already_reviewed){
alert(result.message || "Review sudah pernah dikirim dan tidak bisa diubah.");
button.textContent = "Review Terkunci";
button.disabled = true;
return;
}

if(!result.success){
alert(result.message || "Review gagal disimpan.");
button.textContent = originalText;
button.disabled = false;
return;
}

button.classList.add("saved");
button.textContent = "Review Tersimpan";
setTimeout(function(){
loadReviewTickets();
}, 900);
}catch(error){
console.error(error);
alert("Review gagal disimpan. Silakan coba lagi.");
button.textContent = originalText;
button.disabled = false;
}
}

document.addEventListener("DOMContentLoaded", loadReviewTickets);
