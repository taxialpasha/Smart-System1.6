/**
 * إصلاح لإضافة أزرار الصادرات والواردات إلى الشريط الجانبي
 * احفظ هذا الملف باسم "fix-sidebar-buttons.js" وقم بإضافته في ملف HTML
 */

(function() {
    console.log("بدء إضافة أزرار الصادرات والواردات إلى الشريط الجانبي...");
    
    // دالة إضافة الأزرار - تحاول إضافة الأزرار بشكل متكرر حتى تنجح
    function addExportImportButtons() {
        // البحث عن قائمة التنقل
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.log("لم يتم العثور على قائمة التنقل، إعادة المحاولة بعد 500 مللي ثانية...");
            setTimeout(addExportImportButtons, 500);
            return;
        }
        
        // التحقق من عدم وجود الأزرار مسبقًا
        if (document.querySelector('.nav-link[data-page="exports"]') || document.querySelector('.nav-link[data-page="imports"]')) {
            console.log("أزرار الصادرات والواردات موجودة بالفعل");
            return;
        }
        
        // البحث عن عنصر التقارير أو عنصر الإعدادات لإضافة الأزرار قبلهما
        const reportsItem = document.querySelector('.nav-link[data-page="reports"]');
        const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
        const targetItem = reportsItem || settingsItem;
        
        if (!targetItem) {
            console.log("لم يتم العثور على عنصر مناسب للإضافة بعده، إعادة المحاولة بعد 500 مللي ثانية...");
            setTimeout(addExportImportButtons, 500);
            return;
        }
        
        const targetLi = targetItem.closest('.nav-item');
        
        // إنشاء عنصر زر الصادرات
        const exportsItem = document.createElement('li');
        exportsItem.className = 'nav-item';
        exportsItem.innerHTML = `
            <a class="nav-link" data-page="exports" href="#">
                <div class="nav-icon">
                    <i class="fas fa-file-export"></i>
                </div>
                <span>الصادرات</span>
            </a>
        `;
        
        // إنشاء عنصر زر الواردات
        const importsItem = document.createElement('li');
        importsItem.className = 'nav-item';
        importsItem.innerHTML = `
            <a class="nav-link" data-page="imports" href="#">
                <div class="nav-icon">
                    <i class="fas fa-file-import"></i>
                </div>
                <span>الواردات</span>
            </a>
        `;
        
        // إضافة الأزرار إلى القائمة
        if (targetLi) {
            navList.insertBefore(exportsItem, targetLi);
            navList.insertBefore(importsItem, targetLi);
            console.log("تم إضافة أزرار الصادرات والواردات بنجاح!");
            
            // إضافة مستمعي أحداث للأزرار
            setupButtonEvents();
        } else {
            console.log("حدث خطأ أثناء محاولة إضافة الأزرار، إعادة المحاولة بعد 1000 مللي ثانية...");
            setTimeout(addExportImportButtons, 1000);
        }
    }
    
    // إضافة مستمعي أحداث للأزرار
    function setupButtonEvents() {
        const exportsButton = document.querySelector('.nav-link[data-page="exports"]');
        const importsButton = document.querySelector('.nav-link[data-page="imports"]');
        
        if (exportsButton) {
            exportsButton.addEventListener('click', function(e) {
                e.preventDefault();
                showFinancialPage("exports");
            });
        }
        
        if (importsButton) {
            importsButton.addEventListener('click', function(e) {
                e.preventDefault();
                showFinancialPage("imports");
            });
        }
    }
    
    // عرض صفحة مالية (صادرات أو واردات)
    function showFinancialPage(pageType) {
        // محاولة استدعاء الدالة من النظام الرئيسي إذا كانت موجودة
        if (typeof window.showFinancialPage === 'function') {
            window.showFinancialPage(pageType);
            return;
        }
        
        // تنفيذ بديل إذا لم تكن الدالة موجودة
        const pageId = `${pageType}-page`;
        let page = document.getElementById(pageId);
        
        // التحقق من وجود الصفحة، وإنشاؤها إذا لم تكن موجودة
        if (!page) {
            if (pageType === 'exports') {
                createExportsPage();
            } else {
                createImportsPage();
            }
            page = document.getElementById(pageId);
        }
        
        if (!page) {
            console.error(`الصفحة ${pageId} غير موجودة ولم يمكن إنشاؤها!`);
            return;
        }
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        page.classList.add('active');
        
        // تحديث القائمة الجانبية
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const navLink = document.querySelector(`.nav-link[data-page="${pageType}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
    }
    
    // إنشاء صفحة الصادرات
    function createExportsPage() {
        // التحقق من عدم وجود الصفحة مسبقًا
        if (document.getElementById('exports-page')) {
            return;
        }
        
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'exports-page';
        
        // إنشاء محتوى أساسي للصفحة (يمكن تحديثه لاحقًا)
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">الصادرات المالية</h1>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">جاري تحميل نظام الصادرات...</h2>
                </div>
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
                    <p style="margin-top: 1rem;">يرجى الانتظار بينما يتم تحميل نظام الصادرات...</p>
                </div>
            </div>
        `;
        
        // إضافة الصفحة للمحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
            console.log('تم إنشاء صفحة الصادرات بنجاح');
        }
    }
    
    // إنشاء صفحة الواردات
    function createImportsPage() {
        // التحقق من عدم وجود الصفحة مسبقًا
        if (document.getElementById('imports-page')) {
            return;
        }
        
        // إنشاء عنصر الصفحة
        const pageElement = document.createElement('div');
        pageElement.className = 'page';
        pageElement.id = 'imports-page';
        
        // إنشاء محتوى أساسي للصفحة (يمكن تحديثه لاحقًا)
        pageElement.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">الواردات المالية</h1>
            </div>
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">جاري تحميل نظام الواردات...</h2>
                </div>
                <div class="text-center" style="padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
                    <p style="margin-top: 1rem;">يرجى الانتظار بينما يتم تحميل نظام الواردات...</p>
                </div>
            </div>
        `;
        
        // إضافة الصفحة للمحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(pageElement);
            console.log('تم إنشاء صفحة الواردات بنجاح');
        }
    }
    
    // إضافة مستمع لزر فتح/إغلاق الشريط الجانبي
    function setupSidebarToggle() {
        const toggleButton = document.querySelector('.toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');

        if (toggleButton && sidebar) {
            toggleButton.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
                console.log("تم تغيير حالة الشريط الجانبي");
            });
        } else {
            console.error("لم يتم العثور على زر أو شريط جانبي لإضافة مستمع");
        }
    }

    // تشغيل دالة إضافة الأزرار
    addExportImportButtons();
    
    // إعادة المحاولة بعد 2 ثانية من تحميل الصفحة بالكامل للتأكد من إضافة الأزرار
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (!document.querySelector('.nav-link[data-page="exports"]') || !document.querySelector('.nav-link[data-page="imports"]')) {
                console.log("محاولة أخيرة لإضافة الأزرار...");
                addExportImportButtons();
            }
        }, 2000);

        // إعداد مستمع زر فتح/إغلاق الشريط الجانبي
        setupSidebarToggle();

        // إرسال حدث تغيير الصفحة عند التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                const page = this.getAttribute('data-page');
                if (page) {
                    const event = new CustomEvent('page:change', { detail: { page } });
                    document.dispatchEvent(event);
                }
            });
        });
    });
})();

