async function uploadFoto(file){

if(!file){
alert("Pilih foto terlebih dahulu");
return null;
}

const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

try{

const response = await fetch(
CLOUDINARY_URL,
{
method:"POST",
body:formData
}
);

const data = await response.json();

if(!data.secure_url){
return null;
}

return data.secure_url;

}catch(error){

alert("Upload foto gagal");
return null;

}

}

async function kirimLaporan(){

const nama =
document.getElementById("nama").value;

const cabang =
document.getElementById("cabang").value;

const aset =
document.getElementById("aset").value;

const kategori =
document.getElementById("kategori").value;

const deskripsi =
document.getElementById("deskripsi").value;

const file =
document.getElementById("foto").files[0];

if(!nama || !cabang || !aset || !kategori || !deskripsi){

alert("Semua field wajib diisi");

return;

}

document.getElementById("hasil").innerHTML =
"Upload foto...";

const fotoURL =
await uploadFoto(file);

if(!fotoURL){

document.getElementById("hasil").innerHTML =
"Gagal upload foto";

return;

}


const formData = new FormData();

formData.append("action","createTicket");
formData.append("nama", nama);
formData.append("cabang", cabang);
formData.append("aset", aset);
formData.append("kategori", kategori);
formData.append("deskripsi", deskripsi);
formData.append("foto", fotoURL);


document.getElementById("hasil").innerHTML =
"Mengirim laporan...";


fetch(API_URL, {

method:"POST",

body:formData

})

.then(res=>res.json())

.then(data=>{

if(data.success){

document.getElementById("hasil").innerHTML =

`
<span style="color:green;">
Laporan berhasil dikirim<br>
Ticket ID: <b>${data.ticket_id}</b>
</span>
`;

document.getElementById("formLapor").reset();

}else{

document.getElementById("hasil").innerHTML =
"Gagal kirim laporan";

}

})

.catch(err=>{

document.getElementById("hasil").innerHTML =
"Error koneksi server";

});

}
