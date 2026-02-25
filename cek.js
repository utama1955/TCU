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


// ================================
// GLOBAL LOCK (ANTI DOUBLE CLICK)
// ================================
let isChecking = false;


// ================================
// CEK STATUS (PRODUCTION VERSION)
// ================================
async function cekStatus(){

if(isChecking) return;
isChecking = true;

const hasil = document.getElementById("hasil");
const ticket = document.getElementById("ticket").value.trim();

if(!ticket){

alert("Masukkan Ticket ID");
isChecking = false;
return;

}

hasil.innerHTML = "Mencari data...";

try{

const response = await fetch(
API_URL + "?action=get&ticket_id=" + encodeURIComponent(ticket)
);

const data = await response.json();
console.log("DATA DARI BACKEND:", data);
if(!data || data.success === false){

hasil.innerHTML = "<span style='color:red;'>Ticket tidak ditemukan</span>";
isChecking = false;
return;

}


// ================================
// STATUS CLASS
// ================================
let statusText = data.status || "Waiting";
let statusClass = "status-open";

if(statusText === "On Progress")
statusClass = "status-progress";

if(statusText === "Done")
statusClass = "status-done";

// ================================
// RENDER DATA
// ================================
hasil.innerHTML = `
<div class="label">Ticket ID:</div>
<div class="value">${ticket}</div>

<div class="label">Tanggal Lapor:</div>
<div class="value">${formatTanggalIndonesia(data.tanggal)}</div>

<div class="label">Nama Pelapor:</div>
<div class="value">${data.nama || "-"}</div>

<div class="label">Cabang:</div>
<div class="value">${data.departemen || "-"}</div>

<div class="label">Nama Aset:</div>
<div class="value">${data.aset || "-"}</div>


<div class="label">Status:</div>
<div class="value ${statusClass}">
${statusText}
</div>

<div class="label">Catatan GA:</div>
<div class="value">${data.catatan || "-"}</div>

<div class="label">Vendor:</div>
<div class="value">
${
data.vendor && data.vendor.trim() !== ""
? data.vendor
: "-"
}
</div>

<div class="label">Estimasi Selesai:</div>
<div class="value">${data.estimasi || "-"}</div>

<div class="label">Foto Pelaporan:</div>
<div class="value">
${
data.foto
? `<img src="${data.foto}" alt="Foto Laporan">`
: "-"
}
</div>
`;

}catch(err){

hasil.innerHTML = "<span style='color:red;'>Error koneksi server</span>";
console.error(err);

}

isChecking = false;

}
