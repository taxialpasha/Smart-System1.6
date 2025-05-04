/**
 * نظام الاستثمار المتكامل - الشريط الجانبي والتنقل
 * يتحكم في وظائف الشريط الجانبي والتنقل بين الصفحات المختلفة
 */

class Navigation {
    constructor() {
        // عناصر واجهة المستخدم
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButtons = document.querySelectorAll('.toggle-sidebar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        
        // تعيين الصفحة النشطة
        this.activePage = 'dashboard';
        
        // معدلات التغيير
        this.transitionDuration = 300; // مللي ثانية
        
        // تهيئة الأحداث
        this.initEvents();
        
        // تطبيق حالة الشريط الجانبي المحفوظة
        this.applySavedSidebarState();
    }
    
    // تهيئة الأحداث
    initEvents() {
        // أحداث أزرار طي/فتح الشريط الجانبي
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleSidebar());
        });

        // إضافة مستمع عام لتحديث الشريط الجانبي عند تغيير الصفحة
        document.addEventListener('page:change', () => {
            this.updateSidebarState();
        });

        // أحداث روابط التنقل
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // الاستجابة لتغير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // طي/فتح الشريط الجانبي
    toggleSidebar() {
        const layout = document.querySelector('.layout');
        layout.classList.toggle('sidebar-collapsed');
        
        // حفظ حالة الشريط الجانبي
        this.saveSidebarState(layout.classList.contains('sidebar-collapsed'));
        
        // إرسال حدث تغيير حجم الشريط الجانبي
        this.dispatchSidebarEvent(layout.classList.contains('sidebar-collapsed'));
    }
    
    // التنقل إلى صفحة معينة
    navigateTo(page) {
        // لا نفعل شيئًا إذا كانت الصفحة هي نفسها النشطة حاليًا
        if (page === this.activePage) {
            return;
        }
        
        // تحديث الروابط النشطة
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // تحديث الصفحات النشطة مع تأثير التلاشي
        this.pages.forEach(pageEl => {
            const pageId = pageEl.id.replace('-page', '');
            
            if (pageId === page) {
                // نضيف تأثير الظهور للصفحة الجديدة
                pageEl.style.opacity = '0';
                pageEl.classList.add('active');
                
                // تأثير ظهور تدريجي
                setTimeout(() => {
                    pageEl.style.opacity = '1';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                }, 50);
            } else {
                if (pageEl.classList.contains('active')) {
                    // إخفاء الصفحة السابقة بتلاشي تدريجي
                    pageEl.style.opacity = '0';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                    
                    setTimeout(() => {
                        pageEl.classList.remove('active');
                    }, this.transitionDuration);
                } else {
                    pageEl.classList.remove('active');
                }
            }
        });
        
        // تحديث الصفحة النشطة
        this.activePage = page;
        
        // حفظ الصفحة النشطة في التخزين المحلي
        localStorage.setItem('activePage', page);
        
        // إرسال حدث تغيير الصفحة
        this.dispatchPageChangeEvent(page);
        
        // تمرير للأعلى
        window.scrollTo(0, 0);
    }
    
    // التعامل مع تغيير حجم النافذة
    handleResize() {
        // إغلاق الشريط الجانبي تلقائيًا في الشاشات الصغيرة
        if (window.innerWidth < 768) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
            this.saveSidebarState(true);
        }
    }
    
    // حفظ حالة الشريط الجانبي
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // تطبيق حالة الشريط الجانبي المحفوظة
    applySavedSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
        } else {
            document.querySelector('.layout').classList.remove('sidebar-collapsed');
        }
        
        // تطبيق الصفحة المحفوظة
        const savedPage = localStorage.getItem('activePage');
        if (savedPage) {
            this.navigateTo(savedPage);
        }
        
        // للشاشات الصغيرة، نغلق الشريط الجانبي تلقائيًا
        this.handleResize();
    }
    
    // إرسال حدث تغيير حجم الشريط الجانبي
    dispatchSidebarEvent(isCollapsed) {
        const event = new CustomEvent('sidebar:toggle', {
            detail: { isCollapsed }
        });
        document.dispatchEvent(event);
    }
    
    // إرسال حدث تغيير الصفحة
    dispatchPageChangeEvent(page) {
        const event = new CustomEvent('page:change', {
            detail: { page }
        });
        document.dispatchEvent(event);
    }
    
    // فتح الشريط الجانبي
    openSidebar() {
        document.querySelector('.layout').classList.remove('sidebar-collapsed');
        this.saveSidebarState(false);
        this.dispatchSidebarEvent(false);
    }
    
    // إغلاق الشريط الجانبي
    closeSidebar() {
        document.querySelector('.layout').classList.add('sidebar-collapsed');
        this.saveSidebarState(true);
        this.dispatchSidebarEvent(true);
    }
    
    // إضافة سلوك التمرير عند التنقل السريع
    enableSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                if (!targetId) return;
                
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // تحديث حالة الشريط الجانبي عند تغيير الصفحة
    updateSidebarState() {
        const layout = document.querySelector('.layout');
        if (window.innerWidth < 768) {
            layout.classList.add('sidebar-collapsed');
            this.saveSidebarState(true);
        } else {
            layout.classList.remove('sidebar-collapsed');
            this.saveSidebarState(false);
        }
    }
}

// إنشاء كائن التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});