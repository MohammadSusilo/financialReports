const API="https://script.google.com/macros/s/AKfycbwJ4ZKsY2c09LdDUOh1H0U7mnTouFJeP6vu9hQoRF77yjyQgLCswodQ9rHmziuKqvDw/exec"

let allData=[]

const kategori=[
"Makan","Transport","Listrik","Air",
"Internet","Sekolah","Belanja","Gaji","Bonus"
]

function loadKategori(){

let select=document.getElementById("kategori")

kategori.forEach(k=>{

let opt=document.createElement("option")
opt.value=k
opt.textContent=k

select.appendChild(opt)

})

}

function formatTanggal(tanggal){

let t=new Date(tanggal)

const bulan=[
"Januari","Februari","Maret","April","Mei","Juni",
"Juli","Agustus","September","Oktober","November","Desember"
]

let hari=String(t.getDate()).padStart(2,"0")
let bln=bulan[t.getMonth()]
let thn=t.getFullYear()

return `${hari} ${bln} ${thn}`

}

async function loadData(){

let res=await fetch(API)

let data=await res.json()

allData=data

renderTable(data)
dashboard(data)
grafik(data)

}

function renderTable(data){

let tbody=document.getElementById("tabel")

tbody.innerHTML=""

data.forEach(d=>{

tbody.innerHTML+=`
<tr>
<td>${formatTanggal(d[0])}</td>
<td>${d[2]}</td>
<td>${d[4]}</td>
<td>${d[5]}</td>
<td>${d[6]}</td>
</tr>
`

})

}

function dashboard(data){

    let totalMasuk = 0
    let totalKeluar = 0
    
    data.forEach(d=>{
    
    if(String(d[4]).toLowerCase()=="pemasukan")
    totalMasuk += Number(d[5])
    
    if(String(d[4]).toLowerCase()=="pengeluaran")
    totalKeluar += Number(d[5])
    
    })
    
    document.getElementById("saldo").innerText =
    formatRupiah(totalMasuk-totalKeluar)
    
    document.getElementById("masuk").innerText =
    formatRupiah(totalMasuk)
    
    document.getElementById("keluar").innerText =
    formatRupiah(totalKeluar)
    
    }

    function formatRupiah(n){

        return "Rp " + Number(n).toLocaleString("id-ID")
        
        }

        function grafik(data){

            let pengeluaranBulanan={}
            let pemasukanBulanan={}
            
            let totalMasuk=0
            let totalKeluar=0
            
            data.forEach(d=>{
            
            let bulan=d[1]
            let jumlah=Number(d[5])
            
            if(d[4]=="Pengeluaran"){
            
            if(!pengeluaranBulanan[bulan])
            pengeluaranBulanan[bulan]=0
            
            pengeluaranBulanan[bulan]+=jumlah
            totalKeluar+=jumlah
            
            }
            
            if(d[4]=="Pemasukan"){
            
            if(!pemasukanBulanan[bulan])
            pemasukanBulanan[bulan]=0
            
            pemasukanBulanan[bulan]+=jumlah
            totalMasuk+=jumlah
            
            }
            
            })
            
            /* ===== Grafik Pengeluaran ===== */
            
            new Chart(document.getElementById("chartPengeluaran"),{
            
            type:"bar",
            
            data:{
            labels:Object.keys(pengeluaranBulanan),
            datasets:[{
            label:"Pengeluaran",
            data:Object.values(pengeluaranBulanan),
            backgroundColor:["#e74c3c"]
            }]
            }
            
            })
            
            /* ===== Grafik Pemasukan ===== */
            
            new Chart(document.getElementById("chartPemasukan"),{
            
            type:"bar",
            
            data:{
            labels:Object.keys(pemasukanBulanan),
            datasets:[{
            label:"Pemasukan",
            data:Object.values(pemasukanBulanan),
            backgroundColor:["#2ecc71"]
            }]
            }
            
            })
            
            /* ===== Pie Chart Perbandingan ===== */
            
            new Chart(document.getElementById("chartPie"),{
            
            type:"pie",
            
            data:{
            labels:["Pemasukan","Pengeluaran"],
            datasets:[{
            data:[totalMasuk,totalKeluar],
            backgroundColor:["#2ecc71","#e74c3c"]
            }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,
                plugins:{
                legend:{
                position:"bottom"
                }
                }
            }
            
            })
            
            }

async function simpan(){

await fetch(API,{
method:"POST",
body:JSON.stringify({

action:"add",
tanggal:tanggal.value,
kategori:kategori.value,
deskripsi:deskripsi.value,
tipe:tipe.value,
jumlah:jumlah.value,
user:localStorage.getItem("user")

})
})

clearForm()
loadData()

}

function clearForm(){

tanggal.value=""
deskripsi.value=""
jumlah.value=""

kategori.selectedIndex=0
tipe.selectedIndex=0

}

function filterBulan(){

let bulan=filterBulan.value

let hasil=allData.filter(d=>d[1]==bulan)

renderTable(hasil)

}

function search(k){

let hasil=allData.filter(d=>
d.join("").toLowerCase().includes(k.toLowerCase())
)

renderTable(hasil)

}

function exportPDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

let y=20

doc.text("Laporan Keuangan",20,10)

allData.forEach(d=>{

doc.text(`${d[0]} ${d[2]} ${d[4]} ${d[5]}`,20,y)

y+=10

})

doc.save("laporan.pdf")

}

function logout(){

localStorage.clear()
window.location="login.html"

}

if(!localStorage.getItem("user")){

window.location="login.html"

}

loadKategori()
loadData()