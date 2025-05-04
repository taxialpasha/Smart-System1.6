/**
 * نظام الاستثمار المتكامل - شاشات الترحيب الأوتوماتيكية
 * 
 * هذا الملف يحتوي على جميع الرموز اللازمة لعرض شاشات الترحيب والانتظار
 * مع إضافة خاصية الانتقال التلقائي بين الشاشات
 * 
 * الإصدار: 3.0.0
 * تاريخ التحديث: 2025-05-03
 */
(function() {
    // تعريف المتغيرات الرئيسية
    let currentScreen = 0;
    let autoSlideInterval = null;
    let isTransitioning = false;
    const totalScreens = 6; // عدد الشاشات بما فيها شاشة الانتظار
    const autoSlideDelay = 10000; // مدة العرض لكل شاشة (3 ثواني)
    const transitionDuration = 1000; // مدة الانتقال بين الشاشات (1 ثانية)
    const firstTimeKey = 'investment_app_first_launch'; // مفتاح تخزين حالة العرض الأول
    // صور وأيقونات (Base64 لتجنب مشاكل المسارات)
    const ASSETS = {
        logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTQ1LjQgMjQuNWwxNi43IDkuN3YyNS4zbC0xMi41IDcuMlY0OC45bC0xNi43LTkuN3YyNS4zbDEyLjUgNy4yVjQ4LjlsMTYuNyA5LjZ2MjUuM2wtMTYuNyA5LjctMTYuNy05LjdWNGwxNi43IDkuN1pNNjYuMyAxOS42bC0xNi43LTkuNnYxOS4zbDE2LjcgOS43IDE2LjctOS43VjEwbC0xNi43IDkuNloiLz48L3N2Zz4=",
        dashboard: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxsaW5lIHgxPSIzIiB5MT0iOSIgeDI9IjIxIiB5Mj0iOSI+PC9saW5lPjxsaW5lIHgxPSI5IiB5MT0iMjEiIHgyPSI5IiB5Mj0iOSI+PC9saW5lPjwvc3ZnPg==",
        users: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTcgMjF2LTJhNCA0IDAgMCAwLTQtNEg1YTQgNCAwIDAgMC00IDR2MiI+PC9wYXRoPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48cGF0aCBkPSJNMjMgMjF2LTJhNCA0IDAgMCAwLTMtMy44NyI+PC9wYXRoPjxwYXRoIGQ9Ik0xNiAzLjEzYTQgNCAwIDAgMSAwIDcuNzUiPjwvcGF0aD48L3N2Zz4=",
        chart: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMTgiIHkxPSIyMCIgeDI9IjE4IiB5Mj0iMTAiPjwvbGluZT48bGluZSB4MT0iMTIiIHkxPSIyMCIgeDI9IjEyIiB5Mj0iNCI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iMjAiIHgyPSI2IiB5Mj0iMTQiPjwvbGluZT48L3N2Zz4=",
        dollar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMTIiIHkxPSIxIiB4Mj0iMTIiIHkyPSIyMyI+PC9saW5lPjxwYXRoIGQ9Ik0xNyA1SDkuNWE0LjUgNC41IDAgMCAwIDAgOWg1YTQuNSA0LjUgMCAwIDEgMCA5SDYiPjwvcGF0aD48L3N2Zz4=",
        pieChart: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEuMjEgMTUuODlBMTAgMTAgMCAxIDEgOC4xMSAyLjc5Ij48L3BhdGg+PHBhdGggZD0iTTIyIDEyQTEwIDEwIDAgMCAwIDEyIDJWMTJoMTAiPjwvcGF0aD48L3N2Zz4=",
        creditCard: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIxIiB5PSI0IiB3aWR0aD0iMjIiIGhlaWdodD0iMTYiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxsaW5lIHgxPSIxIiB5MT0iMTAiIHgyPSIyMyIgeTI9IjEwIj48L2xpbmU+PC9zdmc+",
        employeeCard: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxwYXRoIGQ9Ik0xNiAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTAiIGN5PSI4IiByPSIyIj48L2NpcmNsZT48cGF0aCBkPSJNMTYgMTFoNiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNiA4aDYiPjwvcGF0aD48cGF0aCBkPSJNMTYgMTRoNiI+PC9wYXRoPjwvc3ZnPg==",
        settings: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIj48L2NpcmNsZT48cGF0aCBkPSJNMTkuNCAyNWgxMS4yYzEuMyAwIDIuNC0uOSAyLjQtMiAwLTMuOS0zLjEtNy0tNy4yLTctLjcgMC0xLjMuMS0xLjkuMyAuMi0uNi4zLTEuMi4zLTEuOGE2LjggNi44IDAgMCAwLTYuOC02LjhjLTMuMiAwLTUuOSAyLjItNi42IDUuMi0uNS0uMS0xLS4yLTEuNi0uMkM2IDEyLjcgMyAxNS44IDMgMTkuNmMwIDEuMiAxLjEgMiAyLjQgMkgxNiI+PC9wYXRoPjwvc3ZnPg==",
        check: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4="
    };

    // تعريف محتوى شاشات الترحيب
    const welcomeScreens = [
        // شاشة الانتظار
        {
            id: "splash",
            backgroundColor: "linear-gradient(135deg, #142952 0%, #0a1834 100%)",
            icon: ASSETS.logo,
            title: "نظام الاستثمار المتكامل",
            subtitle: "الحل الأمثل لإدارة استثماراتك بكفاءة عالية",
        },
        // الشاشة الأولى
        {
            id: "dashboard",
            backgroundColor: "linear-gradient(135deg, #0062cc 0%, #0a4da8 100%)",
            icon: ASSETS.dashboard,
            title: "لوحة تحكم متكاملة",
            subtitle: "إدارة استثماراتك ومستثمريك من مكان واحد بواجهة سهلة الاستخدام",
            features: [
                "متابعة مباشرة للإيداعات والسحوبات والأرباح بشكل لحظي",
                "إحصائيات شاملة ورسوم بيانية تفاعلية لجميع البيانات المالية",
                "تحليل أداء الاستثمارات بشكل لحظي مع مؤشرات الأداء الرئيسية",
                "تنبيهات ذكية لمتابعة العمليات الهامة والفرص الاستثمارية"
            ]
        },
        // الشاشة الثانية
        {
            id: "investors",
            backgroundColor: "linear-gradient(135deg, #1db954 0%, #158d40 100%)",
            icon: ASSETS.users,
            title: "إدارة المستثمرين",
            subtitle: "إدارة كاملة لبيانات وحسابات المستثمرين مع تحديثات فورية",
            features: [
                "ملفات شخصية متكاملة للمستثمرين تشمل جميع البيانات الضرورية",
                "متابعة دقيقة لحسابات كل مستثمر مع آلية تدقيق متطورة",
                "إدارة الوثائق والمستندات المرتبطة بشكل آمن ومنظم",
                "خيارات بحث وتصفية متقدمة للوصول السريع للبيانات المطلوبة"
            ]
        },
        // الشاشة الثالثة
        {
            id: "profits",
            backgroundColor: "linear-gradient(135deg, #5e35b1 0%, #3c1f8a 100%)",
            icon: ASSETS.chart,
            title: "حساب الأرباح والفوائد",
            subtitle: "نظام دقيق لحساب وتوزيع الأرباح والفوائد بمعايير عالمية",
            features: [
                "حساب أوتوماتيكي للأرباح الشهرية والسنوية وفق معايير دقيقة",
                "خيارات متعددة لنسب الفائدة والعوائد مع خوارزميات متطورة",
                "جدولة مواعيد دفع الأرباح وإرسال إشعارات تلقائية للمستثمرين",
                "تقارير مفصلة عن توزيعات الأرباح قابلة للتصدير بصيغ متعددة"
            ]
        },
        // الشاشة الرابعة
        {
            id: "installments",
            backgroundColor: "linear-gradient(135deg, #ff7043 0%, #e64a19 100%)",
            icon: ASSETS.dollar,
            title: "إدارة الأقساط والسلف",
            subtitle: "نظام متكامل لإدارة الأقساط والسلف والقروض بخيارات مرنة",
            features: [
                "متابعة السلف والقروض وأقساطها مع إمكانية جدولة الدفعات",
                "إشعارات تلقائية لمواعيد استحقاق الأقساط عبر وسائل متعددة",
                "قوالب متعددة للقروض والسلف تناسب مختلف الاحتياجات",
                "حساب تلقائي للفوائد والغرامات بناءً على السياسات المحددة"
            ]
        },
        // الشاشة الخامسة
        {
            id: "features",
            backgroundColor: "linear-gradient(135deg, #26c6da 0%, #00acc1 100%)",
            icon: ASSETS.creditCard,
            title: "ميزات إضافية متكاملة",
            subtitle: "مجموعة من الميزات المتقدمة تعزز كفاءة النظام وتجربة المستخدم",
            features: [
                "إصدار بطاقات إلكترونية للمستثمرين بتصاميم مخصصة وآمنة",
                "إدارة شؤون الموظفين والرواتب مع نظام تقييم أداء متكامل",
                "نظام متقدم للتقارير والإحصائيات مع خيارات تخصيص واسعة",
                "تخزين آمن للبيانات وحلول النسخ الاحتياطي السحابية"
            ]
        }
    ];

    // استيراد الأنماط (CSS)
    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'welcome-screens-styles';
        styleElement.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-30px); }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
            
            @keyframes progressAnimation {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes float {
                0% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-15px) rotate(2deg); }
                100% { transform: translateY(0) rotate(0deg); }
            }
            
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            @keyframes rotateClockwise {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes rotateCounterClockwise {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
            }
            
            @keyframes orbiting {
                0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
            }
            
            .welcome-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                overflow: hidden;
                direction: rtl;
                font-family: 'Tajawal', 'Cairo', 'Arial', sans-serif;
                user-select: none;
            }
            
            .welcome-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                text-align: center;
                opacity: 0;
                transform: translateX(100%);
                transition: opacity ${transitionDuration}ms cubic-bezier(0.19, 1, 0.22, 1), 
                            transform ${transitionDuration}ms cubic-bezier(0.19, 1, 0.22, 1);
                background-size: 200% 200%;
                background-position: center;
                animation: gradientAnimation 15s ease infinite;
            }
            
            .welcome-screen.active {
                opacity: 1;
                transform: translateX(0);
                z-index: 2;
            }
            
            .welcome-screen.slide-left {
                animation: slideOutLeft ${transitionDuration}ms forwards cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            .welcome-screen.next-active {
                animation: slideInRight ${transitionDuration}ms forwards cubic-bezier(0.19, 1, 0.22, 1);
            }
            
            .welcome-icon {
                width: 130px;
                height: 130px;
                margin-bottom: 35px;
                animation: float 6s ease-in-out infinite;
                filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
                transition: transform 0.5s ease;
            }
            
            .welcome-content {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transform: translateY(30px);
                opacity: 0;
                transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
                position: relative;
                overflow: hidden;
            }
            
            .welcome-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            }
            
            .welcome-content::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            }
            
            .welcome-screen.active .welcome-content {
                opacity: 1;
                transform: translateY(0);
                transition-delay: 0.2s;
            }
            
            .welcome-title {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 20px;
                text-shadow: 0 4px 15px rgba(0,0,0,0.5);
                position: relative;
                display: inline-block;
                letter-spacing: -0.5px;
            }
            
            .welcome-title::after {
                content: '';
                position: absolute;
                bottom: -10px;
                right: 30%;
                width: 40%;
                height: 4px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
                border-radius: 2px;
                transform: scaleX(0);
                transform-origin: right;
                transition: transform 0.8s ease 0.3s;
            }
            
            .welcome-screen.active .welcome-title::after {
                transform: scaleX(1);
                transform-origin: left;
            }
            
            .welcome-subtitle {
                font-size: 1.4rem;
                margin-bottom: 50px;
                opacity: 0.9;
                line-height: 1.6;
                text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                max-width: 80%;
                margin-left: auto;
                margin-right: auto;
                font-weight: 400;
            }
            
            .welcome-features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 25px;
                text-align: right;
                margin-bottom: 40px;
                width: 100%;
            }
            
            .welcome-feature {
                display: flex;
                align-items: flex-start;
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                padding: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
                cursor: default;
            }
            
            .welcome-feature::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 70%);
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .welcome-feature:hover {
                transform: translateY(-5px) !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            }
            
            .welcome-feature:hover::before {
                opacity: 1;
            }
            
            .welcome-screen.active .welcome-feature {
                opacity: 1;
                transform: translateY(0);
            }
            
            .welcome-screen.active .welcome-feature:nth-child(1) {
                transition-delay: 0.3s;
            }
            
            .welcome-screen.active .welcome-feature:nth-child(2) {
                transition-delay: 0.4s;
            }
            
            .welcome-screen.active .welcome-feature:nth-child(3) {
                transition-delay: 0.5s;
            }
            
            .welcome-screen.active .welcome-feature:nth-child(4) {
                transition-delay: 0.6s;
            }
            
            .welcome-feature-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 45px;
                height: 45px;
                margin-left: 15px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                color: white;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
                overflow: hidden;
            }
            
            .welcome-feature-icon::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3), transparent 70%);
            }
            
            .welcome-feature-text {
                font-size: 1.05rem;
                line-height: 1.6;
                text-align: right;
                font-weight: 400;
            }
            
            /* مؤشر التقدم */
            .welcome-progress {
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10;
                background: rgba(0, 0, 0, 0.2);
                padding: 12px 24px;
                border-radius: 30px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .welcome-progress-dots {
                display: flex;
                gap: 10px;
            }
            
            .welcome-progress-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.3);
                transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                position: relative;
                overflow: hidden;
            }
            
            .welcome-progress-dot.active {
                background-color: white;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
            }
            
            .welcome-progress-timer {
                width: 80px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-left: 5px;
            }
            
            .welcome-progress-bar {
                height: 100%;
                width: 0%;
                background: white;
                border-radius: 2px;
                animation-name: progressAnimation;
                animation-timing-function: linear;
                animation-duration: ${autoSlideDelay}ms;
                animation-fill-mode: forwards;
            }
            
            .welcome-skip {
                position: absolute;
                bottom: 40px;
                left: 40px;
                display: flex;
                z-index: 10;
            }
            
            .skip-button {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 50px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
                overflow: hidden;
            }
            
            .skip-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent 70%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .skip-button:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-5px);
            }
            
            .skip-button:hover::before {
                opacity: 1;
            }
            
            .splash-screen {
                position: relative;
                overflow: hidden;
            }
            
            .splash-screen::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(20,41,82,0.4), rgba(10,24,52,0.9));
                z-index: -1;
            }
            
            .splash-progress-container {
                width: 300px;
                height: 6px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
                margin-top: 60px;
                position: relative;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .splash-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, rgba(255,255,255,0.7), rgba(74,144,226,0.9), rgba(255,255,255,0.7));
                background-size: 200% 100%;
                animation: progressAnimation 3.5s cubic-bezier(0.1, 0.7, 0.9, 0.99) forwards, gradientAnimation 2s ease infinite;
                box-shadow: 0 0 15px rgba(74,144,226,0.5);
            }
            
            .splash-loading-text {
                margin-top: 20px;
                font-size: 16px;
                opacity: 0.85;
                animation: pulse 2s infinite;
                letter-spacing: 1px;
            }
            
            .splash-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: -1;
            }
            
            .particle {
                position: absolute;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                filter: blur(1px);
                animation: floating 20s infinite linear;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }

            .orbiting-circle {
                position: absolute;
                width: 300px;
                height: 300px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: rotateClockwise 20s linear infinite;
            }
            
            .orbiting-dot {
                position: absolute;
                width: 15px;
                height: 15px;
                background-color: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 15px white;
                animation: orbiting 10s linear infinite;
            }
            
            .rotating-ring {
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                border: 2px solid transparent;
                border-top: 2px solid rgba(255, 255, 255, 0.1);
                border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: rotateCounterClockwise 30s linear infinite;
            }
            
            /* تعديلات للهواتف المحمولة */
            @media (max-width: 768px) {
                .welcome-features {
                    grid-template-columns: 1fr;
                }
                
                .welcome-title {
                    font-size: 2.2rem;
                }
                
                .welcome-subtitle {
                    font-size: 1.1rem;
                    max-width: 95%;
                }
                
                .welcome-icon {
                    width: 90px;
                    height: 90px;
                }
                
                .welcome-content {
                    padding: 25px;
                    max-width: 90%;
                }
                
                .splash-progress-container {
                    width: 250px;
                }
                
                .welcome-skip {
                    bottom: 30px;
                    left: 30px;
                }
                
                .welcome-progress {
                    bottom: 30px;
                    padding: 8px 15px;
                }
                
                .rotating-ring, .orbiting-circle {
                    width: 300px;
                    height: 300px;
                }
            }
            
            /* تعديلات لدعم أخرى */
            @supports not (backdrop-filter: blur(10px)) {
                .welcome-content {
                    background: rgba(0, 0, 0, 0.7);
                }
                
                .welcome-progress,
                .skip-button {
                    background: rgba(0, 0, 0, 0.5);
                }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // إنشاء جزيئات متحركة للخلفية
    function createParticles(container, count = 15) {
        const particles = document.createElement('div');
        particles.className = 'splash-particles';
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 8 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // موقع عشوائي
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            
            // حركة عشوائية
            const animationDuration = Math.random() * 20 + 10;
            const animationDelay = Math.random() * 5;
            particle.style.animation = `floating ${animationDuration}s ease-in-out ${animationDelay}s infinite`;
            
            particles.appendChild(particle);
        }
        
        container.appendChild(particles);
    }

    // إضافة تأثيرات بصرية إضافية
    function addVisualEffects(container) {
        // إضافة حلقة دائرية متحركة
        const rotatingRing = document.createElement('div');
        rotatingRing.className = 'rotating-ring';
        container.appendChild(rotatingRing);
        
        // إضافة دائرة مدارية
        const orbitingCircle = document.createElement('div');
        orbitingCircle.className = 'orbiting-circle';
        container.appendChild(orbitingCircle);
        
        // إضافة نقاط مدارية
        for (let i = 0; i < 3; i++) {
            const orbitingDot = document.createElement('div');
            orbitingDot.className = 'orbiting-dot';
            orbitingDot.style.animationDelay = `${i * 3}s`;
            container.appendChild(orbitingDot);
        }
    }

    // إنشاء شاشة الانتظار
    function createSplashScreen() {
        const splashScreen = document.createElement('div');
        splashScreen.className = 'welcome-screen splash-screen active';
        splashScreen.style.background = welcomeScreens[0].backgroundColor;
        
        // إضافة الجزيئات للخلفية
        createParticles(splashScreen, 30);
        
        // إضافة تأثيرات بصرية
        addVisualEffects(splashScreen);
        
        const splashContent = document.createElement('div');
        splashContent.className = 'welcome-content';
        
        const logo = document.createElement('img');
        logo.src = welcomeScreens[0].icon;
        logo.alt = 'Logo';
        logo.className = 'welcome-icon';
        
        const title = document.createElement('h1');
        title.className = 'welcome-title';
        title.textContent = welcomeScreens[0].title;
        
        const subtitle = document.createElement('p');
        subtitle.className = 'welcome-subtitle';
        subtitle.textContent = welcomeScreens[0].subtitle;
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'splash-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'splash-progress-bar';
        progressContainer.appendChild(progressBar);
        
        const loadingText = document.createElement('div');
        loadingText.className = 'splash-loading-text';
        loadingText.textContent = 'جاري تحميل النظام...';
        
        splashContent.appendChild(logo);
        splashContent.appendChild(title);
        splashContent.appendChild(subtitle);
        splashContent.appendChild(progressContainer);
        splashContent.appendChild(loadingText);
        
        splashScreen.appendChild(splashContent);
        
        return splashScreen;
    }

    // إنشاء شاشة ترحيب
    function createWelcomeScreen(screen, index) {
        const welcomeScreen = document.createElement('div');
        welcomeScreen.className = 'welcome-screen';
        welcomeScreen.style.background = screen.backgroundColor;
        welcomeScreen.id = `welcome-screen-${index}`;
        
        // إضافة الجزيئات للخلفية
        createParticles(welcomeScreen, 20);
        
        // إضافة تأثيرات بصرية
        addVisualEffects(welcomeScreen);
        
        const content = document.createElement('div');
        content.className = 'welcome-content';
        
        const icon = document.createElement('img');
        icon.src = screen.icon;
        icon.alt = screen.title;
        icon.className = 'welcome-icon';
        
        const title = document.createElement('h2');
        title.className = 'welcome-title';
        title.textContent = screen.title;
        
        const subtitle = document.createElement('p');
        subtitle.className = 'welcome-subtitle';
        subtitle.textContent = screen.subtitle;
        
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(subtitle);
        
        // إضافة الميزات
        if (screen.features && screen.features.length > 0) {
            const features = document.createElement('div');
            features.className = 'welcome-features';
            
            screen.features.forEach((feature, featureIndex) => {
                const featureItem = document.createElement('div');
                featureItem.className = 'welcome-feature';
                
                const featureIcon = document.createElement('div');
                featureIcon.className = 'welcome-feature-icon';
                featureIcon.textContent = (featureIndex + 1).toString();
                
                const featureText = document.createElement('div');
                featureText.className = 'welcome-feature-text';
                featureText.textContent = feature;
                
                featureItem.appendChild(featureIcon);
                featureItem.appendChild(featureText);
                features.appendChild(featureItem);
            });
            
            content.appendChild(features);
        }
        
        welcomeScreen.appendChild(content);
        
        return welcomeScreen;
    }

    // إنشاء شريط التقدم
    function createProgressBar() {
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'welcome-progress';
        
        // إنشاء النقاط
        const progressDots = document.createElement('div');
        progressDots.className = 'welcome-progress-dots';
        
        for (let i = 0; i < welcomeScreens.length - 1; i++) {
            const dot = document.createElement('div');
            dot.className = 'welcome-progress-dot';
            if (i === 0) dot.classList.add('active');
            progressDots.appendChild(dot);
        }
        
        // إنشاء مؤشر الوقت
        const progressTimer = document.createElement('div');
        progressTimer.className = 'welcome-progress-timer';
        progressTimer.innerHTML = '<div class="welcome-progress-bar"></div>';
        
        progressBarContainer.appendChild(progressDots);
        progressBarContainer.appendChild(progressTimer);
        
        return progressBarContainer;
    }

    // إنشاء زر تخطي العرض
    function createSkipButton() {
        const skipButtonContainer = document.createElement('div');
        skipButtonContainer.className = 'welcome-skip';
        
        const skipButton = document.createElement('button');
        skipButton.className = 'skip-button';
        skipButton.textContent = 'تخطي العرض';
        skipButton.addEventListener('click', skipIntro);
        
        skipButtonContainer.appendChild(skipButton);
        return skipButtonContainer;
    }

    // بدء الانتقال التلقائي
    function startAutoSlide() {
        stopAutoSlide(); // إيقاف أي انتقال جاري
        resetProgressBar(); // إعادة تعيين مؤشر التقدم
        autoSlideInterval = setInterval(() => {
            if (!isTransitioning) {
                goToNextScreen();
            }
        }, autoSlideDelay);
    }

    // إيقاف الانتقال التلقائي
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // إعادة تعيين مؤشر التقدم
    function resetProgressBar() {
        const progressBar = document.querySelector('.welcome-progress-bar');
        if (progressBar) {
            progressBar.style.animation = 'none';
            // الحيلة لتطبيق الأنميشن من جديد
            setTimeout(() => {
                progressBar.style.animation = `progressAnimation ${autoSlideDelay}ms linear forwards`;
            }, 10);
        }
    }

    // التنقل إلى الشاشة التالية
    function goToNextScreen() {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const currentScreenElement = document.querySelector(`.welcome-screen.active`);
        
        if (currentScreenElement) {
            currentScreenElement.classList.add('slide-left');
            currentScreenElement.classList.remove('active');
        }
        
        currentScreen++;
        
        // إذا وصلنا إلى نهاية الشاشات
        if (currentScreen >= welcomeScreens.length) {
            completeWelcomeScreens();
            return;
        }
        
        // تحديث نقاط التقدم
        updateProgressDots();
        
        // تنشيط الشاشة التالية
        setTimeout(() => {
            const nextScreen = document.querySelector(`#welcome-screen-${currentScreen}`);
            if (nextScreen) {
                nextScreen.classList.add('active', 'next-active');
                setTimeout(() => {
                    nextScreen.classList.remove('next-active');
                }, 50);
            }
            
            isTransitioning = false;
            resetProgressBar();
        }, transitionDuration);
    }

    // تحديث نقاط التقدم
    function updateProgressDots() {
        const progressDots = document.querySelectorAll('.welcome-progress-dot');
        progressDots.forEach((dot, idx) => {
            if (idx === currentScreen - 1) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // تخطي المقدمة
    function skipIntro() {
        stopAutoSlide();
        completeWelcomeScreens();
        
        // تخزين حالة المشاهدة
        localStorage.setItem(firstTimeKey, 'seen');
    }

    // إكمال شاشات الترحيب
    function completeWelcomeScreens() {
        const welcomeOverlay = document.getElementById('welcome-overlay');
        if (welcomeOverlay) {
            welcomeOverlay.style.opacity = '0';
            welcomeOverlay.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
                welcomeOverlay.remove();
            }, 800);
            
            // تخزين حالة المشاهدة
            localStorage.setItem(firstTimeKey, 'seen');
        }
    }

    // التحقق من عرض الشاشات سابقًا
    function hasSeenWelcomeScreens() {
        return localStorage.getItem(firstTimeKey) === 'seen';
    }

    // إنشاء وعرض شاشات الترحيب
    function showWelcomeScreens() {
        // التحقق من وجود الشاشات مسبقاً أو إذا شاهدها المستخدم من قبل
        if (document.getElementById('welcome-overlay') || hasSeenWelcomeScreens()) {
            return;
        }
        
        // إضافة الأنماط
        injectStyles();
        
        // إنشاء العنصر الرئيسي
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.id = 'welcome-overlay';
        welcomeOverlay.className = 'welcome-overlay';
        
        // إضافة شاشة الانتظار
        const splashScreen = createSplashScreen();
        welcomeOverlay.appendChild(splashScreen);
        
        // إضافة شاشات الترحيب
        for (let i = 1; i < welcomeScreens.length; i++) {
            const screen = createWelcomeScreen(welcomeScreens[i], i);
            welcomeOverlay.appendChild(screen);
        }
        
        // إضافة شريط التقدم
        const progressBar = createProgressBar();
        welcomeOverlay.appendChild(progressBar);
        
        // إضافة زر تخطي العرض
        const skipButton = createSkipButton();
        welcomeOverlay.appendChild(skipButton);
        
        // إضافة الشاشات للصفحة
        document.body.appendChild(welcomeOverlay);
        
        // الانتقال للشاشة الأولى بعد الانتظار
        setTimeout(() => {
            goToNextScreen();
            startAutoSlide();
        }, 3500);
        
        // إضافة مستمعي أحداث لوحة المفاتيح
        document.addEventListener('keydown', handleKeyboardNavigation);
    }
    
    // التنقل باستخدام لوحة المفاتيح
    function handleKeyboardNavigation(e) {
        if (e.key === 'Escape') {
            skipIntro();
        }
    }
    
    // محاولة عرض الشاشات عندما تكون الصفحة جاهزة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showWelcomeScreens);
    } else {
        showWelcomeScreens();
    }
    
    // إعادة تعيين حالة العرض الأول (للاختبار)
    function resetFirstTimeView() {
        localStorage.removeItem(firstTimeKey);
        location.reload();
    }
    
    // تصدير الدوال العامة
    window.WelcomeScreens = {
        show: showWelcomeScreens,
        skip: skipIntro,
        resetFirstTime: resetFirstTimeView
    };
})();