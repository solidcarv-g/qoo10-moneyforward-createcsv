// Global variables
let uploadedFiles = {
    sellingreport: null,
    megawari: null,
    rcv: null
};

let convertedData = [];

// Initialize function - called from HTML onload
function initializeApp() {
    console.log('Initializing app...');
    
    // Make function globally available
    window.initializeApp = initializeApp;
    
    // Wait for Lucide to load
    let attempts = 0;
    const maxAttempts = 50;
    
    function tryInitialize() {
        attempts++;
        console.log(`Initialization attempt ${attempts}`);
        
        if (typeof lucide !== 'undefined') {
            console.log('Lucide loaded, creating icons...');
            try {
                lucide.createIcons();
                console.log('Icons created successfully');
            } catch (error) {
                console.error('Error creating icons:', error);
            }
            setupEventListeners();
        } else if (attempts < maxAttempts) {
            console.log('Lucide not ready, retrying...');
            setTimeout(tryInitialize, 100);
        } else {
            console.error('Lucide failed to load after maximum attempts');
            setupEventListeners(); // Continue without icons
        }
    }
    
    tryInitialize();
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab switching
    const converterTab = document.getElementById('converterTab');
    const readmeTab = document.getElementById('readmeTab');
    
    if (converterTab) {
        converterTab.addEventListener('click', () => showSection('converter'));
    }
    if (readmeTab) {
        readmeTab.addEventListener('click', () => showSection('readme'));
    }

    // File upload handlers
    setupFileUploads();

    // Convert button
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertData);
    }

    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResult);
    }
    
    console.log('Event listeners setup complete');
}

function showSection(section) {
    const converterSection = document.getElementById('converterSection');
    const readmeSection = document.getElementById('readmeSection');
    const converterTab = document.getElementById('converterTab');
    const readmeTab = document.getElementById('readmeTab');

    if (section === 'converter') {
        converterSection.classList.remove('hidden');
        readmeSection.classList.add('hidden');
        converterTab.classList.add('text-primary', 'border-b-2', 'border-primary');
        converterTab.classList.remove('text-gray-600');
        readmeTab.classList.add('text-gray-600');
        readmeTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
    } else {
        converterSection.classList.add('hidden');
        readmeSection.classList.remove('hidden');
        readmeTab.classList.add('text-primary', 'border-b-2', 'border-primary');
        readmeTab.classList.remove('text-gray-600');
        converterTab.classList.add('text-gray-600');
        converterTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
    }
}

function setupFileUploads() {
    console.log('Setting up file uploads...');
    const uploadAreas = document.querySelectorAll('.upload-area');
    console.log(`Found ${uploadAreas.length} upload areas`);
    
    uploadAreas.forEach(area => {
        const fileType = area.getAttribute('data-file-type');
        const fileInput = area.querySelector(`[data-file-input="${fileType}"]`);
        
        // Click to upload
        area.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('border-primary', 'bg-blue-50');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('border-primary', 'bg-blue-50');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('border-primary', 'bg-blue-50');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0], fileType, area);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0], fileType, area);
            }
        });
    });
}

function handleFileUpload(file, fileType, area) {
    console.log(`Handling file upload: ${file.name} (${fileType})`);
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('CSVファイルを選択してください。');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedFiles[fileType] = {
            name: file.name,
            content: e.target.result
        };
        
        // Update UI
        const uploadDiv = area.querySelector('.mb-4');
        const statusDiv = area.querySelector('.upload-status');
        
        uploadDiv.classList.add('hidden');
        statusDiv.classList.remove('hidden');
        
        area.classList.remove('border-gray-300');
        area.classList.add('border-green-300', 'bg-green-50');
        
        checkConvertButtonState();
    };
    
    reader.readAsText(file, 'Shift_JIS');
}

function checkConvertButtonState() {
    const convertBtn = document.getElementById('convertBtn');
    if (!convertBtn) return;
    
    const hasAnyFile = Object.values(uploadedFiles).some(file => file !== null);
    
    convertBtn.disabled = !hasAnyFile;
    console.log(`Convert button state: ${hasAnyFile ? 'enabled' : 'disabled'}`);
}

function showProgress(show, text = '', progress = 0) {
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (show) {
        progressSection.classList.remove('hidden');
        progressBar.style.width = progress + '%';
        progressText.textContent = text;
    } else {
        progressSection.classList.add('hidden');
    }
}

function convertData() {
    console.log('Starting data conversion...');
    showProgress(true, 'データ変換を開始しています...', 10);
    convertedData = [];
    
    setTimeout(() => {
        try {
            // Process sellingreport.csv
            if (uploadedFiles.sellingreport) {
                console.log('Processing sellingreport.csv...');
                showProgress(true, 'sellingreport.csvを処理中...', 30);
                processSellingReport(uploadedFiles.sellingreport.content);
            }
            
            // Process RecvMegawari.csv
            if (uploadedFiles.megawari) {
                console.log('Processing RecvMegawari.csv...');
                showProgress(true, 'RecvMegawari.csvを処理中...', 60);
                processMegawari(uploadedFiles.megawari.content);
            }
            
            // Process rcv.csv
            if (uploadedFiles.rcv) {
                console.log('Processing rcv.csv...');
                showProgress(true, 'rcv.csvを処理中...', 80);
                processRcv(uploadedFiles.rcv.content);
            }
            
            console.log(`Conversion complete. Generated ${convertedData.length} entries.`);
            showProgress(true, '変換完了！', 100);
            
            setTimeout(() => {
                showProgress(false);
                displayResults();
            }, 1000);
            
        } catch (error) {
            console.error('Conversion error:', error);
            showProgress(false);
            alert('データ変換中にエラーが発生しました: ' + error.message);
        }
    }, 500);
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            // Simple CSV parsing (handles quoted fields)
            const fields = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    fields.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            fields.push(current.trim());
            result.push(fields);
        }
    }
    
    return result;
}

function processSellingReport(csvContent) {
    const data = parseCSV(csvContent);
    const header = data[0];
    
    // Find column indices
    const dateCol = 10; // K列 (発送日)
    const reasonCol = 1; // B列
    const productCol = 7; // H列 (商品名)
    const amountCol = 14; // O列 (商品決済金)
    const feeCol = 19; // T列 (Qoo10サービス利用料)
    const megaCol = 34; // AI列 (メガワリ/メガポ補償金)
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length < 35) continue;
        
        const date = formatDate(row[dateCol]);
        const reason = row[reasonCol]?.replace(/["\uFF02]/g, '') || '';
        const productName = row[productCol]?.replace(/["\uFF02]/g, '') || '';
        const amount = parseFloat(row[amountCol]?.replace(/[",]/g, '') || '0');
        const fee = parseFloat(row[feeCol]?.replace(/[",]/g, '') || '0');
        const megaAmount = parseFloat(row[megaCol]?.replace(/[",]/g, '') || '0');
        
        if (!date) continue;
        
        // 摘要を作成（発生の理由）
        let description = reason || '売上';
        
        // キャンセル判定（金額がマイナスまたは理由にキャンセルが含まれる）
        const isCancel = amount < 0 || 
                        reason.includes('キャンセル') || 
                        reason.includes('ｷｬﾝｾﾙ') || 
                        reason.includes('キャンセル') ||
                        reason.toLowerCase().includes('cancel');
        
        // 売上高の処理
        if (amount !== 0) {
            const absAmount = Math.abs(amount);
            if (isCancel) {
                // キャンセル時の仕訳（借方・貸方を逆転）
                convertedData.push({
                    date: date,
                    debitAccount: '売上高',
                    debitAmount: absAmount,
                    creditAccount: '売掛金',
                    creditAmount: absAmount,
                    description: description,
                    memo: productName
                });
            } else {
                // 通常の売上
                convertedData.push({
                    date: date,
                    debitAccount: '売掛金',
                    debitAmount: absAmount,
                    creditAccount: '売上高',
                    creditAmount: absAmount,
                    description: description,
                    memo: productName
                });
            }
        }
        
        // メガワリ/メガポ補償金の処理
        if (megaAmount !== 0) {
            const absMegaAmount = Math.abs(megaAmount);
            convertedData.push({
                date: date,
                debitAccount: '売掛金',
                debitAmount: absMegaAmount,
                creditAccount: '売上高',
                creditAmount: absMegaAmount,
                description: 'メガワリ/メガポ補償金',
                memo: productName
            });
        }
        
        // 販売手数料の処理（個別に処理、税込み計算）
        if (fee !== 0) {
            const absFee = Math.abs(fee);
            const taxIncludedFee = Math.round(absFee * 1.1); // 税込み計算
            
            if (fee < 0) {
                // マイナスの場合：借方を売掛金、貸方を販売手数料
                convertedData.push({
                    date: date,
                    debitAccount: '売掛金',
                    debitAmount: taxIncludedFee,
                    creditAccount: '販売手数料',
                    creditAmount: taxIncludedFee,
                    description: 'Qoo10サービス利用料（返金）',
                    memo: productName
                });
            } else {
                // プラスの場合：通常の処理
                convertedData.push({
                    date: date,
                    debitAccount: '販売手数料',
                    debitAmount: taxIncludedFee,
                    creditAccount: '売掛金',
                    creditAmount: taxIncludedFee,
                    description: 'Qoo10サービス利用料',
                    memo: productName
                });
            }
        }
    }
}

function processMegawari(csvContent) {
    const data = parseCSV(csvContent);
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length < 4) continue;
        
        const date = formatDate(row[0]);
        const description = row[1]?.replace(/["\uFF02]/g, '') || '';
        const amount = parseFloat(row[3]?.replace(/[",]/g, '') || '0');
        
        if (date && amount !== 0) {
            const absAmount = Math.abs(amount);
            
            if (amount < 0) {
                // マイナスの場合：借方を売掛金、貸方を販売手数料
                convertedData.push({
                    date: date,
                    debitAccount: '売掛金',
                    debitAmount: absAmount,
                    creditAccount: '販売手数料',
                    creditAmount: absAmount,
                    description: description || 'メガワリ関連手数料（返金）',
                    memo: ''
                });
            } else {
                // プラスの場合：通常の処理
                convertedData.push({
                    date: date,
                    debitAccount: '販売手数料',
                    debitAmount: absAmount,
                    creditAccount: '売掛金',
                    creditAmount: absAmount,
                    description: description || 'メガワリ関連手数料',
                    memo: ''
                });
            }
        }
    }
}

function processRcv(csvContent) {
    const data = parseCSV(csvContent);
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length < 4) continue;
        
        const date = formatDate(row[0]);
        const description = row[1]?.replace(/["\uFF02]/g, '') || '';
        const amount = parseFloat(row[3]?.replace(/[",]/g, '') || '0');
        
        if (date && amount !== 0) {
            const absAmount = Math.abs(amount);
            
            if (amount < 0) {
                // マイナスの場合：借方を売掛金、貸方を販売手数料
                convertedData.push({
                    date: date,
                    debitAccount: '売掛金',
                    debitAmount: absAmount,
                    creditAccount: '販売手数料',
                    creditAmount: absAmount,
                    description: description || '入金関連手数料（返金）',
                    memo: ''
                });
            } else {
                // プラスの場合：通常の処理
                convertedData.push({
                    date: date,
                    debitAccount: '販売手数料',
                    debitAmount: absAmount,
                    creditAccount: '売掛金',
                    creditAmount: absAmount,
                    description: description || '入金関連手数料',
                    memo: ''
                });
            }
        }
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    
    // Remove quotes and clean up
    dateStr = dateStr.replace(/["\uFF02]/g, '').trim();
    
    // Handle different date formats
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } else if (dateStr.includes('／')) {
        const parts = dateStr.split('／');
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    
    return dateStr;
}

function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    const tableBody = document.getElementById('resultsTableBody');
    
    // Sort by date
    convertedData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Clear previous results
    tableBody.innerHTML = '';
    
    // Add data to table
    convertedData.forEach(entry => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-gray-900">${entry.date}</td>
            <td class="px-4 py-3 text-gray-700">${entry.debitAccount}</td>
            <td class="px-4 py-3 text-gray-900 font-medium">${entry.debitAmount.toLocaleString()}</td>
            <td class="px-4 py-3 text-gray-700">${entry.creditAccount}</td>
            <td class="px-4 py-3 text-gray-900 font-medium">${entry.creditAmount.toLocaleString()}</td>
            <td class="px-4 py-3 text-gray-600 text-sm">${entry.description}</td>
        `;
        tableBody.appendChild(row);
    });
    
    resultsSection.classList.remove('hidden');
}

function downloadResult() {
    console.log('Starting download...');
    
    if (convertedData.length === 0) {
        alert('変換するデータがありません。');
        return;
    }
    
    // Create CSV content with Windows line endings (CR+LF)
    let csvContent = '取引日,借方勘定科目,借方補助科目,借方部門,借方金額,借方税区分,貸方勘定科目,貸方補助科目,貸方部門,貸方金額,貸方税区分,摘要,仕訳メモ,タグ,MF仕訳タイプ,決算整理仕訳,作成日時,作成者,最終更新日時,最終更新者\r\n';
    
    convertedData.forEach(entry => {
        const row = [
            entry.date,
            entry.debitAccount,
            '', // 借方補助科目
            '', // 借方部門
            entry.debitAmount,
            '', // 借方税区分
            entry.creditAccount,
            '', // 貸方補助科目
            '', // 貸方部門
            entry.creditAmount,
            '', // 貸方税区分
            entry.description,
            entry.memo || '', // 仕訳メモ
            '', // タグ
            '', // MF仕訳タイプ
            '', // 決算整理仕訳
            '', // 作成日時
            '', // 作成者
            '', // 最終更新日時
            ''  // 最終更新者
        ];
        csvContent += row.join(',') + '\r\n';
    });
    
    // Shift-JIS変換関数
    // UTF-8 with BOMでダウンロード（ExcelでShift-JISとして認識される）
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8' 
    });
    
    downloadBlob(blob, 'journal.csv');
    console.log('Download initiated');
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}