// ===============================
//  HELPERS
// ===============================
const $ = id => document.getElementById(id);
function computeAvg() {
  const vals = [1,2,3,4,5,6].map(i => Number($('n'+i).value) || 0);
  const avg = vals.reduce((a,b)=>a+b,0) / 6;
  $('avg').value = avg ? avg.toFixed(2) : "";
  return { vals, avg };
}

function formatDateInput(dateStr){
  if(!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID',{
    day:'numeric',
    month:'long',
    year:'numeric'
  });
}

// ===============================
//  BACKGROUND MAP
// ===============================
const bgMap = {
  "renault": "Pic_Renault.png",
  "terex":   "Pic_Terex.png",
  "cat":     "PIC_OHT.png",
  "volvo":   "Pic_Volvo.png"
};

function updateBackground() {
  const egi = $('Training_Name').value;
  const bgUrl = bgMap[egi] || "";
  $('bg1').style.backgroundImage = `url('${bgUrl}')`;
  $('bg2').style.backgroundImage = `url('${bgUrl}')`;
}

// ===============================
//  UPDATE PREVIEW
// ===============================
function updatePreview() {
  const { vals, avg } = computeAvg();

  // Sertifikat
  const no  = $('no_urut').value || '-';
  const bln = $('no_bulan').value || '-';
  const thn = $('no_tahun').value || '-';

  $('p_no').innerText = `No. ${no}/Training/TDC.HRS.AGMBLOK4/${bln}/${thn}`;
  $('p_name').innerText = $('nama').value || '-';
  $('p_nrp').innerText  = 'NRP : ' + ($('nrp').value || '-');

  const train = $('Training_Name');
  const trainName = train.value ? train.options[train.selectedIndex].text.toUpperCase() : "";
  $('p_training').innerText = "UNIT " + trainName;
  $('p_transkripname').innerText =  "TRAINING EQUIVALENT UNIT " + trainName;

  const tMulai = $('tgl_mulai').value;
  const tAkhir = $('tgl_akhir').value;
  const tTtd   = $('tgl_ttd').value;

  if (tMulai && tAkhir) {
    $('p_dates').innerText =
      "Mulai tanggal " +
      formatDateInput(tMulai) +
      " s/d " +
      formatDateInput(tAkhir) +
      " di PT Hasnur Riung Sinergi Jobsite";
  } else {
    $('p_dates').innerText = "";
  }

  $('p_tglsign').innerText = tTtd ? "TAPIN, " + formatDateInput(tTtd) : "TAPIN, -";

  // Transkrip
  $('t_name').innerText = $('nama').value || '-';
  $('t_nrp').innerText  = $('nrp').value || '-';

  for (let i = 1; i <= 6; i++) {
    $('t_n'+i).innerText = vals[i-1] || '-';
  }

  $('t_avg').innerText      = avg ? avg.toFixed(2) : '-';
  $('t_tglsign').innerText  = tTtd ? formatDateInput(tTtd) : '-';

  const sectionHead = $('section_head').value || '';
  const instruktur  = $('Instruktur').value || '';
  $('t_sectionhead').innerText = sectionHead ? sectionHead.toUpperCase() : '-';
  $('t_instruktur').innerText  = instruktur ? instruktur.toUpperCase() : '-';

}

// ===============================
// EVENT LISTENERS
// ===============================
["n1","n2","n3","n4","n5","n6"].forEach(id => {
  $(id).addEventListener("input", () => {
    computeAvg();
    updatePreview();
  });
});

$("Training_Name").addEventListener("change", () => {
  updateBackground();
  updatePreview();
});

$("previewBtn").addEventListener("click", () => {
  updateBackground();
  updatePreview();
});

$("resetBtn").addEventListener("click", () => {
  $("form").reset();
  updateBackground();
  updatePreview();
});

// ===============================
//  DOWNLOAD PDF (FIXED)
// ===============================
document.getElementById("downloadBtn").addEventListener("click", async () => {

  updatePreview();
  updateBackground();

  // Pastikan jsPDF tersedia
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4"
  });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ---------------- PAGE 1 ----------------
  const page1 = document.getElementById("page1");
  page1.classList.add("export-pdf");  

  const canvas1 = await html2canvas(page1, {
    scale: 2,
    useCORS: true
  });

  const img1 = canvas1.toDataURL("image/jpeg", 1.0);
  pdf.addImage(img1, "JPEG", 0, 0, pageWidth, pageHeight);

  // ---------------- PAGE 2 ----------------
  const page2 = document.getElementById("page2");
  page2.classList.add("export-pdf");

  const canvas2 = await html2canvas(page2, {
    scale: 2,
    useCORS: true
  });

  const img2 = canvas2.toDataURL("image/jpeg", 1.0);

  pdf.addPage("a4", "landscape");
  pdf.addImage(img2, "JPEG", 0, 0, pageWidth, pageHeight);

  // ---------------- SAVE ----------------
  pdf.save((document.getElementById("nama").value || "sertifikat") + ".pdf");

  // Kembalikan scale preview
  page1.classList.remove("export-pdf");
  page2.classList.remove("export-pdf");
});


// INITIAL LOAD
updateBackground();
updatePreview();
