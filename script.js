let selectedFiles = [];

// फ़ाइल सेलेक्ट होने पर लिस्ट दिखाना
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  selectedFiles = files;
  const fileListDiv = document.getElementById('fileList');
  fileListDiv.innerHTML = '<strong>चुनी गई फ़ाइलें:</strong>';

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'p-2 bg-slate-100 rounded border border-slate-200 text-xs truncate';
    item.textContent = `${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    fileListDiv.appendChild(item);
  });

  // बटन इनेबल करें अगर 2 या उससे ज्यादा फ़ाइलें हों
  document.getElementById('mergeBtn').disabled = selectedFiles.length < 2;
  if(selectedFiles.length < 2) {
    document.getElementById('status').innerText = '⚠️ कम से कम 2 PDF फ़ाइलें चुनें!';
  } else {
    document.getElementById('status').innerText = '';
  }
}

// PDF Merge करने का मुख्य फंक्शन
async function mergePDFs() {
  const status = document.getElementById('status');
  const mergeBtn = document.getElementById('mergeBtn');
  
  try {
    mergeBtn.disabled = true;
    status.innerText = '⏳ PDF फ़ाइलों को जोड़ा जा रहा है, कृपया इंतज़ार करें...';

    // 1. नया खाली PDF डॉक्यूमेंट बनाएँ
    const mergedPdf = await PDFLib.PDFDocument.create();

    // 2. हर फ़ाइल को पढ़कर नए PDF में पेजेस जोड़ना
    for (const file of selectedFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // 3. फाइनल PDF की बाइट्स जनरेट करना
    const mergedPdfBytes = await mergedPdf.save();

    // 4. ऑटोमैटिक डाउनलोड ट्रिगर करना
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `merged_${Date.now()}.pdf`;
    link.click();

    status.innerText = '✅ PDF सफलतापूर्वक मर्ज होकर डाउनलोड हो गई है!';
  } catch (error) {
    console.error(error);
    status.innerText = '❌ PDF मर्ज करने में कोई खराबी आई। फ़ाइल चेक करें!';
  } finally {
    mergeBtn.disabled = false;
  }
}