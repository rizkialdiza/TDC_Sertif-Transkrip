// ===============================
// Short helper & utils
// ===============================
const $ = id => document.getElementById(id);

function safeGet(id) {
  const el = $(id);
  return el ? el.value : '';
}

function setVal(id, v) {
  const el = $(id);
  if (!el) return;
  el.value = v;
}

// ===============================
// Mini Loading Bar Control
// ===============================
function startMiniLoading() {
  const bar = $("miniLoadingBar");
  if (!bar) return;

  bar.style.transition = "none";
  bar.style.width = "0%";
  bar.style.opacity = "1";

  requestAnimationFrame(() => {
    bar.style.transition = "width 1.2s ease";
    bar.style.width = "80%";
  });
}

function finishMiniLoading() {
  const bar = $("miniLoadingBar");
  if (!bar) return;

  bar.style.transition = "width 0.3s ease";
  bar.style.width = "100%";

  setTimeout(() => {
    bar.style.opacity = "0";
  }, 350);
}

function stopMiniLoading() {
  const bar = $("miniLoadingBar");
  if (!bar) return;

  bar.style.transition = "width 0.2s ease";
  bar.style.width = "100%";

  setTimeout(() => {
    bar.style.opacity = "0";
  }, 250);
}

// ===============================
// Date formatting helpers
// ===============================
function formatDateInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTanggalInput(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

// ===============================
// Background mapping
// ===============================
const bgNameToKey = {
  "Renault K-440": "renault",
  "Terex TR 100A": "terex",
  "OHT CAT 777E": "cat",
  "VOLVO FMX 400": "volvo",
  "VOLVO FMX 420": "volvo420",
  "CAT 395": "cat395",
  "KOMATSU PC 1250": "pc1250",
  "KOMATSU D375a-6R": "d375",
  "Motor Grader": "grader",
  "Komatsu HD 785-7" : "HD785",
  "HINO FM340 JD" : "hino340",
  "Hino Support" : "hinosupport",
  "Volvo Support" : "volvosupport",
  "WT Hino 500" : "wthino",
  "WT Volvo FMX 420" : "wtvolvo400",
  "WT Volvo FMX 400" : "wtvolvo420",

};
function updateBackground(unitName = '') {
  const value = (unitName || safeGet('Training_Name') || '').trim();

  const bg1 = $('bg1');
  const bg2 = $('bg2');
  if (!bg1 || !bg2) return;

  bg1.className = 'bg';
  bg2.className = 'bg';

  if (!value) return;

  const key = bgNameToKey[value];
  if (!key) return;

  const className = 'bg-' + key;
  bg1.classList.add(className);
  bg2.classList.add(className);
}

// ===============================
// Average & Preview update
// ===============================
function computeAvg() {
  const vals = [1, 2, 3, 4, 5, 6].map(i => {
    const v = Number($('n' + i).value);
    return isNaN(v) ? 0 : v;
  });
  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / 6;
  $('avg').value = sum ? avg.toFixed(2) : "";
  return { vals, avg };
}

function updatePreview() {
  const { vals, avg } = computeAvg();

  const no = safeGet('no_urut') || '-';
  const bln = safeGet('no_bulan') || '-';
  const thn = safeGet('no_tahun') || '-';

  $('p_no').innerText = `No. ${no}/Training/TDC.HRS.AGMBLOK4/${bln}/${thn}`;
  $('p_name').innerText = safeGet('nama') || '-';
  $('p_nrp').innerText = 'NRP : ' + (safeGet('nrp') || '-');

  const trainName = safeGet('Training_Name') ? safeGet('Training_Name').toUpperCase() : "";
  $('p_training').innerText = trainName ? ("UNIT " + trainName) : "";
  $('p_transkripname').innerText = trainName ? ("TRAINING EQUIVALENT UNIT " + trainName) : "";

  const tMulai = safeGet('tgl_mulai');
  const tAkhir = safeGet('tgl_akhir');
  const tTtd = safeGet('tgl_ttd');

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

  $('t_name').innerText = safeGet('nama') || '-';
  $('t_nrp').innerText = safeGet('nrp') || '-';

  for (let i = 1; i <= 6; i++) {
    $('t_n' + i).innerText = vals[i - 1] || '-';
  }

  $('t_avg').innerText = avg ? avg.toFixed(2) : '-';
  $('t_tglsign').innerText = tTtd ? formatDateInput(tTtd) : '-';

  const sectionHead = safeGet('section_head') || '';
  const instruktur = safeGet('Instruktur') || '';
  $('t_sectionhead').innerText = sectionHead ? sectionHead.toUpperCase() : '-';
  $('t_instruktur').innerText = instruktur ? instruktur.toUpperCase() : '-';
}

// ===============================
// PDF Download
// ===============================
async function initDownload() {
  const btn = $('downloadBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    updatePreview();
    updateBackground();

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const page1 = $('page1');
    page1.classList.add("export-pdf");
    const canvas1 = await html2canvas(page1, { scale: 2, useCORS: true });
    pdf.addImage(canvas1.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pageWidth, pageHeight);

    const page2 = $('page2');
    page2.classList.add("export-pdf");
    const canvas2 = await html2canvas(page2, { scale: 2, useCORS: true });
    pdf.addPage("a4", "landscape");
    pdf.addImage(canvas2.toDataURL("image/jpeg", 1.0), "JPEG", 0, 0, pageWidth, pageHeight);

    const filename = (safeGet('nama') || "sertifikat").replace(/\s+/g, '_') + ".pdf";
    pdf.save(filename);

    page1.classList.remove("export-pdf");
    page2.classList.remove("export-pdf");
  });
}

// ===============================
// Fetch from API URL
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbyN_xqkhwpbWeYEydt5Dfq5ttv3wemCI4XLcvbsHnalqqY9Ib2X5HglTXQ5vT1hBCs/exec";

function attachNoInputFetcher() {
  const noInput = $('no_input');
  if (!noInput) return;

  noInput.addEventListener('change', () => {
    const nomor = noInput.value;
    if (!nomor) return;

    startMiniLoading();

    fetch(`${API_URL}?nomor=${encodeURIComponent(nomor)}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {

        finishMiniLoading();

        if (data.error) {
          alert("Nomor tidak ditemukan!");
          return;
        }

        setVal('nama', data["Nama"] || "");
        setVal('nrp', data["NRP"] || "");
        setVal('no_urut', data["NO"] || "");
        setVal('no_bulan', data["Kode Bulan"] || "");
        setVal('no_tahun', data["Tahun"] || "");

        const unitText = data["Unit"] || "";
        setVal('Training_Name', unitText);
        updateBackground(unitText);

        setVal('tgl_mulai', formatTanggalInput(data["Tgl Training"]));
        setVal('tgl_akhir', formatTanggalInput(data["Tgl A. OJT Tanpa Pendampingan"]));

        setVal('n1', data["UK I"] || "");
        setVal('n2', data["UK II"] || "");
        setVal('n3', data["UK III"] || "");
        setVal('n4', data["UK IV"] || "");
        setVal('n5', data["UK V"] || "");
        setVal('n6', data["UK VI"] || "");
        setVal('avg', data["Nilai Akhir"] || "");

        const sh = data["Section Head"] || "";
        setVal('Instruktur', data["Asesor"] || "");
        if (sh) $('section_head').value = sh;

        updatePreview();
      })
      .catch(err => {
        console.error('fetch error', err);
        stopMiniLoading();
        alert('Terjadi kesalahan saat mengambil data.');
      });
  });
}

// ===============================
// Apps Script (google.script.run)
// ===============================
function cariData() {
  startMiniLoading();

  google.script.run
    .withSuccessHandler(function (res) {
      finishMiniLoading();
      console.log("DATA DITERIMA:", res);
    })
    .withFailureHandler(function (err) {
      console.error(err);
      stopMiniLoading();
    })
    .getDataFromSheet();
}

// ===============================
// event listener
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  attachNoInputFetcher();
  updateBackground(safeGet('Training_Name'));
  updatePreview();
  initDownload();
});

document.querySelectorAll("input, select").forEach(inp => {
  ["input", "change"].forEach(evt => {
    inp.addEventListener(evt, () => {
      updatePreview();
      if (inp.id === "Training_Name") {
        updateBackground(inp.value);
      }
    });
  });
});
