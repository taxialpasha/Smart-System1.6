/**
 * إصلاح مشكلة الشريط الجانبي - يضمن عمله في جميع الصفحات
 * هذا الملف يعيد تهيئة وظائف الشريط الجانبي بعد تحميل جميع الملفات
 */

(function() {
    // التأكد من تحميل الصفحة بالكامل
    function initSidebar() {
        // التحقق من وجود كائن التنقل
        if (!window.navigation) {
            // إنشاء كائن التنقل إذا لم يكن موجوداً
            window.navigation = new Navigation();
        }

        // تحديث مرجعيات العناصر
        const sidebar = document.querySelector('.sidebar');
        const toggleButtons = document.querySelectorAll('.toggle-sidebar');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // إضافة أحداث للأزرار
        toggleButtons.forEach(button => {
            // إزالة الأحداث القديمة لتجنب التكرار
            button.removeEventListener('click', window.toggleSidebarHandler);
            
            // إنشاء معالج حدث جديد
            window.toggleSidebarHandler = function() {
                if (window.navigation) {
                    window.navigation.toggleSidebar();
                } else {
                    document.querySelector('.layout').classList.toggle('sidebar-collapsed');
                }
            };
            
            // إضافة معالج الحدث الجديد
            button.addEventListener('click', window.toggleSidebarHandler);
        });
        
        // إضافة أحداث للروابط
        navLinks.forEach(link => {
            // إزالة الأحداث القديمة
            link.removeEventListener('click', window.navLinkHandler);
            
            // إنشاء معالج حدث جديد
            window.navLinkHandler = function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                if (page && window.navigation) {
                    window.navigation.navigateTo(page);
                }
            };
            
            // إضافة معالج الحدث الجديد
            link.addEventListener('click', window.navLinkHandler);
        });
        
        // التأكد من تطبيق حالة الشريط الجانبي المحفوظة
        try {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            const layout = document.querySelector('.layout');
            
            if (isCollapsed) {
                layout.classList.add('sidebar-collapsed');
            } else {
                layout.classList.remove('sidebar-collapsed');
            }
        } catch (e) {
            console.error('خطأ في استرجاع حالة الشريط الجانبي:', e);
        }
    }

    // تعريف دالة للتعامل مع الصفحات المضافة ديناميكياً
    function setupMutationObserver() {
        // إنشاء مراقب للتغييرات في DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // إعادة تهيئة الشريط الجانبي عند إضافة عناصر جديدة
                    setTimeout(initSidebar, 100);
                }
            });
        });

        // بدء المراقبة على العنصر الرئيسي
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // دالة لإعادة تهيئة الأحداث بعد تحميل الصفحات الديناميكية
    function setupDynamicPageEvents() {
        document.addEventListener('page:loaded', function(e) {
            setTimeout(initSidebar, 100);
        });
        
        // الاستماع لأحداث التنقل المخصصة
        document.addEventListener('custom:navigation', function(e) {
            if (e.detail && e.detail.page && window.navigation) {
                window.navigation.navigateTo(e.detail.page);
            }
        });
    }

    // التهيئة عند تحميل المستند
    document.addEventListener('DOMContentLoaded', function() {
        // تأخير التنفيذ لضمان تحميل جميع الملفات الأخرى
        setTimeout(function() {
            initSidebar();
            setupMutationObserver();
            setupDynamicPageEvents();
            
            // إرسال حدث لإخبار الملفات الأخرى أن الشريط الجانبي جاهز
            document.dispatchEvent(new CustomEvent('sidebar:ready'));
        }, 500);
    });

    // إعادة المحاولة بعد فترة للتأكد من التهيئة
    window.addEventListener('load', function() {
        setTimeout(initSidebar, 1000);
    });
})();