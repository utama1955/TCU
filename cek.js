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

function cekStatus(){

const ticket =
document.getElementById("ticket").value.trim();

if(!ticket){

alert("Masukkan Ticket ID");

return;

}

document.getElementById("hasil").innerHTML="Loading...";

fetch(API_URL+"?action=list")

.then(res=>res.json())

.then(data=>{

console.log(data);

const found =
data.find(item => item.id === ticket);

if(!found){

document.getElementById("hasil").innerHTML=
"Ticket tidak ditemukan";

return;

}

let statusClass="status-open";

let statusText="Waiting";

if(statusText=="On Progress")
statusClass="status-progress";

if(statusText=="Done")
statusClass="status-done";


document.getElementById("hasil").innerHTML=

`
<div class="label">Ticket ID:</div>
<div class="value">${found.id}</div>

<div class="label">Nama Pelapor:</div>
<div class="value">${found.nama}</div>

<div class="label">Cabang:</div>
<div class="value">${found.departemen}</div>

<div class="label">Kategori Aset:</div>
<div class="value">${found.aset}</div>

<div class="label">Status:</div>
<div class="value ${found.status}"></div>

<div class="label">Foto Kerusakan:</div>
<img src="${found.foto}">
`;

})

.catch(err=>{

document.getElementById("hasil").innerHTML=
"Error koneksi server";

console.error(err);

});

}
