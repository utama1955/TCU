// ========================================
// GLOBAL LOCK (ANTI DOUBLE SUBMIT)
// ========================================
let isProcessing = false;


// ========================================
// SANITASI INPUT
// ========================================
function cleanInput(text){
return text
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;");
}


// ========================================
// KOMPRES DAN UPLOAD FOTO KE CLOUDINARY
// ========================================
function compressFoto(file){
return new Promise(function(resolve, reject){
const reader = new FileReader();

reader.onload = function(event){
const img = new Image();

img.onload = function(){
const maxSize = 1280;
let width = img.width;
let height = img.height;

if(width > height && width > maxSize){
height = Math.round((height * maxSize) / width);
width = maxSize;
}else if(height > maxSize){
width = Math.round((width * maxSize) / height);
height = maxSize;
}

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, width, height);
ctx.drawImage(img, 0, 0, width, height);

canvas.toBlob(function(blob){
if(!blob){
reject(new Error("Gagal kompres foto"));
return;
}

const compressedFile = new File(
[blob],
file.name.replace(/\.[^.]+$/, "") + ".jpg",
{ type:"image/jpeg" }
);

resolve(compressedFile);
}, "image/jpeg", 0.7);
};

img.onerror = function(){
reject(new Error("Format foto tidak bisa diproses"));
};

img.src = event.target.result;
};

reader.onerror = function(){
reject(new Error("Foto tidak bisa dibaca"));
};

reader.readAsDataURL(file);
});
}

async function uploadFoto(file){

if(!file) return null;

const compressedFile = await compressFoto(file);
const formData = new FormData();
formData.append("file", compressedFile);
formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

try{

const response = await fetch(CLOUDINARY_URL,{
method:"POST",
body:formData
});

const data = await response.json();

if(!data.secure_url){
return null;
}

return data.secure_url;

}catch(error){
return null;
}

}


// ========================================
// KIRIM LAPORAN
// ========================================
async function kirimLaporan(){

if(isProcessing) return;
isProcessing = true;

const btn = document.getElementById("btnKirim");
const hasil = document.getElementById("hasil");

btn.disabled = true;
btn.innerText = "Memproses...";

try{

// =============================
// AMBIL DATA FORM
// =============================
const nama = document.getElementById("nama").value.trim();
const cabang = document.getElementById("cabang").value.trim();
const aset = document.getElementById("aset").value.trim();
const kategori = document.getElementById("kategori").value;
const deskripsi = document.getElementById("deskripsi").value.trim();
const files = Array.from(document.getElementById("foto").files || []);


// =============================
// VALIDASI WAJIB
// =============================
if(!nama || !cabang || !aset || !kategori || !deskripsi){
alert("Semua field wajib diisi");
return resetButton();
}

if(nama.length < 3){
alert("Nama minimal 3 karakter");
return resetButton();
}

if(deskripsi.length < 10){
alert("Deskripsi minimal 10 karakter");
return resetButton();
}

if(files.length < 1){
alert("Foto wajib diupload");
return resetButton();
}

if(files.length > 3){
alert("Upload maksimal 3 foto");
return resetButton();
}

const invalidFile = files.find(function(file){
return !file.type || file.type.indexOf("image/") !== 0;
});

if(invalidFile){
alert("File lampiran harus berupa foto/gambar");
return resetButton();
}


// =============================
// UPLOAD FOTO
// =============================
hasil.innerHTML = "Mengompres dan upload foto 1/" + files.length + "...";

const fotoURLs = [];

for(let i = 0; i < files.length; i++){
hasil.innerHTML = "Mengompres dan upload foto " + (i + 1) + "/" + files.length + "...";

const fotoURL = await uploadFoto(files[i]);

if(!fotoURL){
hasil.innerHTML = "<span style='color:red;'>Gagal upload foto</span>";
return resetButton();
}

fotoURLs.push(fotoURL);
}


// =============================
// KIRIM KE APPS SCRIPT
// =============================
hasil.innerHTML = "Mengirim laporan...";

const formData = new FormData();
formData.append("action","createTicket");
  formData.append("token", localStorage.getItem("token") || "");
formData.append("nama", cleanInput(nama));
formData.append("cabang", cleanInput(cabang));
formData.append("aset", cleanInput(aset));
formData.append("kategori", kategori);
formData.append("deskripsi", cleanInput(deskripsi));
formData.append("foto", JSON.stringify(fotoURLs));
formData.append("client_time", new Date().toISOString());

const response = await fetch(API_URL,{
method:"POST",
body:formData
});

const data = await response.json();

if(data.session_expired){
alert("Session berakhir. Silakan login ulang.");
localStorage.clear();
window.location.href = "login.html";
return;
}

// =============================
// HANDLE RESPONSE
// =============================
if(data.success){

// tampilkan modal sukses
document.getElementById("modalTicketID").innerText = data.ticket_id;
document.getElementById("successModal").style.display = "flex";

// reset form
document.getElementById("formLapor").reset();
hasil.innerHTML = "";

}else{

hasil.innerHTML = "<span style='color:red;'>Gagal kirim laporan</span>";

}

}catch(err){

hasil.innerHTML = "<span style='color:red;'>Terjadi kesalahan sistem</span>";
console.error(err);

}

resetButton();

}

// ========================================
// RESET BUTTON STATE
// ========================================
function resetButton(){
const btn = document.getElementById("btnKirim");
btn.disabled = false;
btn.innerText = "KIRIM LAPORAN";
isProcessing = false;
}


// ========================================
// TUTUP MODAL SUCCESS
// ========================================
function closeSuccessModal(){
document.getElementById("successModal").style.display = "none";
}
