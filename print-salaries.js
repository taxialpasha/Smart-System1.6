/**
 * print-salaries.js
 * إضافة وظيفة طباعة سجلات الرواتب
 */

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر الطباعة في صفحة سجلات الرواتب
    addPrintSalariesButton();

    // إضافة أنماط CSS للطباعة
    addPrintStyles();
});

/**
 * إضافة زر الطباعة في صفحة سجلات الرواتب
 */
function addPrintSalariesButton() {
    // البحث عن الزر الموجود للتصدير في صفحة الرواتب
    const exportButton = document.querySelector('button[title="تصدير"]');
    if (!exportButton) {
        // محاولة العثور على زر التصدير بطريقة بديلة
        const exportBtn = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('تصدير') || 
            btn.innerHTML.includes('تصدير') || 
            btn.querySelector('i.fa-download')
        );
        
        if (!exportBtn) {
            console.warn('لم يتم العثور على زر التصدير في صفحة الرواتب');
            setTimeout(addPrintSalariesButton, 1000); // محاولة مرة أخرى بعد ثانية
            return;
        }
    }
    
    // التحقق من عدم وجود الزر مسبقاً
    if (document.getElementById('print-all-salaries-btn')) return;
    
    // محاولة العثور على حاوية الأزرار
    let actionsContainer = exportButton ? exportButton.parentNode : document.querySelector('.section-actions');
    if (!actionsContainer) {
        actionsContainer = document.querySelector('div.flex, div.btn-group, div.actions');
    }
    
    if (!actionsContainer) {
        console.warn('لم يتم العثور على حاوية الإجراءات في صفحة الرواتب');
        return;
    }
    
    // إنشاء زر الطباعة
    const printButton = document.createElement('button');
    printButton.className = exportButton ? exportButton.className : 'btn btn-outline btn-sm';
    printButton.id = 'print-all-salaries-btn';
    printButton.setAttribute('title', 'طباعة');
    printButton.innerHTML = '<i class="fas fa-print"></i><span>طباعة</span>';
    
    // إضافة الزر بعد زر التصدير
    if (exportButton) {
        actionsContainer.insertBefore(printButton, exportButton.nextSibling);
    } else {
        actionsContainer.appendChild(printButton);
    }
    
    // إضافة مستمع حدث للزر
    printButton.addEventListener('click', printAllSalaries);
    
    console.log('تم إضافة زر الطباعة بنجاح');
}

/**
 * إضافة أنماط CSS للطباعة
 */
function addPrintStyles() {
    // التحقق من عدم وجود الأنماط مسبقاً
    if (document.getElementById('print-salaries-styles')) return;
    
    // إنشاء عنصر نمط
    const styleElement = document.createElement('style');
    styleElement.id = 'print-salaries-styles';
    
    // إضافة أنماط CSS للطباعة
    styleElement.textContent = `
        /* أنماط عنصر الطباعة عند عرضه */
        #print-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
            overflow: auto;
            padding: 20px;
            box-sizing: border-box;
            direction: rtl;
        }
        
        .print-close-btn {
            position: fixed;
            top: 10px;
            left: 10px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        /* أنماط محتوى الطباعة */
        .print-section {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
        }
        
        .print-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .print-header h2 {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .print-date {
            text-align: left;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .print-table th, .print-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
        }
        
        .print-table th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .print-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .print-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        
        .print-table .text-center {
            text-align: center;
        }
        
        .print-table .text-start {
            text-align: right;
        }
        
        .print-table .text-end {
            text-align: left;
        }
        
        .print-table .fw-bold {
            font-weight: bold;
        }
        
        /* أنماط خاصة بالطباعة من المتصفح */
        @media print {
            body * {
                visibility: hidden;
            }
            
            .print-section, .print-section * {
                visibility: visible;
            }
            
            .print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
            }
            
            .print-close-btn {
                display: none;
            }
            
            /* تكرار ترويسة الجدول في كل صفحة */
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            
            /* إعدادات الصفحة */
            @page {
                margin: 1.5cm;
                size: portrait;
            }
        }
    `;
    
    // إضافة عنصر النمط إلى الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط الطباعة بنجاح');
}

/**
 * طباعة جميع سجلات الرواتب
 */
function printAllSalaries() {
    console.log('بدء عملية طباعة الرواتب');
    
    // البحث عن جدول الرواتب
    let salaryTable = document.querySelector('table#salary-transactions-table'); 
    
    // في حالة عدم العثور على الجدول بالمعرف، نبحث عن أي جدول في الصفحة النشطة
    if (!salaryTable) {
        // البحث عن التبويب النشط
        const activeTab = document.querySelector('.tab-content.active, .page.active, .tab.active, div[role="tabpanel"].active');
        if (activeTab) {
            salaryTable = activeTab.querySelector('table');
        }
        
        // إذا لم نجد أي جدول في التبويب النشط، نبحث في الصفحة بالكامل
        if (!salaryTable) {
            // البحث عن أي جدول في الصفحة مرئي حاليًا
            const allTables = document.querySelectorAll('table');
            for (const table of allTables) {
                const style = window.getComputedStyle(table);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    salaryTable = table;
                    break;
                }
            }
        }
    }
    
    if (!salaryTable) {
        console.error('لم يتم العثور على جدول الرواتب');
        alert('لم يتم العثور على جدول الرواتب');
        return;
    }
    
    console.log('تم العثور على جدول الرواتب:', salaryTable);
    
    // إنشاء عنصر حاوية للطباعة
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    
    // إضافة زر إغلاق
    const closeButton = document.createElement('button');
    closeButton.className = 'print-close-btn';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(printContainer);
    });
    printContainer.appendChild(closeButton);
    
    // إنشاء قسم الطباعة
    const printSection = document.createElement('div');
    printSection.className = 'print-section';
    
    // إضافة ترويسة الطباعة
    const header = document.createElement('div');
    header.className = 'print-header';
    header.innerHTML = `
        <h1>نظام الاستثمار المتكامل</h1>
        <h2>سجل الرواتب المدفوعة</h2>
    `;
    printSection.appendChild(header);
    
    // إضافة التاريخ
    const dateElement = document.createElement('div');
    dateElement.className = 'print-date';
    const currentDate = new Date();
    dateElement.textContent = `تاريخ الطباعة: ${currentDate.toLocaleDateString('ar-IQ')} - ${currentDate.toLocaleTimeString('ar-IQ')}`;
    printSection.appendChild(dateElement);
    
    // نسخ محتوى جدول الرواتب
    const printTable = document.createElement('table');
    printTable.className = 'print-table';
    
    // إنشاء ترويسة الجدول
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // إضافة عمود ترقيم
    const indexHeader = document.createElement('th');
    indexHeader.textContent = '#';
    headerRow.appendChild(indexHeader);
    
    // استخراج العناوين من الجدول الأصلي
    const originalHeaders = salaryTable.querySelectorAll('th');
    originalHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.textContent;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    printTable.appendChild(thead);
    
    // إنشاء جسم الجدول
    const tbody = document.createElement('tbody');
    
    // استخراج الصفوف من الجدول الأصلي
    const originalRows = salaryTable.querySelectorAll('tbody tr');
    let rowIndex = 1;
    
    // حساب الإجماليات
    let totals = {};
    
    originalRows.forEach(row => {
        const printRow = document.createElement('tr');
        
        // إضافة خلية ترقيم
        const indexCell = document.createElement('td');
        indexCell.textContent = rowIndex++;
        indexCell.className = 'text-center';
        printRow.appendChild(indexCell);
        
        // استخراج البيانات من كل خلية
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, cellIndex) => {
            const printCell = document.createElement('td');
            
            // استخراج النص من الخلية
            let cellContent = cell.textContent.trim();
            
            // إذا كانت الخلية تحتوي على أزرار، نضع فقط النص
            if (cell.querySelector('button, a, i.fas, i.far, i.fa, svg')) {
                // نتجاهل الخلية التي تحتوي فقط على أزرار
                if (cellContent === '') {
                    printCell.innerHTML = '&nbsp;';
                }
            } else {
                printCell.textContent = cellContent;
                
                // حساب الإجماليات للخلايا التي تحتوي على قيم عددية
                if (cellContent.includes('دينار') || /\d+/.test(cellContent)) {
                    const cellNumber = extractNumber(cellContent);
                    if (!isNaN(cellNumber)) {
                        totals[cellIndex] = (totals[cellIndex] || 0) + cellNumber;
                    }
                }
            }
            
            printRow.appendChild(printCell);
        });
        
        tbody.appendChild(printRow);
    });
    
    printTable.appendChild(tbody);
    
    // إضافة صف الإجماليات (إذا كان هناك بيانات)
    if (Object.keys(totals).length > 0) {
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        
        // خلية الترقيم
        const indexFooter = document.createElement('td');
        indexFooter.innerHTML = '&nbsp;';
        totalRow.appendChild(indexFooter);
        
        // مرور على كل الأعمدة وإضافة الإجماليات
        originalHeaders.forEach((_, columnIndex) => {
            const td = document.createElement('td');
            
            if (columnIndex === 0) {
                td.textContent = 'الإجمالي';
                td.className = 'fw-bold';
            } else if (totals[columnIndex]) {
                td.textContent = formatCurrency(totals[columnIndex]);
                td.className = 'fw-bold';
            } else {
                td.innerHTML = '&nbsp;';
            }
            
            totalRow.appendChild(td);
        });
        
        tfoot.appendChild(totalRow);
        printTable.appendChild(tfoot);
    }
    
    printSection.appendChild(printTable);
    
    // إضافة تذييل الصفحة
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = 'جميع الحقوق محفوظة © نظام الاستثمار المتكامل ' + new Date().getFullYear();
    printSection.appendChild(footer);
    
    // إضافة قسم الطباعة إلى الحاوية
    printContainer.appendChild(printSection);
    
    // إضافة الحاوية إلى الصفحة
    document.body.appendChild(printContainer);
    
    // إضافة زر طباعة في قسم الطباعة
    const printButton = document.createElement('button');
    printButton.className = 'btn btn-primary';
    printButton.style.position = 'fixed';
    printButton.style.bottom = '20px';
    printButton.style.right = '20px';
    printButton.innerHTML = '<i class="fas fa-print"></i> طباعة';
    printButton.addEventListener('click', () => {
        window.print();
    });
    printSection.appendChild(printButton);
    
    console.log('تم إعداد صفحة الطباعة بنجاح');
}

/**
 * استخراج الرقم من النص
 * @param {string} text - النص المحتوي على الرقم
 * @returns {number} - الرقم المستخرج
 */
function extractNumber(text) {
    if (!text) return 0;
    
    // استخراج الأرقام من النص (إزالة الفواصل والعملة)
    text = text.replace(/,/g, '');
    
    // استخراج الرقم مع مراعاة الأرقام السالبة
    const matches = text.match(/-?\d+(\.\d+)?/);
    return matches ? parseFloat(matches[0]) : 0;
}

/**
 * تنسيق المبلغ المالي
 * @param {number} amount - المبلغ
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount) {
    // استخدام دالة تنسيق العملة الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    // تنسيق افتراضي إذا لم تكن الدالة متاحة
    return amount.toLocaleString('ar-IQ') + ' دينار';
}

// إضافة مستمعات الأحداث لتحميل زر الطباعة
document.addEventListener('DOMContentLoaded', function() {
    // محاولة إضافة الزر بعد تحميل الصفحة
    setTimeout(addPrintSalariesButton, 1000);
});

// مستمع للنقر على الروابط والأزرار للكشف عن تغييرات الصفحة
document.body.addEventListener('click', function(e) {
    // إضافة زر الطباعة بعد النقر على أزرار التنقل
    if (e.target.closest('a[href], button, .nav-link, .tab-btn')) {
        setTimeout(addPrintSalariesButton, 500);
    }
});

// مراقبة تغييرات DOM لإضافة زر الطباعة عندما يظهر جدول الرواتب
const observer = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && (
                    node.tagName === 'TABLE' || 
                    node.querySelector('table') ||
                    node.id === 'salary-transactions-tab' ||
                    node.classList.contains('page') ||
                    node.classList.contains('tab-content')
                )) {
                    setTimeout(addPrintSalariesButton, 300);
                    break;
                }
            }
        }
    }
});

// بدء مراقبة تغييرات DOM
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
});


