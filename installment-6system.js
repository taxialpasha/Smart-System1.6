/**
 * نظام كشف وإصلاح التجمد - لنظام الاستثمار المتكامل
 * يقوم بكشف تجمد واجهة المستخدم ومعالجته تلقائياً
 */

// تهيئة متغيرات النظام
const freezeDetector = {
    config: {
        heartbeatInterval: 2000,       // فحص كل 2 ثانية
        interactionTimeout: 10000,     // اعتبار التطبيق متجمدًا بعد 10 ثوانٍ من عدم الاستجابة
        reconnectAttempts: 3,          // عدد محاولات إعادة الاتصال
        forceReloadTimeout: 30000,     // إعادة تحميل بعد 30 ثانية من التجمد
        inputDeadlineTime: 5000,       // اعتبار الإدخال متجمدًا بعد 5 ثوانٍ
        checkForms: true,              // فحص النماذج والإدخالات
        loggingEnabled: true,          // تفعيل سجل التشخيص
        autoFix: true                  // محاولة إصلاح المشاكل تلقائياً
    },
    state: {
        initialized: false,
        lastHeartbeat: Date.now(),
        lastUserInteraction: Date.now(),
        lastMouseMove: Date.now(),
        lastKeyDown: Date.now(),
        documentReady: false,
        formChecks: 0,
        fixAttempts: 0,
        reloadAttempts: 0,
        activeHeartbeatTimer: null,
        activeForceReloadTimer: null,
        formsMonitored: [],
        currentFreezeTime: 0,
        isFrozen: false,
        inputsBeingTested: new Set(),
        formsBeingTested: new Set(),
        problemInputs: new Set(),
        problemForms: new Set()
    },
    
    /**
     * بدء نظام كشف التجمد
     */
    start() {
        if (this.state.initialized) {
            console.log("نظام كشف التجمد قيد التشغيل بالفعل");
            return;
        }
        
        console.log("بدء تشغيل نظام كشف التجمد...");
        
        // تسجيل آخر تفاعل عند تحميل الصفحة
        this.state.lastHeartbeat = Date.now();
        this.state.lastUserInteraction = Date.now();
        this.state.lastMouseMove = Date.now();
        this.state.lastKeyDown = Date.now();
        
        // إعداد مراقبة تفاعل المستخدم
        this._setupInteractionMonitoring();
        
        // إعداد مراقبة النماذج
        if (this.config.checkForms) {
            this._setupFormMonitoring();
        }
        
        // إعداد مراقبة ضربات القلب
        this._startHeartbeat();
        
        // إضافة معالج للرسائل من عملية Main إذا كنا في بيئة Electron
        this._setupElectronIntegration();
        
        // تسجيل معالجات للأخطاء غير المعالجة
        this._setupErrorHandling();
        
        // إعداد مراقب حالة التطبيق
        this._setupApplicationStateMonitor();
        
        // إعداد معالج للانتقال بين الصفحات للتعامل مع التطبيقات أحادية الصفحة
        this._setupNavigationHandling();
        
        this.state.initialized = true;
        this.log("تم تهيئة نظام كشف التجمد بنجاح");
    },
    
    /**
     * إيقاف نظام كشف التجمد
     */
    stop() {
        if (!this.state.initialized) {
            return;
        }
        
        // إيقاف مؤقتات ضربات القلب
        clearInterval(this.state.activeHeartbeatTimer);
        clearTimeout(this.state.activeForceReloadTimer);
        
        // إزالة مستمعي الأحداث
        document.removeEventListener('mousemove', this._boundUpdateLastMouseMove);
        document.removeEventListener('keydown', this._boundUpdateLastKeyDown);
        document.removeEventListener('click', this._boundUpdateLastUserInteraction);
        document.removeEventListener('touchstart', this._boundUpdateLastUserInteraction);
        document.removeEventListener('scroll', this._boundUpdateLastUserInteraction);
        
        // إزالة مراقبي النماذج
        this._teardownFormMonitoring();
        
        this.state.initialized = false;
        this.log("تم إيقاف نظام كشف التجمد");
    },
    
    /**
     * تحديث ضربة القلب يدويًا
     */
    refresh() {
        const now = Date.now();
        this.state.lastHeartbeat = now;
        this.state.lastUserInteraction = now;
        
        // إذا كان التطبيق متجمدًا، حاول إصلاحه
        if (this.state.isFrozen) {
            this._attemptFixFreeze();
        }
        
        // إعادة فحص النماذج المشكلة
        if (this.config.checkForms && this.state.problemInputs.size > 0) {
            this._recheckProblemForms();
        }
        
        this.log("تم تحديث ضربة القلب يدويًا");
    },
    
    /**
     * تعيين معالج للتجمد مخصص
     * @param {Function} handler - دالة المعالج المخصصة
     */
    setCustomFreezeHandler(handler) {
        if (typeof handler === 'function') {
            this._customFreezeHandler = handler;
            return true;
        }
        return false;
    },
    
    /**
     * تكوين إعدادات كاشف التجمد
     * @param {Object} config - إعدادات التكوين الجديدة
     */
    configure(config) {
        if (typeof config !== 'object') return false;
        
        // دمج الإعدادات الجديدة مع الإعدادات الحالية
        this.config = {
            ...this.config,
            ...config
        };
        
        // إعادة تهيئة المؤقتات إذا تغيرت الفترات الزمنية
        if (this.state.initialized) {
            this._restartHeartbeat();
        }
        
        this.log("تم تحديث إعدادات كاشف التجمد", this.config);
        return true;
    },
    
    /**
     * إعداد مراقبة تفاعل المستخدم
     * @private
     */
    _setupInteractionMonitoring() {
        // تخزين ارتباطات الدوال لاستخدامها في إزالة المستمعين لاحقًا
        this._boundUpdateLastMouseMove = this._updateLastMouseMove.bind(this);
        this._boundUpdateLastKeyDown = this._updateLastKeyDown.bind(this);
        this._boundUpdateLastUserInteraction = this._updateLastUserInteraction.bind(this);
        
        // تسجيل مستمعي الأحداث الرئيسية
        document.addEventListener('mousemove', this._boundUpdateLastMouseMove, { passive: true });
        document.addEventListener('keydown', this._boundUpdateLastKeyDown, { passive: true });
        document.addEventListener('click', this._boundUpdateLastUserInteraction, { passive: true });
        document.addEventListener('touchstart', this._boundUpdateLastUserInteraction, { passive: true });
        document.addEventListener('scroll', this._boundUpdateLastUserInteraction, { passive: true });
        
        // إضافة مستمعي أحداث إضافية للتفاعل مع النماذج
        document.addEventListener('input', this._boundUpdateLastUserInteraction, { passive: true });
        document.addEventListener('change', this._boundUpdateLastUserInteraction, { passive: true });
        document.addEventListener('submit', this._boundUpdateLastUserInteraction, { passive: true });
        
        // إضافة مستمعي أحداث التركيز على النماذج
        document.addEventListener('focus', e => {
            this._updateLastUserInteraction();
            
            // تسجيل العنصر الذي تم التركيز عليه للمراقبة
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
                this._monitorInput(e.target);
            }
        }, { passive: true, capture: true });
        
        this.log("تم إعداد مراقبة تفاعل المستخدم");
    },
    
    /**
     * إعداد مراقبة النماذج
     * @private
     */
    _setupFormMonitoring() {
        // إضافة مراقب DOM لاكتشاف النماذج الجديدة
        this._formObserver = new MutationObserver(mutations => {
            let shouldScanForms = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // التحقق مما إذا كانت العناصر المضافة نماذج أو تحتوي على نماذج
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'FORM' || node.querySelector('form, input, textarea, select')) {
                                shouldScanForms = true;
                                break;
                            }
                        }
                    }
                    
                    if (shouldScanForms) break;
                }
            }
            
            // إذا تم اكتشاف نماذج جديدة، قم بمسح جميع النماذج
            if (shouldScanForms) {
                this._scanForForms();
            }
        });
        
        // بدء مراقبة التغييرات في الصفحة
        this._formObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // المسح الأولي للنماذج الموجودة
        this._scanForForms();
        
        // إضافة معالج لأحداث فتح النوافذ المنبثقة
        document.addEventListener('click', e => {
            // التحقق مما إذا كان النقر على زر يفتح نافذة منبثقة
            const target = e.target.closest('[data-modal], .modal-trigger, [data-target], [data-toggle="modal"]');
            
            if (target) {
                // تأخير المسح للسماح بفتح النافذة المنبثقة أولاً
                setTimeout(() => {
                    this._scanForForms();
                }, 500);
            }
        }, { passive: true });
        
        this.log("تم إعداد مراقبة النماذج");
    },
    
    /**
     * إزالة مراقبي النماذج
     * @private
     */
    _teardownFormMonitoring() {
        if (this._formObserver) {
            this._formObserver.disconnect();
            this._formObserver = null;
        }
        
        // إزالة جميع مراقبي الإدخال
        for (const input of this.state.formsMonitored) {
            input.removeEventListener('input', this._inputEventHandler);
            input.removeEventListener('change', this._inputEventHandler);
            input.removeEventListener('focus', this._inputFocusHandler);
            input.removeEventListener('blur', this._inputBlurHandler);
        }
        
        this.state.formsMonitored = [];
        this.state.inputsBeingTested.clear();
        this.state.formsBeingTested.clear();
        this.state.problemInputs.clear();
        this.state.problemForms.clear();
    },
    
    /**
     * مسح الصفحة بحثًا عن النماذج وعناصر الإدخال
     * @private
     */
    _scanForForms() {
        // العثور على جميع النماذج
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            if (!this.state.formsMonitored.includes(form)) {
                this._monitorForm(form);
            }
        }
        
        // العثور على جميع عناصر الإدخال حتى لو لم تكن داخل نماذج
        const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
        for (const input of inputs) {
            if (!this.state.formsMonitored.includes(input)) {
                this._monitorInput(input);
            }
        }
        
        this.state.formChecks++;
        this.log(`تم مسح النماذج (#${this.state.formChecks}): تم العثور على ${forms.length} نموذج و ${inputs.length} عنصر إدخال`);
    },
    
    /**
     * مراقبة نموذج محدد
     * @param {HTMLFormElement} form - النموذج المراد مراقبته
     * @private
     */
    _monitorForm(form) {
        if (!form || !(form instanceof HTMLFormElement)) return;
        
        // تجنب مراقبة نفس النموذج مرتين
        if (this.state.formsMonitored.includes(form)) return;
        
        // إضافة النموذج إلى قائمة النماذج المراقبة
        this.state.formsMonitored.push(form);
        
        // مراقبة جميع عناصر الإدخال داخل النموذج
        const inputs = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
        for (const input of inputs) {
            this._monitorInput(input);
        }
        
        // إضافة معالج لحدث إرسال النموذج
        form.addEventListener('submit', () => {
            this._updateLastUserInteraction();
        }, { passive: true });
        
        // تخزين الحالة الأصلية للنموذج
        form._freezeDetectorState = {
            originalDisplay: form.style.display,
            monitoredAt: Date.now()
        };
    },
    
    /**
     * مراقبة عنصر إدخال محدد
     * @param {HTMLElement} input - عنصر الإدخال المراد مراقبته
     * @private
     */
    _monitorInput(input) {
        if (!input || !(input instanceof HTMLElement)) return;
        
        // التحقق من أن العنصر هو عنصر إدخال صالح
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(input.tagName)) return;
        
        // تجنب مراقبة نفس عنصر الإدخال مرتين
        if (this.state.formsMonitored.includes(input)) return;
        
        // إضافة عنصر الإدخال إلى قائمة العناصر المراقبة
        this.state.formsMonitored.push(input);
        
        // تسجيل قيمة وتوقيت آخر تحديث
        input._freezeDetectorState = {
            lastValue: input.value,
            lastUpdateTime: Date.now(),
            timesFrozen: 0,
            monitoredAt: Date.now()
        };
        
        // إضافة معالج لأحداث الإدخال
        this._inputEventHandler = () => {
            const now = Date.now();
            
            // تحديث حالة آخر تفاعل
            this._updateLastUserInteraction();
            
            // تحديث حالة عنصر الإدخال
            input._freezeDetectorState.lastValue = input.value;
            input._freezeDetectorState.lastUpdateTime = now;
            
            // إزالة عنصر الإدخال من قائمة العناصر المشكلة إذا كان موجودًا
            if (this.state.problemInputs.has(input)) {
                this.state.problemInputs.delete(input);
                this.log(`تم إصلاح عنصر الإدخال المتجمد: ${this._describeElement(input)}`);
            }
        };
        
        // إضافة معالج للتركيز
        this._inputFocusHandler = () => {
            const now = Date.now();
            input._freezeDetectorState.focusStartTime = now;
            
            // التحقق مما إذا كان عنصر الإدخال مدرجًا في قائمة العناصر المشكلة
            if (this.state.problemInputs.has(input)) {
                // محاولة إصلاح عنصر الإدخال
                this._attemptFixInput(input);
            }
        };
        
        // إضافة معالج لفقدان التركيز
        this._inputBlurHandler = () => {
            // إعادة تعيين توقيت بدء التركيز
            delete input._freezeDetectorState.focusStartTime;
        };
        
        // إضافة مستمعي الأحداث
        input.addEventListener('input', this._inputEventHandler, { passive: true });
        input.addEventListener('change', this._inputEventHandler, { passive: true });
        input.addEventListener('focus', this._inputFocusHandler, { passive: true });
        input.addEventListener('blur', this._inputBlurHandler, { passive: true });
    },
    
    /**
     * إعادة فحص النماذج والعناصر التي تم تحديدها كمشكلة سابقًا
     * @private
     */
    _recheckProblemForms() {
        // نسخ مجموعة العناصر المشكلة لتجنب تعديلها أثناء الدوران
        const problemInputsToCheck = [...this.state.problemInputs];
        
        for (const input of problemInputsToCheck) {
            // التحقق من أن العنصر لا يزال موجودًا في الصفحة
            if (!document.body.contains(input)) {
                this.state.problemInputs.delete(input);
                continue;
            }
            
            // محاولة التفاعل مع العنصر وإعادة اختباره
            this._attemptFixInput(input);
        }
    },
    
    /**
     * محاولة إصلاح عنصر إدخال متجمد
     * @param {HTMLElement} input - عنصر الإدخال المراد إصلاحه
     * @private
     */
    _attemptFixInput(input) {
        if (!input || !this.config.autoFix) return;
        
        // تجنب محاولة إصلاح نفس العنصر مرتين في نفس الوقت
        if (this.state.inputsBeingTested.has(input)) return;
        
        this.state.inputsBeingTested.add(input);
        
        try {
            // محاولة إصلاح العنصر باستخدام عدة أساليب
            const originalValue = input.value;
            const originalDisplay = input.style.display;
            const originalVisibility = input.style.visibility;
            
            // 1. محاولة التركيز على العنصر وإزالة التركيز منه
            input.focus();
            setTimeout(() => {
                input.blur();
                
                // 2. محاولة تغيير القيمة ثم إعادتها
                const testValue = originalValue + ' ';
                input.value = testValue;
                
                // التحقق مما إذا تم تطبيق التغيير
                if (input.value === testValue) {
                    // إعادة القيمة الأصلية
                    input.value = originalValue;
                    
                    // تحديث حالة العنصر
                    if (input._freezeDetectorState) {
                        input._freezeDetectorState.lastValue = originalValue;
                        input._freezeDetectorState.lastUpdateTime = Date.now();
                    }
                    
                    // إزالة العنصر من قائمة العناصر المشكلة
                    this.state.problemInputs.delete(input);
                    this.log(`تم إصلاح عنصر الإدخال: ${this._describeElement(input)}`);
                } else {
                    // 3. محاولة إعادة إنشاء العنصر إذا لم تنجح الأساليب الأخرى
                    this._recreateElement(input);
                }
                
                // إزالة العنصر من قائمة العناصر التي يتم اختبارها
                this.state.inputsBeingTested.delete(input);
            }, 100);
        } catch (error) {
            this.log(`فشل في إصلاح عنصر الإدخال: ${this._describeElement(input)}`, 'error');
            this.state.inputsBeingTested.delete(input);
        }
    },
    
    /**
     * إعادة إنشاء عنصر في الصفحة
     * @param {HTMLElement} element - العنصر المراد إعادة إنشائه
     * @private
     */
    _recreateElement(element) {
        if (!element || !element.parentNode) return;
        
        try {
            // نسخ العنصر مع جميع السمات
            const clone = element.cloneNode(true);
            
            // نسخ قيم الإدخال
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
                clone.value = element.value;
            }
            
            // نسخ معالجات الأحداث (لا يتم نسخها بواسطة cloneNode)
            // ملاحظة: هذا قد لا يعمل مع جميع معالجات الأحداث المضافة بواسطة JavaScript
            
            // استبدال العنصر الأصلي بالنسخة الجديدة
            element.parentNode.replaceChild(clone, element);
            
            // مراقبة العنصر الجديد
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(clone.tagName)) {
                this._monitorInput(clone);
            } else if (clone.tagName === 'FORM') {
                this._monitorForm(clone);
            }
            
            this.log(`تمت إعادة إنشاء العنصر: ${this._describeElement(element)}`);
            return true;
        } catch (error) {
            this.log(`فشل في إعادة إنشاء العنصر: ${this._describeElement(element)}`, 'error');
            return false;
        }
    },
    
    /**
     * بدء مراقبة ضربات القلب
     * @private
     */
    _startHeartbeat() {
        // إيقاف المؤقت الحالي إذا كان موجودًا
        if (this.state.activeHeartbeatTimer) {
            clearInterval(this.state.activeHeartbeatTimer);
        }
        
        // بدء مؤقت جديد
        this.state.activeHeartbeatTimer = setInterval(() => {
            this._checkHeartbeat();
        }, this.config.heartbeatInterval);
        
        this.log("تم بدء مراقبة ضربات القلب");
    },
    
    /**
     * إعادة تشغيل مراقبة ضربات القلب
     * @private
     */
    _restartHeartbeat() {
        this._startHeartbeat();
    },
    
    /**
     * التحقق من ضربات القلب ومعالجة حالات التجمد المحتملة
     * @private
     */
    _checkHeartbeat() {
        const now = Date.now();
        const timeSinceLastInteraction = now - this.state.lastUserInteraction;
        
        // لا نقوم بفحص التجمد إذا لم يتفاعل المستخدم مع التطبيق لفترة طويلة
        // هذا لتجنب اعتبار عدم نشاط المستخدم كتجمد
        if (timeSinceLastInteraction > this.config.interactionTimeout * 3) {
            // لكن لا يزال يجب علينا تحديث ضربة القلب
            this._sendHeartbeat();
            return;
        }
        
        // فحص حالة التجمد
        if (!this.state.isFrozen && timeSinceLastInteraction > this.config.interactionTimeout) {
            // التطبيق قد يكون متجمدًا
            this._handlePotentialFreeze();
        } else if (this.state.isFrozen && timeSinceLastInteraction <= this.config.interactionTimeout) {
            // التطبيق تعافى من التجمد
            this._handleFreezeRecovery();
        }
        
        // إرسال ضربة قلب لعملية Main في Electron
        this._sendHeartbeat();
        
        // فحص النماذج المتجمدة إذا كانت هذه الميزة مفعلة
        if (this.config.checkForms) {
            this._checkForFrozenInputs();
        }
    },
    
    /**
     * التعامل مع حالة تجمد محتملة
     * @private
     */
    _handlePotentialFreeze() {
        // تحديث حالة التجمد
        this.state.isFrozen = true;
        this.state.currentFreezeTime = Date.now() - this.state.lastUserInteraction;
        
        this.log(`اكتشاف تجمد محتمل (${this.state.currentFreezeTime}ms منذ آخر تفاعل)`, 'warn');
        
        // إذا كان هناك معالج مخصص، استخدمه
        if (this._customFreezeHandler) {
            this._customFreezeHandler('potential', this.state.currentFreezeTime);
        }
        
        // محاولة إصلاح التجمد
        if (this.config.autoFix) {
            this._attemptFixFreeze();
        }
        
        // إعداد مؤقت لإعادة تحميل الصفحة قسريًا إذا استمر التجمد
        if (this.config.forceReloadTimeout > 0 && !this.state.activeForceReloadTimer) {
            this.state.activeForceReloadTimer = setTimeout(() => {
                // التحقق مما إذا كان التجمد لا يزال مستمرًا
                if (this.state.isFrozen) {
                    this._handleSevereFreeze();
                }
                this.state.activeForceReloadTimer = null;
            }, this.config.forceReloadTimeout);
        }
    },
    
    /**
     * التعامل مع التعافي من حالة التجمد
     * @private
     */
    _handleFreezeRecovery() {
        const frozenDuration = this.state.currentFreezeTime;
        
        // إعادة تعيين حالة التجمد
        this.state.isFrozen = false;
        this.state.currentFreezeTime = 0;
        
        // إلغاء مؤقت إعادة التحميل القسري إذا كان موجودًا
        if (this.state.activeForceReloadTimer) {
            clearTimeout(this.state.activeForceReloadTimer);
            this.state.activeForceReloadTimer = null;
        }
        
        this.log(`التعافي من التجمد (استمر لمدة ${frozenDuration}ms)`);
        
        // إذا كان هناك معالج مخصص، استخدمه
        if (this._customFreezeHandler) {
            this._customFreezeHandler('recovery', frozenDuration);
        }
        
        // إعادة فحص النماذج المشكلة
        if (this.config.checkForms) {
            this._recheckProblemForms();
        }
    },
    
    /**
     * التعامل مع حالة تجمد شديدة
     * @private
     */
    _handleSevereFreeze() {
        this.log(`تجمد شديد اكتشف (${this.state.currentFreezeTime}ms)! محاولة استعادة التطبيق...`, 'error');
        
        // إذا كان هناك معالج مخصص، استخدمه
        if (this._customFreezeHandler) {
            this._customFreezeHandler('severe', this.state.currentFreezeTime);
        }
        
        // محاولة إصلاح التجمد مرة أخرى
        this._attemptFixFreeze(true);
        
        // إذا وصلنا إلى الحد الأقصى من محاولات إعادة الاتصال، إعادة تحميل الصفحة
        if (++this.state.reloadAttempts >= this.config.reconnectAttempts) {
            this.log(`فشلت ${this.state.reloadAttempts} محاولات لإصلاح التجمد. إعادة تحميل الصفحة...`, 'error');
            this._forcePageReload();
        }
    },
    
    /**
     * محاولة إصلاح التجمد
     * @param {boolean} isSevere - ما إذا كان التجمد شديدًا
     * @private
     */
    _attemptFixFreeze(isSevere = false) {
        this.state.fixAttempts++;
        this.log(`محاولة إصلاح التجمد (#${this.state.fixAttempts})${isSevere ? ' (شديد)' : ''}...`);
        
        try {
            // 1. محاولة تشغيل جامع المهملات في المتصفح
            if (window.gc) {
                window.gc();
                this.log("تم استدعاء جامع المهملات");
            }
            
            // 2. إعادة إنشاء أي مؤقتات متوقفة
            this._restartHeartbeat();
            
            // 3. إعادة تنشيط النماذج المتجمدة
            if (this.config.checkForms) {
                this._recheckProblemForms();
                
                // إعادة إنشاء النماذج المتجمدة في حالة التجمد الشديد
                if (isSevere) {
                    for (const form of this.state.problemForms) {
                        this._recreateElement(form);
                    }
                    
                    for (const input of this.state.problemInputs) {
                        this._recreateElement(input);
                    }
                }
            }
            
            // 4. محاولة إعادة تهيئة معالجات الأحداث
            if (window.initEventListeners && typeof window.initEventListeners === 'function') {
                try {
                    window.initEventListeners();
                    this.log("تم استدعاء initEventListeners()");
                } catch (e) {
                    this.log("فشل في استدعاء initEventListeners(): " + e.message, 'error');
                }
            }
            
            // 5. محاولة استدعاء دالة تحديث لوحة التحكم إذا كانت موجودة
            if (window.updateDashboard && typeof window.updateDashboard === 'function') {
                try {
                    window.updateDashboard();
                    this.log("تم استدعاء updateDashboard()");
                } catch (e) {
                    this.log("فشل في استدعاء updateDashboard(): " + e.message, 'error');
                }
            }
            
            // 6. في حالة التجمد الشديد، محاولة إعادة تحميل البيانات
            if (isSevere && window.loadData && typeof window.loadData === 'function') {
                try {
                    window.loadData();
                    this.log("تم استدعاء loadData()");
                } catch (e) {
                    this.log("فشل في استدعاء loadData(): " + e.message, 'error');
                }
            }
            
            // 7. إعادة رسم الجداول إذا كانت الدوال موجودة
            const renderFunctions = [
                'renderInvestorsTable',
                'renderTransactionsTable',
                'renderProfitsTable',
                'renderRecentTransactions'
            ];
            
            for (const funcName of renderFunctions) {
                if (window[funcName] && typeof window[funcName] === 'function') {
                    try {
                        window[funcName]();
                        this.log(`تم استدعاء ${funcName}()`);
                    } catch (e) {
                        this.log(`فشل في استدعاء ${funcName}(): ${e.message}`, 'error');
                    }
                }
            }
            
            // 8. تحديث قوائم المستثمرين إذا كانت الدالة موجودة
            if (window.populateInvestorSelects && typeof window.populateInvestorSelects === 'function') {
                try {
                    window.populateInvestorSelects();
                    this.log("تم استدعاء populateInvestorSelects()");
                } catch (e) {
                    this.log("فشل في استدعاء populateInvestorSelects(): " + e.message, 'error');
                }
            }
            
            // 9. تحديث حالة التطبيق المخزنة
            this.state.lastHeartbeat = Date.now();
            this.state.lastUserInteraction = Date.now();
            
            // 10. إعلام عملية Main بمحاولة الإصلاح
            this._sendHeartbeat();
            
            return true;
        } catch (error) {
            this.log(`فشل في محاولة إصلاح التجمد: ${error.message}`, 'error');
            
            // في حالة الفشل الكامل، محاولة إعادة تحميل الصفحة
            if (isSevere) {
                this._forcePageReload();
            }
            
            return false;
        }
    },
    
    /**
     * فحص العناصر المدخلة بحثًا عن حالات التجمد
     * @private
     */
    _checkForFrozenInputs() {
        const now = Date.now();
        
        // نسخة من قائمة العناصر المراقبة لتجنب تعديلها أثناء الدوران
        const formsToCheck = [...this.state.formsMonitored];
        
        for (const element of formsToCheck) {
            // تجاهل العناصر التي يتم اختبارها حاليًا
            if (this.state.inputsBeingTested.has(element) || this.state.formsBeingTested.has(element)) {
                continue;
            }
            
            // التحقق من أن العنصر لا يزال موجودًا في DOM
            if (!document.body.contains(element)) {
                // إزالة العنصر من قائمة العناصر المراقبة
                const index = this.state.formsMonitored.indexOf(element);
                if (index > -1) {
                    this.state.formsMonitored.splice(index, 1);
                }
                this.state.problemInputs.delete(element);
                this.state.problemForms.delete(element);
                continue;
            }
            
            // التحقق مما إذا كان العنصر مدخلاً
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
                this._checkInputForFreeze(element, now);
            }
            // التحقق مما إذا كان العنصر نموذجًا
            else if (element.tagName === 'FORM') {
                this._checkFormForFreeze(element, now);
            }
        }
    },
    
    /**
     * التحقق مما إذا كان عنصر إدخال متجمدًا
     * @param {HTMLElement} input - عنصر الإدخال المراد فحصه
     * @param {number} now - الوقت الحالي
     * @private
     */
    _checkInputForFreeze(input, now) {
        // التحقق من وجود بيانات المراقبة
        if (!input._freezeDetectorState) return;
        
        // التحقق مما إذا كان المستخدم يركز على العنصر حاليًا
        const isFocused = document.activeElement === input;
        
        // إذا كان العنصر مركزًا والمستخدم لم يغير قيمته لفترة طويلة
        if (isFocused && input._freezeDetectorState.focusStartTime) {
            const timeInFocus = now - input._freezeDetectorState.focusStartTime;
            
            // التحقق مما إذا كان المستخدم يحاول الكتابة (تم الضغط على المفاتيح مؤخرًا)
            // لكن قيمة العنصر لم تتغير
            const timeSinceLastKeyDown = now - this.state.lastKeyDown;
            
            if (timeInFocus > this.config.inputDeadlineTime && 
                timeSinceLastKeyDown < 1000 && 
                input._freezeDetectorState.lastValue === input.value) {
                // العنصر قد يكون متجمدًا
                
                if (!this.state.problemInputs.has(input)) {
                    input._freezeDetectorState.timesFrozen++;
                    this.state.problemInputs.add(input);
                    this.log(`اكتشاف عنصر إدخال متجمد: ${this._describeElement(input)} (المرة #${input._freezeDetectorState.timesFrozen})`, 'warn');
                    
                    if (this.config.autoFix) {
                        this._attemptFixInput(input);
                    }
                }
            }
        }
    },
    
    /**
     * التحقق مما إذا كان نموذج متجمدًا
     * @param {HTMLFormElement} form - النموذج المراد فحصه
     * @param {number} now - الوقت الحالي
     * @private
     */
    _checkFormForFreeze(form, now) {
        // التحقق من وجود بيانات المراقبة
        if (!form._freezeDetectorState) return;
        
        // فحص كل عنصر إدخال داخل النموذج
        const inputs = form.querySelectorAll('input, textarea, select');
        let frozenInputsCount = 0;
        
        for (const input of inputs) {
            if (this.state.problemInputs.has(input)) {
                frozenInputsCount++;
            }
        }
        
        // إذا كانت نسبة العناصر المتجمدة عالية، فقد يكون النموذج بأكمله متجمدًا
        if (inputs.length > 0 && frozenInputsCount > inputs.length / 3) {
            if (!this.state.problemForms.has(form)) {
                this.state.problemForms.add(form);
                this.log(`اكتشاف نموذج متجمد: ${this._describeElement(form)} (${frozenInputsCount}/${inputs.length} عناصر متجمدة)`, 'warn');
                
                if (this.config.autoFix) {
                    this._attemptFixForm(form);
                }
            }
        } else if (this.state.problemForms.has(form)) {
            // إزالة النموذج من قائمة النماذج المشكلة إذا تحسن
            this.state.problemForms.delete(form);
        }
    },
    
    /**
     * محاولة إصلاح نموذج متجمد
     * @param {HTMLFormElement} form - النموذج المراد إصلاحه
     * @private
     */
    _attemptFixForm(form) {
        if (!form || !this.config.autoFix) return;
        
        // تجنب محاولة إصلاح نفس النموذج مرتين في نفس الوقت
        if (this.state.formsBeingTested.has(form)) return;
        
        this.state.formsBeingTested.add(form);
        
        try {
            // محاولة إعادة تهيئة معالجات الأحداث للنموذج
            const inputs = form.querySelectorAll('input, textarea, select');
            
            for (const input of inputs) {
                // محاولة إصلاح كل عنصر إدخال في النموذج
                if (this.state.problemInputs.has(input)) {
                    this._attemptFixInput(input);
                }
            }
            
            // محاولة إعادة إرسال حدث إرسال النموذج الوهمي لإعادة تهيئة النموذج
            try {
                const mockEvent = new Event('reset', { bubbles: true, cancelable: true });
                form.dispatchEvent(mockEvent);
            } catch (e) {
                // تجاهل الأخطاء
            }
            
            // في حالة فشل جميع المحاولات، إعادة إنشاء النموذج
            if (this.state.problemInputs.size > 0) {
                this._recreateElement(form);
            }
            
            setTimeout(() => {
                this.state.formsBeingTested.delete(form);
            }, 500);
        } catch (error) {
            this.log(`فشل في إصلاح النموذج: ${this._describeElement(form)}`, 'error');
            this.state.formsBeingTested.delete(form);
        }
    },
    
    /**
     * إجبار إعادة تحميل الصفحة
     * @private
     */
    _forcePageReload() {
        this.log('إجبار إعادة تحميل الصفحة...', 'warn');
        
        // محاولة إعلام عملية Main بإعادة التحميل القسري
        this._sendForceReload();
        
        // تأخير قصير قبل إعادة التحميل لإتاحة الوقت لإرسال الرسالة
        setTimeout(() => {
            // إعادة تحميل الصفحة مع تجاهل ذاكرة التخزين المؤقت
            window.location.reload(true);
        }, 100);
    },
    
    /**
     * تحديث آخر وقت لتحريك الماوس
     * @private
     */
    _updateLastMouseMove() {
        this.state.lastMouseMove = Date.now();
        this._updateLastUserInteraction();
    },
    
    /**
     * تحديث آخر وقت للضغط على المفاتيح
     * @private
     */
    _updateLastKeyDown() {
        this.state.lastKeyDown = Date.now();
        this._updateLastUserInteraction();
    },
    
    /**
     * تحديث آخر وقت لتفاعل المستخدم
     * @private
     */
    _updateLastUserInteraction() {
        this.state.lastUserInteraction = Date.now();
    },
    
    /**
     * إنشاء وصف لعنصر DOM
     * @param {HTMLElement} element - العنصر المراد وصفه
     * @returns {string} وصف العنصر
     * @private
     */
    _describeElement(element) {
        if (!element) return 'عنصر غير معروف';
        
        let description = element.tagName.toLowerCase();
        
        if (element.id) {
            description += `#${element.id}`;
        } else if (element.name) {
            description += `[name="${element.name}"]`;
        } else if (element.className) {
            const mainClass = element.className.split(' ')[0];
            if (mainClass) {
                description += `.${mainClass}`;
            }
        }
        
        return description;
    },
    
    /**
     * إرسال ضربة قلب إلى عملية Main في Electron
     * @private
     */
    _sendHeartbeat() {
        try {
            // التحقق مما إذا كنا في بيئة Electron
            if (window.ipcRenderer) {
                window.ipcRenderer.send('app-heartbeat', {
                    timestamp: Date.now(),
                    state: {
                        isFrozen: this.state.isFrozen,
                        lastInteraction: this.state.lastUserInteraction,
                        fixAttempts: this.state.fixAttempts,
                        problemInputsCount: this.state.problemInputs.size,
                        problemFormsCount: this.state.problemForms.size
                    }
                });
            }
            
            // التحقق مما إذا كنا نستخدم واجهة electronAPI المقدمة من preload
            if (window.electronAPI && window.electronAPI.sendHeartbeat) {
                window.electronAPI.sendHeartbeat({
                    timestamp: Date.now(),
                    isFrozen: this.state.isFrozen
                });
            }
        } catch (error) {
            // تجاهل الأخطاء في إرسال ضربة القلب
        }
    },
    
    /**
     * إرسال طلب إعادة تحميل قسري إلى عملية Main
     * @private
     */
    _sendForceReload() {
        try {
            // التحقق مما إذا كنا في بيئة Electron
            if (window.ipcRenderer) {
                window.ipcRenderer.send('force-reload');
            }
            
            // التحقق مما إذا كنا نستخدم واجهة electronAPI المقدمة من preload
            if (window.electronAPI && window.electronAPI.forceReload) {
                window.electronAPI.forceReload();
            }
        } catch (error) {
            // تجاهل الأخطاء في إرسال طلب إعادة التحميل
        }
    },
    
    /**
     * إعداد تكامل Electron
     * @private
     */
    _setupElectronIntegration() {
        // التحقق مما إذا كنا في بيئة Electron
        if (window.ipcRenderer || (window.electronAPI && window.electronAPI.sendHeartbeat)) {
            this.log("تم اكتشاف بيئة Electron، إعداد التكامل...");
            
            // إنشاء دالة لإعادة تحميل الصفحة
            window.reloadPage = () => {
                this._forcePageReload();
            };
            
            // استماع لطلبات إعادة تحميل من عملية Main
            if (window.ipcRenderer) {
                try {
                    window.ipcRenderer.on('request-reload', () => {
                        this.log("تم استلام طلب إعادة تحميل من عملية Main");
                        this._forcePageReload();
                    });
                } catch (error) {
                    this.log("فشل في إعداد مستمع طلب إعادة التحميل", 'error');
                }
            }
        }
    },
    
    /**
     * إعداد معالجة الأخطاء غير المعالجة
     * @private
     */
    _setupErrorHandling() {
        // معالجة الأخطاء غير المعالجة
        window.addEventListener('error', (event) => {
            this.log(`خطأ غير معالج: ${event.message} في ${event.filename}:${event.lineno}:${event.colno}`, 'error');
            
            // التحقق مما إذا كان الخطأ متعلقًا بالتجمد
            if (this._isFreezingError(event.message) || this._isFreezingError(event.error?.message)) {
                // تحديث حالة التجمد
                this.state.isFrozen = true;
                this.state.currentFreezeTime = Date.now() - this.state.lastUserInteraction;
                
                if (this.config.autoFix) {
                    this._attemptFixFreeze(true);
                }
            }
            
            // إرسال الخطأ إلى عملية Main إذا كنا في بيئة Electron
            try {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send('unhandled-error', {
                        message: event.message,
                        stack: event.error?.stack,
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno
                    });
                }
            } catch (e) {
                // تجاهل أخطاء الإرسال
            }
        });
        
        // معالجة الوعود المرفوضة غير المعالجة
        window.addEventListener('unhandledrejection', (event) => {
            const reason = event.reason?.message || String(event.reason);
            this.log(`وعد مرفوض غير معالج: ${reason}`, 'error');
            
            // إرسال الخطأ إلى عملية Main إذا كنا في بيئة Electron
            try {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send('unhandled-rejection', {
                        reason: reason,
                        stack: event.reason?.stack
                    });
                }
            } catch (e) {
                // تجاهل أخطاء الإرسال
            }
        });
    },
    
    /**
     * إعداد مراقب حالة التطبيق
     * @private
     */
    _setupApplicationStateMonitor() {
        // معالجة حدث الخمول
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.log("التطبيق في الخلفية");
            } else {
                this.log("التطبيق في المقدمة، تحديث ضربة القلب");
                this._updateLastUserInteraction();
            }
        });
        
        // معالجة حدث اكتمال تحميل المستند
        document.addEventListener('DOMContentLoaded', () => {
            this.state.documentReady = true;
            this.log("اكتمل تحميل DOM، مسح النماذج والإدخالات");
            
            if (this.config.checkForms) {
                this._scanForForms();
            }
            
            // إرسال إشعار بجاهزية DOM
            try {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send('dom-ready');
                }
                
                if (window.electronAPI && window.electronAPI.domReady) {
                    window.electronAPI.domReady();
                }
            } catch (e) {
                // تجاهل أخطاء الإرسال
            }
        });
        
        // معالجة حدث اكتمال تحميل الصفحة
        window.addEventListener('load', () => {
            this.log("اكتمل تحميل الصفحة");
            this._updateLastUserInteraction();
            
            // مسح إضافي للنماذج بعد اكتمال تحميل الصفحة
            if (this.config.checkForms) {
                setTimeout(() => {
                    this._scanForForms();
                }, 500);
            }
        });
        
        // معالجة حدث عدم الاتصال بالشبكة
        window.addEventListener('offline', () => {
            this.log("تم فقد الاتصال بالشبكة", 'warn');
        });
        
        // معالجة حدث استعادة الاتصال بالشبكة
        window.addEventListener('online', () => {
            this.log("تمت استعادة الاتصال بالشبكة");
        });
    },
    
    /**
     * إعداد معالجة الانتقال بين الصفحات للتطبيقات أحادية الصفحة
     * @private
     */
    _setupNavigationHandling() {
        // مراقبة الانتقال بين صفحات التطبيق
        document.addEventListener('click', (event) => {
            // التحقق من النقر على روابط التنقل
            const navLink = event.target.closest('[data-page], .nav-link');
            
            if (navLink) {
                const pageId = navLink.getAttribute('data-page') || navLink.getAttribute('href')?.replace('#', '');
                
                if (pageId) {
                    this.log(`تم الانتقال إلى الصفحة: ${pageId}`);
                    this._updateLastUserInteraction();
                    
                    // تأخير مسح النماذج للسماح بتحميل الصفحة الجديدة
                    if (this.config.checkForms) {
                        setTimeout(() => {
                            this._scanForForms();
                        }, 500);
                    }
                }
            }
        }, { passive: true });
        
        // الاستماع لحدث تغيير الصفحة المخصص (للتطبيقات أحادية الصفحة)
        document.addEventListener('page:change', (event) => {
            if (event.detail && event.detail.page) {
                this.log(`تم تغيير الصفحة إلى: ${event.detail.page}`);
                this._updateLastUserInteraction();
                
                // تأخير مسح النماذج للسماح بتحميل الصفحة الجديدة
                if (this.config.checkForms) {
                    setTimeout(() => {
                        this._scanForForms();
                    }, 500);
                }
            }
        });
    },
    
    /**
     * التحقق مما إذا كان الخطأ متعلقًا بالتجمد
     * @param {string} errorMessage - رسالة الخطأ
     * @returns {boolean} ما إذا كان الخطأ متعلقًا بالتجمد
     * @private
     */
    _isFreezingError(errorMessage) {
        if (!errorMessage) return false;
        
        // قائمة بالعبارات المتعلقة بأخطاء التجمد
        const freezeErrorPatterns = [
            'تجمد',
            'freeze',
            'not responding',
            'unresponsive',
            'script timeout',
            'maximum call stack',
            'out of memory',
            'memory limit',
            'stack overflow',
            'script taking too long',
            'async timeout',
            'Maximum update depth exceeded',
            'يرجى إعادة تحميل',
            'refresh',
            'reload'
        ];
        
        // التحقق مما إذا كانت رسالة الخطأ تحتوي على أي من العبارات المتعلقة بالتجمد
        return freezeErrorPatterns.some(pattern => 
            errorMessage.toLowerCase().includes(pattern.toLowerCase())
        );
    },
    
    /**
     * تسجيل رسالة في وحدة التحكم
     * @param {string} message - الرسالة المراد تسجيلها
     * @param {string} [level='info'] - مستوى السجل (info, warn, error)
     */
    log(message, level = 'info') {
        if (!this.config.loggingEnabled) return;
        
        const prefix = '[نظام كشف التجمد]';
        
        switch (level) {
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    }
};

// إضافة freezeDetector إلى window للوصول إليه عالميًا
window.freezeDetector = freezeDetector;

// بدء النظام تلقائيًا عند تحميل النافذة
window.addEventListener('load', () => {
    // تأخير قصير لضمان تحميل جميع المكونات
    setTimeout(() => {
        // بدء نظام كشف التجمد
        window.freezeDetector.start();
        
        // إرسال ضربة قلب أولية
        window.freezeDetector._sendHeartbeat();
        
        // إنشاء إشعار أولي إذا كان مفعلاً في الإعدادات
        if (window.freezeDetector.config.loggingEnabled) {
            console.log('[نظام كشف التجمد] تم بدء نظام كشف ومعالجة التجمد بنجاح.');
        }
        
        // إضافة زر إصلاح التجمد إلى الصفحة
        if (window.freezeDetector.config.autoFix) {
            addFreezeFixButton();
        }
    }, 500);
});

/**
 * إضافة زر إصلاح التجمد إلى الصفحة
 */
function addFreezeFixButton() {
    // التحقق من وجود الزر مسبقاً
    if (document.getElementById('freeze-fix-button')) {
        return;
    }
    
    // إنشاء زر إصلاح التجمد
    const button = document.createElement('button');
    button.id = 'freeze-fix-button';
    button.className = 'freeze-fix-button';
    button.title = 'إصلاح تجمد الواجهة';
    button.innerHTML = '<i class="fas fa-sync-alt"></i>';
    
    // إضافة أنماط CSS للزر
    const style = document.createElement('style');
    style.textContent = `
        .freeze-fix-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f44336;
            color: white;
            border: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-size: 18px;
            opacity: 0;
            transform: scale(0);
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .freeze-fix-button.visible {
            opacity: 1;
            transform: scale(1);
        }
        
        .freeze-fix-button:hover {
            background-color: #d32f2f;
        }
        
        .freeze-fix-button:active {
            transform: scale(0.95);
        }
        
        .freeze-fix-button i {
            animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    // إضافة الأنماط والزر إلى الصفحة
    document.head.appendChild(style);
    document.body.appendChild(button);
    
    // إضافة مستمع لحدث النقر على الزر
    button.addEventListener('click', () => {
        // تطبيق تحديث واجهة المستخدم
        if (window.freezeDetector) {
            window.freezeDetector.refresh();
            window.freezeDetector._attemptFixFreeze(true);
        }
        
        // إذا كانت هناك دالة تحديث صفحة من preload.js
        if (window.electronAPI && window.electronAPI.refreshPage) {
            window.electronAPI.refreshPage();
        }
        
        // عرض إشعار نجاح الإصلاح
        if (window.showNotification) {
            window.showNotification('تم محاولة إصلاح تجمد الواجهة', 'info');
        } else {
            alert('تم محاولة إصلاح تجمد الواجهة');
        }
    });
    
    // إظهار الزر عند اكتشاف تجمد
    window.freezeDetector.setCustomFreezeHandler((status, duration) => {
        if (status === 'potential' || status === 'severe') {
            button.classList.add('visible');
        } else if (status === 'recovery') {
            button.classList.remove('visible');
        }
    });
}

/**
 * مصلح النماذج - يساعد في إصلاح مشاكل النماذج وعناصر الإدخال
 */
const formFixer = {
    config: {
        reinitializeOnFocus: true,
        fixInputsOnSubmit: true,
        reloadAllHandlersOnFix: true,
        monitorModalForms: true
    },
    
    /**
     * تهيئة مصلح النماذج
     */
    init() {
        console.log('[مصلح النماذج] بدء نظام إصلاح النماذج...');
        
        // البحث عن الأزرار التي تفتح نوافذ منبثقة وإضافة معالجات لها
        this._setupModalTriggers();
        
        // إضافة معالجات لحدث إرسال النماذج
        this._setupFormSubmitHandlers();
        
        // إضافة معالجات لحدث التركيز على عناصر الإدخال
        this._setupInputFocusHandlers();
        
        // مراقبة النوافذ المنبثقة
        if (this.config.monitorModalForms) {
            this._setupModalObserver();
        }
        
        // إضافة معالج للنقر على الزر العائم إذا كان موجوداً
        const fab = document.getElementById('add-new-fab');
        if (fab) {
            fab.addEventListener('click', () => {
                // تأخير قصير لإعطاء وقت للنافذة المنبثقة للظهور
                setTimeout(() => {
                    this._reinitializeAllInputs();
                }, 300);
            });
        }
        
        console.log('[مصلح النماذج] تم تهيئة نظام إصلاح النماذج بنجاح');
    },
    
    /**
     * تحديث وإصلاح النماذج
     */
    refresh() {
        console.log('[مصلح النماذج] تحديث النماذج...');
        
        // إعادة تهيئة جميع عناصر الإدخال
        this._reinitializeAllInputs();
        
        // إعادة تهيئة معالجات النماذج
        this._reinitializeFormHandlers();
        
        // إعادة تهيئة معالجات النوافذ المنبثقة
        this._reinitializeModalHandlers();
        
        console.log('[مصلح النماذج] تم تحديث النماذج بنجاح');
    },
    
    /**
     * إعداد مراقب للنوافذ المنبثقة
     * @private
     */
    _setupModalObserver() {
        // إنشاء مراقب DOM للنوافذ المنبثقة
        const modalObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // التحقق من النوافذ المنبثقة التي تم فتحها
                    if (mutation.target.classList.contains('active') || 
                        mutation.target.classList.contains('show')) {
                        // تأخير قصير لضمان اكتمال تحميل النافذة المنبثقة
                        setTimeout(() => {
                            this._handleModalOpened(mutation.target);
                        }, 100);
                    }
                }
            }
        });
        
        // البحث عن جميع النوافذ المنبثقة المحتملة ومراقبتها
        const modals = document.querySelectorAll('.modal-overlay, .modal, .modal-dialog');
        modals.forEach(modal => {
            modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
        });
    },
    
    /**
     * معالجة فتح النافذة المنبثقة
     * @param {HTMLElement} modal - النافذة المنبثقة
     * @private
     */
    _handleModalOpened(modal) {
        console.log('[مصلح النماذج] تم اكتشاف نافذة منبثقة مفتوحة، إعادة تهيئة النماذج...');
        
        // البحث عن النماذج في النافذة المنبثقة
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            this._reinitializeForm(form);
        });
        
        // البحث عن عناصر الإدخال في النافذة المنبثقة
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this._reinitializeInput(input);
        });
        
        // إطلاق حدث مخصص لتنبيه النظام أن النافذة المنبثقة تم فتحها
        const event = new CustomEvent('modal:opened', { 
            detail: { modalId: modal.id },
            bubbles: true,
            cancelable: true 
        });
        document.dispatchEvent(event);
    },
    
    /**
     * إعداد معالجات لأزرار فتح النوافذ المنبثقة
     * @private
     */
    _setupModalTriggers() {
        // البحث عن جميع أزرار فتح النوافذ المنبثقة
        const modalTriggers = document.querySelectorAll('[data-modal], .modal-trigger, [data-target], [data-toggle="modal"]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', event => {
                // الحصول على معرف النافذة المنبثقة
                const modalId = trigger.getAttribute('data-modal') || 
                                trigger.getAttribute('data-target')?.replace('#', '') ||
                                trigger.getAttribute('href')?.replace('#', '');
                
                if (modalId) {
                    // تأخير قصير لضمان فتح النافذة المنبثقة أولاً
                    setTimeout(() => {
                        const modal = document.getElementById(modalId);
                        if (modal) {
                            this._handleModalOpened(modal);
                        }
                    }, 300);
                }
            });
        });
    },
    
    /**
     * إعداد معالجات لحدث إرسال النماذج
     * @private
     */
    _setupFormSubmitHandlers() {
        // البحث عن جميع النماذج
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // التحقق من عدم وجود معالج مسبق
            if (!form._formFixerHandlersAttached) {
                form.addEventListener('submit', event => {
                    // إصلاح جميع عناصر الإدخال قبل إرسال النموذج
                    if (this.config.fixInputsOnSubmit) {
                        const inputs = form.querySelectorAll('input, textarea, select');
                        inputs.forEach(input => {
                            this._reinitializeInput(input);
                        });
                    }
                });
                
                // تعليم النموذج بأنه تمت إضافة المعالجات
                form._formFixerHandlersAttached = true;
            }
        });
    },
    
    /**
     * إعداد معالجات لحدث التركيز على عناصر الإدخال
     * @private
     */
    _setupInputFocusHandlers() {
        // مستمع أحداث عام للتركيز على مستوى المستند
        document.addEventListener('focus', event => {
            if (this.config.reinitializeOnFocus) {
                // التحقق من أن العنصر هو عنصر إدخال
                if (event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.tagName === 'SELECT') {
                    // إعادة تهيئة عنصر الإدخال
                    this._reinitializeInput(event.target);
                }
            }
        }, true); // استخدام مرحلة الالتقاط للتعامل مع حدث التركيز قبل المعالجات الأخرى
    },
    
    /**
     * إعادة تهيئة جميع عناصر الإدخال
     * @private
     */
    _reinitializeAllInputs() {
        // البحث عن جميع عناصر الإدخال
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this._reinitializeInput(input);
        });
    },
    
    /**
     * إعادة تهيئة عنصر إدخال
     * @param {HTMLElement} input - عنصر الإدخال
     * @private
     */
    _reinitializeInput(input) {
        if (!input) return;
        
        try {
            // تخزين القيمة الحالية
            const currentValue = input.value;
            
            // تطبيق أسلوب التركيز وإزالة التركيز لإعادة تهيئة العنصر
            input.blur();
            input.focus();
            input.blur();
            
            // التأكد من استعادة القيمة الأصلية
            if (input.value !== currentValue) {
                input.value = currentValue;
            }
            
            // استدعاء حدث تغيير لضمان تحديث أي معالجات مسجلة
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            // إعادة تفعيل العنصر إذا كان معطلاً بطريقة خاطئة
            if (input.disabled && !input.hasAttribute('disabled')) {
                input.disabled = false;
            }
            
            // التحقق من أن العنصر مرئي وليس مخفيًا بشكل غير صحيح
            if (input.style.display === 'none' && !input.dataset.hidden) {
                input.style.display = '';
            }
        } catch (error) {
            console.error('[مصلح النماذج] فشل في إعادة تهيئة عنصر الإدخال:', error);
        }
    },
    
    /**
     * إعادة تهيئة نموذج
     * @param {HTMLFormElement} form - النموذج
     * @private
     */
    _reinitializeForm(form) {
        if (!form || !(form instanceof HTMLFormElement)) return;
        
        try {
            // إعادة تهيئة جميع عناصر الإدخال في النموذج
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                this._reinitializeInput(input);
            });
            
            // استدعاء حدث إعادة التعيين لإعادة تهيئة النموذج
            form.dispatchEvent(new Event('reset', { bubbles: false, cancelable: true }));
            
            // التأكد من إعادة تفعيل زر الإرسال
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton && submitButton.disabled && !submitButton.hasAttribute('disabled')) {
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('[مصلح النماذج] فشل في إعادة تهيئة النموذج:', error);
        }
    },
    
    /**
     * إعادة تهيئة معالجات النماذج
     * @private
     */
    _reinitializeFormHandlers() {
        // البحث عن جميع النماذج
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // إزالة العلامة التي تشير إلى أن المعالجات مضافة مسبقًا
            delete form._formFixerHandlersAttached;
        });
        
        // إعادة إعداد معالجات النماذج
        this._setupFormSubmitHandlers();
    },
    
    /**
     * إعادة تهيئة معالجات النوافذ المنبثقة
     * @private
     */
    _reinitializeModalHandlers() {
        // إذا كان هناك دالة معرفة لإعادة تهيئة النوافذ المنبثقة، استدعاءها
        if (window.initNavigation && typeof window.initNavigation === 'function') {
            try {
                window.initNavigation();
                console.log('[مصلح النماذج] تم استدعاء initNavigation()');
            } catch (e) {
                console.error('[مصلح النماذج] فشل في استدعاء initNavigation():', e);
            }
        }
        
        // إعادة إعداد أزرار فتح النوافذ المنبثقة
        this._setupModalTriggers();
        
        // استدعاء initEventListeners إذا كانت موجودة
        if (this.config.reloadAllHandlersOnFix && window.initEventListeners && typeof window.initEventListeners === 'function') {
            try {
                window.initEventListeners();
                console.log('[مصلح النماذج] تم استدعاء initEventListeners()');
            } catch (e) {
                console.error('[مصلح النماذج] فشل في استدعاء initEventListeners():', e);
            }
        }
    }
};

// إضافة formFixer إلى window للوصول إليه عالميًا
window.formFixer = formFixer;

// تهيئة formFixer عند تحميل النافذة
window.addEventListener('load', () => {
    setTimeout(() => {
        window.formFixer.init();
    }, 600);
});









/**
 * نظام الاستثمار المتكامل - ملف preload محسن لتطبيق Electron
 * يوفر واجهة آمنة بين عمليات تشغيل Electron وواجهة المستخدم
 * مع إضافة معالجة متقدمة للتجمد والأخطاء
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريف مراقبة النبضات
let heartbeatInterval = null;
let lastHeartbeatTime = Date.now();
const HEARTBEAT_FREQUENCY = 5000; // إرسال نبضة كل 5 ثوانٍ

// معلومات عن حالة التطبيق
let appState = {
    isReady: false,
    isLoading: true,
    hasError: false,
    formsFrozen: false,
    uiResponsive: true,
    pendingRefresh: false
};

// تعريف واجهة للتحكم في النافذة
contextBridge.exposeInMainWorld('windowControls', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: async () => await ipcRenderer.invoke('window-is-maximized')
});

// تعريف واجهة للتعامل مع التطبيق
contextBridge.exposeInMainWorld('electronAPI', {
    // وظائف التحكم بالنافذة
    refreshPage: () => {
        appState.pendingRefresh = true;
        ipcRenderer.send('refresh-page');
    },
    
    forceReload: () => ipcRenderer.send('force-reload'),
    
    // وظائف مراقبة الصحة
    sendHeartbeat: (data) => {
        lastHeartbeatTime = Date.now();
        ipcRenderer.send('app-heartbeat', {
            timestamp: lastHeartbeatTime,
            ...data
        });
    },
    
    reportFreezeDetected: (details) => {
        ipcRenderer.send('app-freeze-detected', details);
    },
    
    reportInputFreeze: (details) => {
        appState.formsFrozen = true;
        ipcRenderer.send('input-freeze-detected', details);
    },
    
    domReady: () => {
        appState.isReady = true;
        appState.isLoading = false;
        ipcRenderer.send('dom-ready');
    },
    
    // وظائف التشخيص
    checkMemoryUsage: async () => await ipcRenderer.invoke('check-memory-usage'),
    
    collectSystemInfo: async () => await ipcRenderer.invoke('collect-system-info'),
    
    // وظائف الأمان والتخزين
    getSecureStorage: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('خطأ في الحصول على العنصر من التخزين المحلي:', error);
            return null;
        }
    },
    
    setSecureStorage: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('خطأ في تعيين العنصر في التخزين المحلي:', error);
            return false;
        }
    },
    
    removeSecureStorage: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('خطأ في إزالة العنصر من التخزين المحلي:', error);
            return false;
        }
    }
});

// إضافة مراقبة نظام الملفات للوصول إلى ملفات محلية
contextBridge.exposeInMainWorld('fs', {
    readFile: (path, options) => ipcRenderer.invoke('fs-read-file', path, options),
    writeFile: (path, data, options) => ipcRenderer.invoke('fs-write-file', path, data, options),
    readdir: (path) => ipcRenderer.invoke('fs-read-dir', path)
});

// بدء مراقبة نبضات القلب
function startHeartbeatMonitoring() {
    // إيقاف المراقبة الحالية إذا كانت موجودة
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    
    // بدء مراقبة جديدة
    heartbeatInterval = setInterval(() => {
        sendHeartbeat();
        
        // التحقق من وجود مشاكل في الاستجابة
        checkResponseTime();
    }, HEARTBEAT_FREQUENCY);
    
    console.log('[preload] بدء مراقبة نبضات القلب');
}

// إرسال نبضة قلب إلى عملية Main
function sendHeartbeat() {
    lastHeartbeatTime = Date.now();
    
    ipcRenderer.send('app-heartbeat', {
        timestamp: lastHeartbeatTime,
        state: appState
    });
}

// التحقق من وقت الاستجابة
function checkResponseTime() {
    const now = Date.now();
    const responseTime = now - lastHeartbeatTime;
    
    // إذا مر وقت طويل منذ آخر نبضة، قد يكون هناك مشكلة
    if (responseTime > HEARTBEAT_FREQUENCY * 3) {
        console.warn(`[preload] وقت استجابة طويل: ${responseTime}ms`);
        
        // إعلام عملية Main باحتمال وجود تجمد
        ipcRenderer.send('response-time-warning', {
            responseTime,
            timestamp: now
        });
        
        // محاولة إعادة التواصل
        sendHeartbeat();
    }
}

// استقبال الرسائل من عملية Main
ipcRenderer.on('request-reload', () => {
    // محاولة إجراء إعادة تحميل منظمة
    try {
        // إعلام النافذة بإعادة التحميل الوشيكة
        window.dispatchEvent(new CustomEvent('before-reload', { detail: { source: 'main-process' } }));
        
        // إعطاء وقت قصير للمعالجات للاستجابة
        setTimeout(() => {
            window.location.reload();
        }, 200);
    } catch (error) {
        // إعادة تحميل مباشرة في حالة حدوث خطأ
        window.location.reload();
    }
});

// معالجة الأخطاء غير المتوقعة
window.addEventListener('error', (event) => {
    console.error('[preload] خطأ غير متوقع:', event.error);
    
    // إبلاغ عملية Main بالخطأ
    ipcRenderer.send('unhandled-error', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    });
    
    // التحقق مما إذا كان الخطأ يشير إلى تجمد
    if (isFreezingError(event.message) || isFreezingError(event.error?.message)) {
        // إبلاغ عملية Main باحتمال وجود تجمد
        ipcRenderer.send('app-freeze-detected', {
            timestamp: Date.now(),
            error: event.message
        });
    }
});

// معالجة الوعود المرفوضة غير المعالجة
window.addEventListener('unhandledrejection', (event) => {
    console.error('[preload] وعد مرفوض غير معالج:', event.reason);
    
    // إبلاغ عملية Main بالخطأ
    ipcRenderer.send('unhandled-rejection', {
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
    });
});

// التحقق مما إذا كان الخطأ يشير إلى تجمد
function isFreezingError(errorMessage) {
    if (!errorMessage) return false;
    
    // قائمة بالعبارات المتعلقة بأخطاء التجمد
    const freezeErrorPatterns = [
        'تجمد',
        'freeze',
        'not responding',
        'unresponsive',
        'script timeout',
        'stack overflow',
        'وقت العملية انتهى',
        'متوقف عن الاستجابة'
    ];
    
    // التحقق مما إذا كانت رسالة الخطأ تحتوي على أي من العبارات المتعلقة بالتجمد
    const errorMessageLower = String(errorMessage).toLowerCase();
    return freezeErrorPatterns.some(pattern => errorMessageLower.includes(pattern.toLowerCase()));
}

// تهيئة نظام كشف التجمد
function setupFreezeDetection() {
    let lastFrameTime = performance.now();
    let freezeDetected = false;
    
    // مراقبة معدل الإطارات للكشف عن التجمد
    function checkFrameRate() {
        const now = performance.now();
        const frameTime = now - lastFrameTime;
        
        // إذا كان هناك تأخير كبير بين الإطارات، قد يكون هناك تجمد
        if (frameTime > 500 && !freezeDetected) { // تأخير أكثر من 500 مللي ثانية يعتبر تجمدًا
            freezeDetected = true;
            
            console.warn(`[preload] اكتشاف تجمد محتمل: ${frameTime.toFixed(2)}ms منذ آخر إطار`);
            
            // إبلاغ عملية Main باحتمال وجود تجمد
            ipcRenderer.send('app-freeze-detected', {
                timestamp: now,
                frameTime: frameTime
            });
            
            // محاولة استعادة الاستجابة
            setTimeout(() => {
                freezeDetected = false;
            }, 1000);
        }
        
        lastFrameTime = now;
        requestAnimationFrame(checkFrameRate);
    }
    
    // بدء مراقبة معدل الإطارات
    requestAnimationFrame(checkFrameRate);
    
    console.log('[preload] تم إعداد كشف التجمد باستخدام معدل الإطارات');
}

// تشخيص حالة التطبيق
function diagnoseAppState() {
    // التحقق من حالة DOM
    const domState = document.readyState;
    console.log(`[preload] حالة DOM: ${domState}`);
    
    // التحقق من حالة النماذج
    const forms = document.querySelectorAll('form');
    console.log(`[preload] عدد النماذج في الصفحة: ${forms.length}`);
    
    // التحقق من عناصر الإدخال
    const inputs = document.querySelectorAll('input, textarea, select');
    console.log(`[preload] عدد عناصر الإدخال في الصفحة: ${inputs.length}`);
    
    // فحص عناصر الواجهة الرئيسية
    const checkElement = (selector, description) => {
        const element = document.querySelector(selector);
        console.log(`[preload] ${description}: ${element ? 'موجود' : 'غير موجود'}`);
        return !!element;
    };
    
    // التحقق من عناصر مهمة في التطبيق
    checkElement('#dashboard-page', 'صفحة لوحة التحكم');
    checkElement('.sidebar', 'الشريط الجانبي');
    checkElement('#add-new-fab', 'زر الإضافة العائم');
    
    return {
        domReady: domState === 'complete',
        formsCount: forms.length,
        inputsCount: inputs.length
    };
}

// إضافة معلومات تلميحية عن أزرار التحكم بالنافذة
function addWindowControlsTooltips() {
    window.addEventListener('DOMContentLoaded', () => {
        // إضافة تلميحات لأزرار التحكم بالنافذة
        const minimizeBtn = document.getElementById('minimize-btn');
        const maximizeBtn = document.getElementById('maximize-btn');
        const closeBtn = document.getElementById('close-btn');
        
        if (minimizeBtn) minimizeBtn.title = 'تصغير';
        if (maximizeBtn) maximizeBtn.title = 'تكبير/استعادة';
        if (closeBtn) closeBtn.title = 'إغلاق';
    });
}

// لوغ عند تحميل ملف preload
console.log('[preload] تم تحميل ملف preload-improved.js بنجاح');

// تهيئة النظام عند تحميل النافذة
window.addEventListener('DOMContentLoaded', () => {
    console.log('[preload] اكتمل تحميل DOM');
    
    // إضافة تلميحات لأزرار التحكم بالنافذة
    addWindowControlsTooltips();
    
    // بدء مراقبة نبضات القلب
    startHeartbeatMonitoring();
    
    // تهيئة نظام كشف التجمد
    setupFreezeDetection();
    
    // إضافة معالج لزر التحديث
    const refreshButton = document.getElementById('refresh-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            appState.pendingRefresh = true;
            ipcRenderer.send('refresh-page');
        });
    }
    
    // تشخيص حالة التطبيق
    const appDiagnosis = diagnoseAppState();
    
    // إرسال حالة تحميل DOM إلى عملية Main
    ipcRenderer.send('dom-content-loaded', appDiagnosis);
    
    // إضافة مراقب للتغييرات في DOM
    const observer = new MutationObserver((mutations) => {
        let hasSignificantChanges = false;
        
        for (const mutation of mutations) {
            // التحقق من التغييرات المهمة
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'FORM' || node.matches('.modal, .page, .section, .card')) {
                            hasSignificantChanges = true;
                            break;
                        }
                    }
                }
            }
        }
        
        // إذا كانت هناك تغييرات مهمة، إجراء تشخيص جديد
        if (hasSignificantChanges) {
            const newDiagnosis = diagnoseAppState();
            ipcRenderer.send('dom-changed', newDiagnosis);
        }
    });
    
    // بدء مراقبة التغييرات في DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
});

// التنظيف عند إغلاق النافذة
window.addEventListener('beforeunload', () => {
    // إيقاف مراقبة نبضات القلب
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    
    console.log('[preload] تم تنظيف الموارد قبل إغلاق النافذة');
});

// إصلاح نموذج متجمد (تكملة الكود)
function fixForm(form) {
    if (!form || !document.body.contains(form)) return;
    
    log(`محاولة إصلاح النموذج: "${getFormDescription(form)}"`);
    
    // زيادة عدد محاولات إصلاح النموذج
    if (form._formFixerState) {
        form._formFixerState.fixAttempts++;
    }
    
    try {
        // 1. إصلاح جميع عناصر الإدخال في النموذج
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(fixInput);
        
        // 2. محاولة إصدار حدث إعادة تعيين النموذج
        try {
            const resetEvent = new Event('reset', { bubbles: true, cancelable: true });
            form.dispatchEvent(resetEvent);
        } catch (e) {
            // تجاهل الأخطاء
        }
        
        // 3. التحقق من أن زر الإرسال غير معطل
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton && submitButton.disabled && !submitButton.hasAttribute('disabled')) {
            submitButton.disabled = false;
        }
        
        // 4. إعادة تهيئة معالجات الأحداث إذا كانت الدالة موجودة
        if (window.initEventListeners && typeof window.initEventListeners === 'function') {
            try {
                window.initEventListeners();
            } catch (e) {
                // تجاهل الأخطاء
            }
        }
        
        // 5. في حالة الفشل في إصلاح النموذج بالطرق العادية، محاولة إعادة إنشائه
        if (state.frozenInputs.size > 0) {
            recreateElement(form);
        }
        
        log(`تم إصلاح النموذج: "${getFormDescription(form)}"`);
        return true;
    } catch (error) {
        log(`فشل في إصلاح النموذج: "${getFormDescription(form)}" - ${error.message}`, 'error');
        return false;
    }
}

// إصلاح عنصر إدخال متجمد
function fixInput(input) {
    if (!input || !document.body.contains(input)) return;
    
    log(`محاولة إصلاح عنصر الإدخال: "${getInputDescription(input)}"`);
    
    // زيادة عدد محاولات إصلاح عنصر الإدخال
    if (input._formFixerState) {
        input._formFixerState.fixAttempts++;
    }
    
    try {
        // 1. تخزين القيمة الحالية
        const originalValue = input.value;
        
        // 2. تطبيق أسلوب التركيز وإزالة التركيز
        input.blur();
        input.focus();
        input.blur();
        
        // 3. محاولة تغيير القيمة وإعادتها
        const testValue = originalValue + ' ';
        input.value = testValue;
        
        // التحقق مما إذا تم تطبيق التغيير
        if (input.value === testValue) {
            // إعادة القيمة الأصلية
            input.value = originalValue;
            
            // تحديث معلومات المراقبة
            if (input._formFixerState) {
                input._formFixerState.lastInteraction = Date.now();
                input._formFixerState.lastValue = originalValue;
            }
            
            log(`تم إصلاح عنصر الإدخال: "${getInputDescription(input)}"`);
            return true;
        } else {
            // 4. في حالة الفشل، محاولة إعادة إنشاء العنصر
            recreateElement(input);
            return true;
        }
    } catch (error) {
        log(`فشل في إصلاح عنصر الإدخال: "${getInputDescription(input)}" - ${error.message}`, 'error');
        return false;
    }
}

// إعادة إنشاء عنصر
function recreateElement(element) {
    if (!element || !element.parentNode) return false;
    
    log(`محاولة إعادة إنشاء العنصر: "${element.tagName.toLowerCase()}"`);
    
    try {
        // 1. نسخ العنصر مع جميع السمات
        const clone = element.cloneNode(true);
        
        // 2. نسخ قيم الإدخال للعناصر المدخلة
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
            clone.value = element.value;
        }
        
        // 3. استبدال العنصر الأصلي بالنسخة الجديدة
        element.parentNode.replaceChild(clone, element);
        
        // 4. إعادة تهيئة العنصر الجديد
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(clone.tagName)) {
            monitorInput(clone);
        } else if (clone.tagName === 'FORM') {
            monitorForm(clone);
        }
        
        log(`تم إعادة إنشاء العنصر بنجاح`);
        return true;
    } catch (error) {
        log(`فشل في إعادة إنشاء العنصر: ${error.message}`, 'error');
        return false;
    }
}

// إصدار حدث عنصر إدخال متجمد
function emitFrozenInputEvent(input) {
    try {
        // إنشاء حدث مخصص
        const event = new CustomEvent('input:freeze', {
            detail: {
                input: input,
                id: input.id || '',
                name: input.name || '',
                type: input.type || '',
                value: input.value || '',
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: true
        });
        
        // إصدار الحدث
        document.dispatchEvent(event);
        
        // إبلاغ electronAPI إذا كان متاحًا
        if (window.electronAPI && window.electronAPI.reportInputFreeze) {
            window.electronAPI.reportInputFreeze({
                inputType: input.type || input.tagName.toLowerCase(),
                id: input.id || '',
                name: input.name || '',
                timestamp: Date.now()
            });
        }
    } catch (error) {
        // تجاهل أخطاء إصدار الحدث
    }
}

// إصدار حدث نموذج متجمد
function emitFrozenFormEvent(form) {
    try {
        // إنشاء حدث مخصص
        const event = new CustomEvent('form:freeze', {
            detail: {
                form: form,
                id: form.id || '',
                name: form.name || '',
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: true
        });
        
        // إصدار الحدث
        document.dispatchEvent(event);
    } catch (error) {
        // تجاهل أخطاء إصدار الحدث
    }
}

// الحصول على وصف النموذج
function getFormDescription(form) {
    if (!form) return 'نموذج غير معروف';
    
    let description = 'نموذج';
    
    if (form.id) {
        description += ` #${form.id}`;
    } else if (form.name) {
        description += ` [name="${form.name}"]`;
    } else if (form.className) {
        const mainClass = form.className.split(' ')[0];
        if (mainClass) {
            description += ` .${mainClass}`;
        }
    }
    
    return description;
}

// الحصول على وصف عنصر الإدخال
function getInputDescription(input) {
    if (!input) return 'عنصر إدخال غير معروف';
    
    let description = input.tagName.toLowerCase();
    
    if (input.type) {
        description += `[type="${input.type}"]`;
    }
    
    if (input.id) {
        description += ` #${input.id}`;
    } else if (input.name) {
        description += ` [name="${input.name}"]`;
    } else if (input.className) {
        const mainClass = input.className.split(' ')[0];
        if (mainClass) {
            description += ` .${mainClass}`;
        }
    }
    
    if (input.placeholder) {
        description += ` "${input.placeholder}"`;
    } else if (input.value) {
        const shortValue = input.value.length > 10 ? input.value.substring(0, 10) + '...' : input.value;
        description += ` (${shortValue})`;
    }
    
    return description;
}

// تسجيل رسالة
function log(message, level = 'info') {
    // إضافة الرسالة إلى سجل التصحيح
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = { timestamp, message, level };
    state.debugLogs.push(logEntry);
    
    // الاحتفاظ بآخر 100 رسالة فقط
    if (state.debugLogs.length > 100) {
        state.debugLogs.shift();
    }
    
    // طباعة الرسالة في وحدة التحكم
    const prefix = '[مصلح النماذج]';
    
    if (config.debugMode || level !== 'info') {
        switch (level) {
            case 'warn':
                console.warn(`${prefix} ${message}`);
                break;
            case 'error':
                console.error(`${prefix} ${message}`);
                break;
            default:
                console.log(`${prefix} ${message}`);
        }
    }
}

// الحصول على سجل التصحيح
function getDebugLogs() {
    return state.debugLogs;
}

// واجهة API العامة
return {
    init,
    restart,
    refresh,
    fixForm,
    fixInput,
    scanForFormsAndInputs,
    getDebugLogs,
    state, // للتشخيص فقط
    config // للتكوين
};



// إضافة formFixer إلى window للوصول إليه عالمياً
window.formFixer = formFixer;

// تهيئة مصلح النماذج عند تحميل الصفحة
window.addEventListener('load', () => {
    // تأخير قصير لضمان تحميل جميع المكونات
    setTimeout(() => {
        window.formFixer.init();
        
        console.log('[مصلح النماذج] تم تهيئة نظام إصلاح النماذج بنجاح');
        
        // إضافة المعالج لزر الاستعادة إذا كان موجوداً
        const refreshButton = document.getElementById('refresh-btn');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                window.formFixer.refresh();
            });
        }
        
        // مراقبة لأحداث تجمد النماذج
        document.addEventListener('input:freeze', (event) => {
            console.warn('[مصلح النماذج] تم اكتشاف عنصر إدخال متجمد:', event.detail);
            
            // عرض إشعار للمستخدم
            if (window.showNotification) {
                window.showNotification('تم اكتشاف عنصر إدخال متجمد وتم إصلاحه.', 'warning');
            }
        });
        
        // فحص الصفحة مرة أخرى بعد وقت أطول للتأكد من اكتمال تحميل جميع العناصر
        setTimeout(() => {
            window.formFixer.scanForFormsAndInputs();
        }, 3000);
    }, 1000);
});



/**
 * نظام الاستثمار المتكامل - ملف تكامل أنظمة معالجة التجمد
 * هذا الملف يقوم بربط جميع أنظمة معالجة التجمد وتهيئتها
 */

// نظام التكامل
const freezeRecoverySystem = (function() {
    // إعدادات النظام
    const config = {
        // ما إذا كان النظام مفعلاً
        enabled: true,
        
        // مستوى التسجيل (info, warn, error, none)
        logLevel: 'info',
        
        // ما إذا كان يجب عرض زر الإصلاح
        showFixButton: true,
        
        // ما إذا كان يجب تفعيل كشف التجمد التلقائي
        autoDetect: true,
        
        // مدة الانتظار قبل اعتبار التطبيق متجمداً (بالمللي ثانية)
        freezeThreshold: 5000,
        
        // ما إذا كان يجب محاولة إصلاح التجمد تلقائياً
        autoFix: true,
        
        // عدد محاولات الإصلاح قبل إعادة تحميل الصفحة
        maxFixAttempts: 3,
        
        // ما إذا كان يجب إعادة تحميل الصفحة بعد فشل الإصلاح
        reloadOnFailure: true
    };
    
    // حالة النظام
    const state = {
        initialized: false,
        freezeDetected: false,
        fixAttempts: 0,
        lastFixTime: 0,
        uiResponsive: true,
        hasShownButton: false,
        hasErrorOccurred: false,
        errorMessage: '',
        systemsAvailable: {
            freezeDetector: false,
            formFixer: false,
            electronAPI: false
        },
        fixButton: null
    };
    
    // تهيئة النظام
    function init(options = {}) {
        // دمج الإعدادات المخصصة مع الإعدادات الافتراضية
        Object.assign(config, options);
        
        log('بدء تهيئة نظام استعادة التجمد...');
        
        // التحقق من وجود الأنظمة المطلوبة
        checkRequiredSystems();
        
        // إذا كان النظام معطلاً، نتوقف هنا
        if (!config.enabled) {
            log('نظام استعادة التجمد معطل، يتم إلغاء التهيئة');
            return;
        }
        
        // إعداد معالجات الأحداث
        setupEventListeners();
        
        // تهيئة زر الإصلاح إذا كان مفعلاً
        if (config.showFixButton) {
            initFixButton();
        }
        
        // تطبيق إجراءات الوقاية من التجمد
        applyFreezePrevention();
        
        // تهيئة الأنظمة المتاحة
        initAvailableSystems();
        
        // تعيين حالة التهيئة
        state.initialized = true;
        log('تم تهيئة نظام استعادة التجمد بنجاح');
    }
    
    // التحقق من وجود الأنظمة المطلوبة
    function checkRequiredSystems() {
        // التحقق من وجود freezeDetector
        if (window.freezeDetector) {
            state.systemsAvailable.freezeDetector = true;
            log('تم اكتشاف نظام كشف التجمد');
        } else {
            log('نظام كشف التجمد غير متوفر', 'warn');
        }
        
        // التحقق من وجود formFixer
        if (window.formFixer) {
            state.systemsAvailable.formFixer = true;
            log('تم اكتشاف نظام إصلاح النماذج');
        } else {
            log('نظام إصلاح النماذج غير متوفر', 'warn');
        }
        
        // التحقق من وجود electronAPI
        if (window.electronAPI) {
            state.systemsAvailable.electronAPI = true;
            log('تم اكتشاف واجهة Electron API');
        } else {
            log('واجهة Electron API غير متوفرة', 'info');
        }
    }
    
    // إعداد معالجات الأحداث
    function setupEventListeners() {
        log('إعداد معالجات الأحداث...');
        
        // معالجة أحداث كشف التجمد
        document.addEventListener('input:freeze', handleInputFreeze);
        document.addEventListener('form:freeze', handleFormFreeze);
        
        // معالجة أحداث الأخطاء
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        // إضافة معالج نقر عام للكشف عن النقرات غير المستجيبة
        document.addEventListener('click', handleClick, { capture: true });
        
        // معالجة أحداث إعادة تحميل الصفحة
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // معالجة أحداث تغيير الصفحة (للتطبيقات أحادية الصفحة)
        document.addEventListener('page:change', handlePageChange);
        
        // الاستماع إلى حدث استعادة من التجمد
        window.addEventListener('freeze:recovery', handleFreezeRecovery);
    }
    
    // تهيئة زر الإصلاح
    function initFixButton() {
        // التحقق من وجود الزر مسبقاً
        if (document.getElementById('freeze-fix-button')) {
            return;
        }
        
        // إنشاء زر الإصلاح
        const button = document.createElement('button');
        button.id = 'freeze-fix-button';
        button.className = 'freeze-fix-button';
        button.title = 'إصلاح تجمد الواجهة';
        button.innerHTML = '<i class="fas fa-sync-alt"></i>';
        
        // إضافة أنماط CSS للزر
        const style = document.createElement('style');
        style.textContent = `
            .freeze-fix-button {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #f44336;
                color: white;
                border: none;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-size: 20px;
                opacity: 0;
                transform: scale(0);
                transition: opacity 0.3s, transform 0.3s;
            }
            
            .freeze-fix-button.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            .freeze-fix-button:hover {
                background-color: #d32f2f;
            }
            
            .freeze-fix-button i {
                animation: spin 2s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .freeze-fix-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                font-family: 'Tajawal', sans-serif;
                opacity: 0;
                transition: opacity 0.3s;
                text-align: center;
                direction: rtl;
            }
            
            .freeze-fix-toast.visible {
                opacity: 1;
            }
        `;
        
        // إضافة الأنماط والزر إلى الصفحة
        document.head.appendChild(style);
        document.body.appendChild(button);
        
        // تخزين مرجع للزر
        state.fixButton = button;
        
        // إضافة مستمع لحدث النقر على الزر
        button.addEventListener('click', handleFixButtonClick);
        
        log('تم تهيئة زر إصلاح التجمد');
    }
    
    // تطبيق إجراءات الوقاية من التجمد
    function applyFreezePrevention() {
        log('تطبيق إجراءات الوقاية من التجمد...');
        
        // تحسين معالجة الأحداث للنوافذ المنبثقة
        improveModalHandling();
        
        // تحسين معالجة الجداول
        improveTableRendering();
        
        // تحسين الأداء العام
        improvePerformance();
        
        log('تم تطبيق إجراءات الوقاية من التجمد');
    }
    
    // تهيئة الأنظمة المتاحة
    function initAvailableSystems() {
        log('تهيئة الأنظمة المتاحة...');
        
        // تهيئة نظام كشف التجمد إذا كان متاحاً
        if (state.systemsAvailable.freezeDetector && window.freezeDetector) {
            // تعديل إعدادات كاشف التجمد
            window.freezeDetector.configure({
                heartbeatInterval: 1000,
                interactionTimeout: config.freezeThreshold,
                checkForms: true,
                autoFix: config.autoFix,
                loggingEnabled: config.logLevel !== 'none'
            });
            
            // تعيين معالج مخصص للتجمد
            window.freezeDetector.setCustomFreezeHandler(handleFreezeDetection);
            
            log('تم تهيئة نظام كشف التجمد');
        }
        
        // تهيئة نظام إصلاح النماذج إذا كان متاحاً
        if (state.systemsAvailable.formFixer && window.formFixer) {
            // تعديل إعدادات مصلح النماذج
            window.formFixer.config.autoFix = config.autoFix;
            window.formFixer.config.fixOnFocus = true;
            window.formFixer.config.checkModals = true;
            window.formFixer.config.debugMode = config.logLevel === 'debug';
            
            log('تم تهيئة نظام إصلاح النماذج');
        }
        
        // تهيئة واجهة Electron API إذا كانت متاحة
        if (state.systemsAvailable.electronAPI && window.electronAPI) {
            // إرسال نبضة قلب أولية
            window.electronAPI.sendHeartbeat({
                initializing: true,
                timestamp: Date.now()
            });
            
            log('تم تهيئة واجهة Electron API');
        }
    }
    
    // معالجة حدث تجمد عنصر إدخال
    function handleInputFreeze(event) {
        log(`تم اكتشاف تجمد في عنصر الإدخال: ${event.detail.id || event.detail.name || 'غير معروف'}`, 'warn');
        
        // تسجيل حالة التجمد
        state.freezeDetected = true;
        
        // محاولة إصلاح عنصر الإدخال
        if (config.autoFix && state.systemsAvailable.formFixer) {
            try {
                // محاولة إصلاح عنصر الإدخال
                window.formFixer.fixInput(event.detail.input);
                
                // عرض زر الإصلاح
                showFixButton();
                
                // عرض إشعار للمستخدم
                showToast('تم اكتشاف تجمد في أحد عناصر الإدخال وتم إصلاحه');
            } catch (error) {
                log(`فشل في إصلاح عنصر الإدخال المتجمد: ${error.message}`, 'error');
            }
        }
    }
    
    // معالجة حدث تجمد نموذج
    function handleFormFreeze(event) {
        log(`تم اكتشاف تجمد في النموذج: ${event.detail.id || event.detail.name || 'غير معروف'}`, 'warn');
        
        // تسجيل حالة التجمد
        state.freezeDetected = true;
        
        // محاولة إصلاح النموذج
        if (config.autoFix && state.systemsAvailable.formFixer) {
            try {
                // محاولة إصلاح النموذج
                window.formFixer.fixForm(event.detail.form);
                
                // عرض زر الإصلاح
                showFixButton();
                
                // عرض إشعار للمستخدم
                showToast('تم اكتشاف تجمد في أحد النماذج وتم إصلاحه');
            } catch (error) {
                log(`فشل في إصلاح النموذج المتجمد: ${error.message}`, 'error');
            }
        }
    }
    
    // معالجة حدث كشف التجمد
    function handleFreezeDetection(status, duration) {
        switch (status) {
            case 'potential':
                log(`تم اكتشاف تجمد محتمل (استمر لمدة ${duration}ms)`, 'warn');
                state.freezeDetected = true;
                showFixButton();
                break;
                
            case 'severe':
                log(`تم اكتشاف تجمد شديد (استمر لمدة ${duration}ms)`, 'error');
                state.freezeDetected = true;
                attemptFreezeFix(true);
                break;
                
            case 'recovery':
                log(`تم التعافي من التجمد (استمر لمدة ${duration}ms)`);
                state.freezeDetected = false;
                // إخفاء زر الإصلاح بعد فترة
                setTimeout(hideFixButton, 5000);
                break;
        }
    }
    
    // معالجة حدث الخطأ
    function handleError(event) {
        // تسجيل الخطأ
        log(`خطأ غير معالج: ${event.message}`, 'error');
        
        // تسجيل معلومات الخطأ
        state.hasErrorOccurred = true;
        state.errorMessage = event.message;
        
        // التحقق مما إذا كان الخطأ متعلقاً بالتجمد
        if (isFreezingError(event.message) || isFreezingError(event.error?.message)) {
            log('تم اكتشاف خطأ متعلق بالتجمد', 'error');
            
            // تسجيل حالة التجمد
state.freezeDetected = true;

// محاولة إصلاح التجمد
if (config.autoFix) {
    attemptFreezeFix();
}
    
// عرض زر الإصلاح
showFixButton();
}
}

// معالجة الوعود المرفوضة غير المعالجة
function handleUnhandledRejection(event) {
    // تسجيل الخطأ
    log(`وعد مرفوض غير معالج: ${event.reason?.message || String(event.reason)}`, 'error');
    
    // تسجيل معلومات الخطأ
    state.hasErrorOccurred = true;
    state.errorMessage = event.reason?.message || String(event.reason);
}

// معالجة النقر
function handleClick(event) {
    // تحديث حالة استجابة واجهة المستخدم
    state.uiResponsive = true;
    
    // إذا كان النقر على زر تحديث أو تعديل، قم بمسح النماذج وعناصر الإدخال بعد فترة
    const target = event.target.closest('button, a, [data-modal], .modal-trigger');
    if (target) {
        // تحقق مما إذا كان الزر يحتوي على أيقونة تحديث أو تعديل
        const hasRefreshIcon = target.querySelector('.fa-sync, .fa-redo, .fa-refresh, .fa-edit, .fa-pencil');
        
        if (hasRefreshIcon || 
            target.id === 'refresh-btn' || 
            target.classList.contains('btn-refresh') ||
            target.getAttribute('title')?.includes('تحديث')) {
            
            // تأخير مسح النماذج وعناصر الإدخال
            setTimeout(() => {
                if (state.systemsAvailable.formFixer) {
                    window.formFixer.scanForFormsAndInputs();
                }
            }, 500);
        }
    }
}

// معالجة حدث قبل إعادة تحميل الصفحة
function handleBeforeUnload(event) {
    log('جاري إعادة تحميل الصفحة...');
    
    // محاولة تنظيف أي موارد
    cleanup();
}

// معالجة حدث تغيير الصفحة
function handlePageChange(event) {
    log(`تم تغيير الصفحة إلى: ${event.detail?.page || 'غير معروفة'}`);
    
    // تأخير مسح النماذج وعناصر الإدخال
    setTimeout(() => {
        if (state.systemsAvailable.formFixer) {
            window.formFixer.scanForFormsAndInputs();
        }
    }, 500);
}

// معالجة حدث النقر على زر الإصلاح
function handleFixButtonClick(event) {
    log('تم النقر على زر إصلاح التجمد');
    
    // محاولة إصلاح التجمد
    attemptFreezeFix(true);
    
    // إخفاء زر الإصلاح
    hideFixButton();
    
    // عرض إشعار للمستخدم
    showToast('جاري تطبيق إصلاح التجمد...');
    
    // منع انتشار الحدث
    event.preventDefault();
    event.stopPropagation();
}

// معالجة حدث استعادة من التجمد
function handleFreezeRecovery(event) {
    log('تم استلام حدث استعادة من التجمد');
    
    // إعادة تعيين حالة التجمد
    state.freezeDetected = false;
    
    // إخفاء زر الإصلاح
    hideFixButton();
}

// محاولة إصلاح التجمد
function attemptFreezeFix(userInitiated = false) {
    // زيادة عدد محاولات الإصلاح
    state.fixAttempts++;
    state.lastFixTime = Date.now();
    
    log(`محاولة إصلاح التجمد (#${state.fixAttempts})${userInitiated ? ' (بواسطة المستخدم)' : ''}...`);
    
    // محاولات الإصلاح
    let fixSucceeded = false;
    
    // 1. محاولة استخدام كاشف التجمد
    if (state.systemsAvailable.freezeDetector && window.freezeDetector) {
        try {
            window.freezeDetector.refresh();
            window.freezeDetector._attemptFixFreeze(userInitiated);
            log('تم استدعاء محاولة إصلاح التجمد من كاشف التجمد');
            fixSucceeded = true;
        } catch (error) {
            log(`فشل في استدعاء كاشف التجمد: ${error.message}`, 'error');
        }
    }
    
    // 2. محاولة استخدام مصلح النماذج
    if (state.systemsAvailable.formFixer && window.formFixer) {
        try {
            window.formFixer.refresh();
            log('تم استدعاء تحديث مصلح النماذج');
            fixSucceeded = true;
        } catch (error) {
            log(`فشل في استدعاء مصلح النماذج: ${error.message}`, 'error');
        }
    }
    
    // 3. محاولة استخدام دوال تحديث التطبيق المعرفة عالمياً
    const updateFunctions = [
        'updateDashboard',
        'renderInvestorsTable',
        'renderTransactionsTable',
        'renderProfitsTable',
        'renderRecentTransactions',
        'populateInvestorSelects',
        'initEventListeners',
        'updateCharts'
    ];
    
    for (const funcName of updateFunctions) {
        if (window[funcName] && typeof window[funcName] === 'function') {
            try {
                window[funcName]();
                log(`تم استدعاء ${funcName}()`);
                fixSucceeded = true;
            } catch (error) {
                log(`فشل في استدعاء ${funcName}(): ${error.message}`, 'error');
            }
        }
    }
    
    // 4. محاولة استخدام واجهة Electron API
    if (state.systemsAvailable.electronAPI && window.electronAPI) {
        try {
            window.electronAPI.sendHeartbeat({
                timestamp: Date.now(),
                fixAttempt: state.fixAttempts,
                userInitiated: userInitiated
            });
            
            log('تم إرسال نبضة قلب إلى عملية Main');
            fixSucceeded = true;
        } catch (error) {
            log(`فشل في إرسال نبضة قلب: ${error.message}`, 'error');
        }
    }
    
    // 5. إذا فشلت جميع المحاولات، نحاول إعادة تحميل الصفحة
    if (!fixSucceeded) {
        log('فشلت جميع محاولات الإصلاح', 'error');
        
        // إعادة تحميل الصفحة إذا كان مفعلاً
        if (config.reloadOnFailure && state.fixAttempts >= config.maxFixAttempts) {
            log(`تجاوز عدد محاولات الإصلاح الحد الأقصى (${config.maxFixAttempts})، محاولة إعادة تحميل الصفحة...`, 'warn');
            
            // عرض إشعار للمستخدم
            showToast('فشل في إصلاح التجمد. جاري إعادة تحميل الصفحة...');
            
            // تأخير صغير قبل إعادة التحميل
            setTimeout(() => {
                reloadPage();
            }, 1500);
        }
    } else {
        // تنظيف بعض الذاكرة
        if (window.gc) {
            try {
                window.gc();
                log('تم استدعاء جامع القمامة');
            } catch (error) {
                // تجاهل الأخطاء
            }
        }
        
        // إصدار حدث استعادة من التجمد
        try {
            const event = new CustomEvent('freeze:recovery', {
                detail: {
                    timestamp: Date.now(),
                    fixAttempts: state.fixAttempts,
                    userInitiated: userInitiated
                },
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(event);
        } catch (error) {
            // تجاهل أخطاء إصدار الحدث
        }
        
        // عرض إشعار للمستخدم
        if (userInitiated) {
            showToast('تم تطبيق إصلاح التجمد بنجاح');
        }
    }
    
    return fixSucceeded;
}

// عرض زر الإصلاح
function showFixButton() {
    if (!config.showFixButton || !state.fixButton) return;
    
    // تعيين حالة العرض
    state.hasShownButton = true;
    
    // عرض الزر
    state.fixButton.classList.add('visible');
}

// إخفاء زر الإصلاح
function hideFixButton() {
    if (!state.fixButton) return;
    
    // إخفاء الزر
    state.fixButton.classList.remove('visible');
    
    // تعيين حالة العرض
    state.hasShownButton = false;
}

// عرض إشعار للمستخدم
function showToast(message) {
    // التحقق من وجود دالة showNotification
    if (window.showNotification) {
        window.showNotification(message, 'info');
        return;
    }
    
    // إنشاء عنصر الإشعار
    let toast = document.querySelector('.freeze-fix-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'freeze-fix-toast';
        document.body.appendChild(toast);
    }
    
    // تعيين رسالة الإشعار
    toast.textContent = message;
    
    // عرض الإشعار
    toast.classList.add('visible');
    
    // إخفاء الإشعار بعد فترة
    setTimeout(() => {
        toast.classList.remove('visible');
        
        // إزالة الإشعار من DOM بعد انتهاء التأثير
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// تحسين معالجة النوافذ المنبثقة
function improveModalHandling() {
    log('تطبيق تحسينات معالجة النوافذ المنبثقة...');
    
    try {
        // إصلاح إغلاق النوافذ المنبثقة
        fixModalClosing();
        
        // تحسين معالجات فتح النوافذ المنبثقة
        improveModalOpening();
    } catch (error) {
        log(`فشل في تطبيق تحسينات النوافذ المنبثقة: ${error.message}`, 'error');
    }
}

// إصلاح إغلاق النوافذ المنبثقة
function fixModalClosing() {
    // إضافة معالج عام لأزرار إغلاق النوافذ المنبثقة
    document.addEventListener('click', event => {
        // التحقق مما إذا كان النقر على زر إغلاق
        const closeButton = event.target.closest('.modal-close, .modal-close-btn');
        
        if (closeButton) {
            // البحث عن النافذة المنبثقة الأقرب
            const modal = closeButton.closest('.modal-overlay, .modal, .modal-dialog');
            
            if (modal) {
                // محاولة إغلاق النافذة
                modal.classList.remove('active');
                modal.classList.remove('show');
                
                // إزالة التأثيرات النشطة
                const modalContent = modal.querySelector('.modal');
                if (modalContent) {
                    modalContent.classList.remove('animate__animated');
                    modalContent.classList.remove('animate__fadeInUp');
                }
                
                // إعادة تمكين التمرير في الصفحة الرئيسية
                document.body.style.overflow = '';
                
                log(`تم إغلاق النافذة المنبثقة: ${modal.id || 'غير معروفة'}`);
            }
        }
    });
}

// تحسين معالجات فتح النوافذ المنبثقة
function improveModalOpening() {
    // إضافة معالج عام لأزرار فتح النوافذ المنبثقة
    document.addEventListener('click', event => {
        // التحقق مما إذا كان النقر على زر فتح نافذة منبثقة
        const modalTrigger = event.target.closest('[data-modal], .modal-trigger, [data-target], [data-toggle="modal"]');
        
        if (modalTrigger) {
            // الحصول على معرف النافذة المنبثقة
            const modalId = modalTrigger.getAttribute('data-modal') || 
                            modalTrigger.getAttribute('data-target')?.replace('#', '') ||
                            modalTrigger.getAttribute('href')?.replace('#', '');
            
            if (modalId) {
                // البحث عن النافذة المنبثقة
                const modal = document.getElementById(modalId);
                
                if (modal) {
                    // عرض النافذة المنبثقة
                    modal.classList.add('active');
                    modal.classList.add('show');
                    
                    // منع التمرير في الصفحة الرئيسية
                    document.body.style.overflow = 'hidden';
                    
                    // تأخير المسح للسماح بتحميل النافذة المنبثقة
                    setTimeout(() => {
                        if (state.systemsAvailable.formFixer) {
                            window.formFixer.scanForFormsAndInputs();
                        }
                    }, 300);
                    
                    log(`تم فتح النافذة المنبثقة: ${modalId}`);
                    
                    // منع الافتراضي
                    event.preventDefault();
                }
            }
        }
    });
}

// تحسين معالجة الجداول
function improveTableRendering() {
    log('تطبيق تحسينات معالجة الجداول...');
    
    try {
        // التعامل مع وظائف العرض الأصلية
        patchRenderFunctions();
        
        // تحسين عرض الجداول
        improveTablePagination();
    } catch (error) {
        log(`فشل في تطبيق تحسينات الجداول: ${error.message}`, 'error');
    }
}

// تعديل وظائف العرض
function patchRenderFunctions() {
    // قائمة بوظائف العرض التي يجب تعديلها
    const renderFunctions = [
        'renderInvestorsTable',
        'renderTransactionsTable',
        'renderProfitsTable',
        'renderRecentTransactions'
    ];
    
    // تعديل كل وظيفة
    renderFunctions.forEach(funcName => {
        if (window[funcName] && typeof window[funcName] === 'function') {
            // تخزين الوظيفة الأصلية
            const originalFunction = window[funcName];
            
            // استبدال الوظيفة بوظيفة آمنة
            window[funcName] = function() {
                try {
                    // استدعاء الوظيفة الأصلية
                    const result = originalFunction.apply(this, arguments);
                    return result;
                } catch (error) {
                    log(`خطأ في استدعاء ${funcName}: ${error.message}`, 'error');
                    
                    // محاولة تنظيف الجدول
                    const tableBody = document.querySelector(`#${funcName.replace('render', '').toLowerCase()}-table tbody`);
                    if (tableBody) {
                        const emptyRow = document.createElement('tr');
                        emptyRow.innerHTML = '<td colspan="100%" class="text-center">حدث خطأ أثناء تحميل البيانات</td>';
                        tableBody.innerHTML = '';
                        tableBody.appendChild(emptyRow);
                    }
                    
                    return null;
                }
            };
            
            log(`تم تعديل وظيفة العرض: ${funcName}`);
        }
    });
}

// تحسين صفحات الجداول
function improveTablePagination() {
    // إضافة معالج للنقر على أزرار التصفح
    document.addEventListener('click', event => {
        // التحقق مما إذا كان النقر على زر تصفح
        const paginationItem = event.target.closest('.page-item');
        
        if (paginationItem && !paginationItem.classList.contains('disabled') && !paginationItem.classList.contains('active')) {
            // تمرير الجدول للأعلى
            const table = paginationItem.closest('.section')?.querySelector('table');
            if (table) {
                table.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}

// تحسين الأداء العام
function improvePerformance() {
    log('تطبيق تحسينات الأداء العام...');
    
    try {
        // تعطيل الرسوم المتحركة غير الضرورية
        limitAnimations();
        
        // تحسين أداء معالجات الأحداث
        optimizeEventHandlers();
        
        // تحسين أداء النماذج
        optimizeFormHandling();
    } catch (error) {
        log(`فشل في تطبيق تحسينات الأداء: ${error.message}`, 'error');
    }
}

// تعطيل الرسوم المتحركة غير الضرورية
function limitAnimations() {
    // إضافة أنماط لتعطيل الرسوم المتحركة
    const style = document.createElement('style');
    style.textContent = `
        @media (prefers-reduced-motion), (max-width: 500px) {
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// تحسين أداء معالجات الأحداث
function optimizeEventHandlers() {
    // إضافة معالجات أحداث مقيدة للأحداث المتكررة
    const throttleEvents = ['scroll', 'resize', 'mousemove'];
    
    throttleEvents.forEach(eventType => {
        // إضافة معالج أحداث مع تقييد
        window.addEventListener(eventType, throttle(event => {
            // لا تفعل شيئًا - هذا فقط لاعتراض الأحداث المتكررة
        }, 100), { passive: true });
    });
}

// تحسين أداء النماذج
function optimizeFormHandling() {
    // إضافة معالج عام للفحص قبل الإرسال
    document.addEventListener('submit', event => {
        // التحقق من أن النموذج ليس في حالة إرسال
        const form = event.target;
        
        if (form.classList.contains('submitting')) {
            // منع الإرسال المتكرر
            event.preventDefault();
            return;
        }
        
        // تعليم النموذج كقيد الإرسال
        form.classList.add('submitting');
        
        // إعادة تعيين الحالة بعد فترة
        setTimeout(() => {
            form.classList.remove('submitting');
        }, 2000);
    });
}

// وظيفة تقييد الأحداث المتكررة
function throttle(callback, delay) {
    let lastCall = 0;
    
    return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
            lastCall = now;
            return callback.apply(this, args);
        }
    };
}

// التحقق مما إذا كان الخطأ متعلقاً بالتجمد
function isFreezingError(errorMessage) {
    if (!errorMessage) return false;
    
    // قائمة بالعبارات المتعلقة بأخطاء التجمد
    const freezeErrorPatterns = [
        'تجمد',
        'freeze',
        'not responding',
        'unresponsive',
        'script timeout',
        'maximum call stack',
        'stack overflow',
        'script taking too long',
        'out of memory',
        'memory limit',
        'render process gone',
        'يرجى إعادة تحميل',
        'refresh',
        'reload'
    ];
    
    // التحقق مما إذا كانت رسالة الخطأ تحتوي على أي من العبارات المتعلقة بالتجمد
    errorMessage = String(errorMessage).toLowerCase();
    return freezeErrorPatterns.some(pattern => errorMessage.includes(pattern.toLowerCase()));
}

// إعادة تحميل الصفحة
function reloadPage() {
    // محاولة إعلام عملية Main بإعادة التحميل القسري
    if (state.systemsAvailable.electronAPI && window.electronAPI) {
        try {
            window.electronAPI.forceReload();
        } catch (error) {
            // تجاهل الأخطاء
        }
    }
    
    // تأخير قصير قبل إعادة التحميل
    setTimeout(() => {
        // إعادة تحميل الصفحة مع تجاهل ذاكرة التخزين المؤقت
        window.location.reload(true);
    }, 100);
}

// تنظيف الموارد
function cleanup() {
    log('تنظيف الموارد...');
    
    // تنظيف المؤقتات
    if (state.cleanupTimer) {
        clearTimeout(state.cleanupTimer);
        state.cleanupTimer = null;
    }
    
    // إزالة زر الإصلاح
    if (state.fixButton && state.fixButton.parentNode) {
        state.fixButton.parentNode.removeChild(state.fixButton);
        state.fixButton = null;
    }
}

// تسجيل رسالة
function log(message, level = 'info') {
    // عدم تسجيل الرسائل إذا كان التسجيل معطلاً
    if (config.logLevel === 'none') return;
    
    // تسجيل الرسائل حسب مستوى التسجيل
    if (level === 'info' && config.logLevel !== 'debug' && config.logLevel !== 'info') return;
    if (level === 'warn' && config.logLevel !== 'debug' && config.logLevel !== 'info' && config.logLevel !== 'warn') return;
    
    // طباعة الرسالة في وحدة التحكم
    const prefix = '[نظام استعادة التجمد]';
    
    switch (level) {
        case 'warn':
            console.warn(`${prefix} ${message}`);
            break;
        case 'error':
            console.error(`${prefix} ${message}`);
            break;
        default:
            console.log(`${prefix} ${message}`);
    }
}

// واجهة API العامة
return {
    init,
    attemptFreezeFix,
    showFixButton,
    hideFixButton,
    reloadPage,
    config, // للتكوين
    state   // للتشخيص
};
})();

// إضافة نظام استعادة التجمد إلى window للوصول إليه عالمياً
window.freezeRecoverySystem = freezeRecoverySystem;

// تهيئة النظام عند تحميل الصفحة
window.addEventListener('load', () => {
    // تأخير قصير لضمان تحميل جميع المكونات
    setTimeout(() => {
        window.freezeRecoverySystem.init();
        
        // إضافة نسخة أكثر استقرارًا من openModal للنظام
        if (window.openModal && typeof window.openModal === 'function') {
            // تخزين الوظيفة الأصلية
            const originalOpenModal = window.openModal;
            
            // استبدال الوظيفة بوظيفة أكثر استقرارًا
            window.openModal = function(modalId) {
                try {
                    // استدعاء الوظيفة الأصلية
                    const result = originalOpenModal.call(this, modalId);
                    
                    // تأخير مسح النماذج وعناصر الإدخال
                    setTimeout(() => {
                        if (window.formFixer) {
                            window.formFixer.scanForFormsAndInputs();
                        }
                    }, 300);
                    
                    return result;
                } catch (error) {
                    console.error(`[نظام استعادة التجمد] خطأ في استدعاء openModal: ${error.message}`);
                    
                    // محاولة فتح النافذة المنبثقة بطريقة بديلة
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                        modal.classList.add('show');
                    }
                    
                    return false;
                }
            };
            
            console.log('[نظام استعادة التجمد] تم تعديل وظيفة openModal');
        }
        
        // إضافة نسخة أكثر استقرارًا من closeModal للنظام
        if (window.closeModal && typeof window.closeModal === 'function') {
            // تخزين الوظيفة الأصلية
            const originalCloseModal = window.closeModal;
            
            // استبدال الوظيفة بوظيفة أكثر استقرارًا
            window.closeModal = function(modalId) {
                try {
                    // استدعاء الوظيفة الأصلية
                    return originalCloseModal.call(this, modalId);
                } catch (error) {
                    console.error(`[نظام استعادة التجمد] خطأ في استدعاء closeModal: ${error.message}`);
                    
                    // محاولة إغلاق النافذة المنبثقة بطريقة بديلة
                    let modal;
                    
                    if (typeof modalId === 'string') {
                        modal = document.getElementById(modalId);
                    } else if (modalId instanceof HTMLElement) {
                        modal = modalId;
                    }
                    
                    if (modal) {
                        modal.classList.remove('active');
                        modal.classList.remove('show');
                    }
                    
                    return false;
                }
            };
            
            console.log('[نظام استعادة التجمد] تم تعديل وظيفة closeModal');
        }
    }, 1000);
});








/**
 * نظام الاستثمار المتكامل - ملف تحميل نظام معالجة التجمد
 * هذا الملف يقوم بتحميل وتفعيل جميع مكونات نظام معالجة التجمد
 */

(function() {
    // إعدادات تحميل النظام
    const config = {
        // ما إذا كان تحميل النظام مفعلاً
        enabled: true,
        
        // المسارات النسبية للملفات المطلوبة
        paths: {
            freezeDetector: 'freeze-detector.js',
            formFixer: 'form-fixer.js',
            integrationScript: 'integration-script.js'
        },
        
        // مهلة تحميل الملفات (بالمللي ثانية)
        timeout: 5000,
        
        // ما إذا كان يجب تنفيذ الإصلاحات الفورية
        applyImmediate: true,
        
        // خيارات تهيئة النظام
        initOptions: {
            autoFix: true,
            showFixButton: true,
            logLevel: 'info'
        }
    };
    
    // معلومات حالة التحميل
    const state = {
        loading: false,
        loaded: {
            freezeDetector: false,
            formFixer: false,
            integrationScript: false
        },
        errors: [],
        startTime: 0
    };
    
    // بدء تحميل النظام
    function loadSystem() {
        // التحقق من التفعيل
        if (!config.enabled) {
            console.log('[نظام معالجة التجمد] النظام معطل، يتم تخطي التحميل');
            return;
        }
        
        console.log('[نظام معالجة التجمد] بدء تحميل نظام معالجة التجمد...');
        
        // تعيين حالة التحميل
        state.loading = true;
        state.startTime = Date.now();
        
        // تحميل الملفات المطلوبة
        loadScript(config.paths.freezeDetector, 'freezeDetector')
            .then(() => {
                state.loaded.freezeDetector = true;
                console.log('[نظام معالجة التجمد] تم تحميل كاشف التجمد');
                
                // تطبيق الإصلاحات الفورية إذا كان مفعلاً
                if (config.applyImmediate && window.freezeDetector) {
                    window.freezeDetector.start();
                }
                
                return loadScript(config.paths.formFixer, 'formFixer');
            })
            .then(() => {
                state.loaded.formFixer = true;
                console.log('[نظام معالجة التجمد] تم تحميل مصلح النماذج');
                
                // تطبيق الإصلاحات الفورية إذا كان مفعلاً
                if (config.applyImmediate && window.formFixer) {
                    window.formFixer.init();
                }
                
                return loadScript(config.paths.integrationScript, 'integrationScript');
            })
            .then(() => {
                state.loaded.integrationScript = true;
                console.log('[نظام معالجة التجمد] تم تحميل ملف التكامل');
                
                // تهيئة النظام بعد تحميل جميع المكونات
                initSystem();
            })
            .catch(error => {
                state.errors.push(error.message);
                console.error('[نظام معالجة التجمد] فشل في تحميل نظام معالجة التجمد:', error);
                
                // محاولة تهيئة النظام مع المكونات المتاحة
                initSystem();
            })
            .finally(() => {
                // تعيين حالة التحميل
                state.loading = false;
                
                // سجل مدة التحميل
                const loadTime = Date.now() - state.startTime;
                console.log(`[نظام معالجة التجمد] اكتمل تحميل النظام في ${loadTime}ms`);
            });
    }
    
    // تحميل ملف جافاسكريبت
    function loadScript(path, name) {
        return new Promise((resolve, reject) => {
            // إنشاء عنصر النص البرمجي
            const script = document.createElement('script');
            script.src = path;
            script.async = true;
            
            // إعداد معالجات الأحداث
            script.onload = () => {
                console.log(`[نظام معالجة التجمد] تم تحميل الملف: ${path}`);
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`[نظام معالجة التجمد] فشل في تحميل الملف: ${path}`, error);
                reject(new Error(`فشل في تحميل ${name}: ${error.message}`));
            };
            
            // إعداد مهلة التحميل
            const timeout = setTimeout(() => {
                reject(new Error(`انتهت مهلة تحميل ${name}`));
            }, config.timeout);
            
            // إلغاء مهلة التحميل عند نجاح التحميل أو فشله
            script.onload = () => {
                clearTimeout(timeout);
                console.log(`[نظام معالجة التجمد] تم تحميل الملف: ${path}`);
                resolve();
            };
            
            script.onerror = (error) => {
                clearTimeout(timeout);
                console.error(`[نظام معالجة التجمد] فشل في تحميل الملف: ${path}`, error);
                reject(new Error(`فشل في تحميل ${name}: ${error.message}`));
            };
            
            // إضافة عنصر النص البرمجي إلى الصفحة
            document.head.appendChild(script);
        });
    }
    
    // تهيئة النظام
    function initSystem() {
        console.log('[نظام معالجة التجمد] تهيئة النظام...');
        
        // تهيئة نظام استعادة التجمد إذا كان متاحاً
        if (window.freezeRecoverySystem) {
            try {
                window.freezeRecoverySystem.init(config.initOptions);
                console.log('[نظام معالجة التجمد] تم تهيئة نظام استعادة التجمد');
            } catch (error) {
                console.error('[نظام معالجة التجمد] فشل في تهيئة نظام استعادة التجمد:', error);
            }
        } else {
            console.warn('[نظام معالجة التجمد] نظام استعادة التجمد غير متاح، تهيئة المكونات الفردية');
            
            // تهيئة المكونات الفردية إذا كانت متاحة
            if (window.freezeDetector && !window.freezeDetector.state.initialized) {
                try {
                    window.freezeDetector.start();
                    console.log('[نظام معالجة التجمد] تم تهيئة كاشف التجمد');
                } catch (error) {
                    console.error('[نظام معالجة التجمد] فشل في تهيئة كاشف التجمد:', error);
                }
            }
            
            if (window.formFixer && !window.formFixer.state.initialized) {
                try {
                    window.formFixer.init();
                    console.log('[نظام معالجة التجمد] تم تهيئة مصلح النماذج');
                } catch (error) {
                    console.error('[نظام معالجة التجمد] فشل في تهيئة مصلح النماذج:', error);
                }
            }
        }
        
        // إضافة معالجات الأحداث العامة
        setupGlobalErrorHandling();
        
        // تحديث الواجهة
        updateUI();
    }
    
    // إعداد معالجة الأخطاء العامة
    function setupGlobalErrorHandling() {
        // إذا لم يتم تحميل نظام استعادة التجمد، إضافة معالجات أخطاء بسيطة
        if (!window.freezeRecoverySystem) {
            // معالجة الأخطاء غير المعالجة
            window.addEventListener('error', (event) => {
                console.error('[نظام معالجة التجمد] خطأ غير معالج:', event.message);
                
                // محاولة إصلاح التجمد إذا كان كاشف التجمد متاحاً
                if (window.freezeDetector && isFreezingError(event.message)) {
                    window.freezeDetector.refresh();
                }
            });
            
            // معالجة الوعود المرفوضة غير المعالجة
            window.addEventListener('unhandledrejection', (event) => {
                console.error('[نظام معالجة التجمد] وعد مرفوض غير معالج:', event.reason);
            });
        }
    }
    
    // تحديث واجهة المستخدم
    function updateUI() {
        // إذا لم يتم تحميل نظام استعادة التجمد، إضافة زر بسيط للإصلاح
        if (!window.freezeRecoverySystem && config.initOptions.showFixButton) {
            // التحقق من وجود الزر مسبقاً
            if (!document.getElementById('simple-fix-button')) {
                // إنشاء زر الإصلاح
                const button = document.createElement('button');
                button.id = 'simple-fix-button';
                button.className = 'simple-fix-button';
                button.title = 'إصلاح تجمد الواجهة';
                button.innerHTML = '<i class="fas fa-sync-alt"></i>';
                
                // إضافة أنماط CSS للزر
                const style = document.createElement('style');
                style.textContent = `
                    .simple-fix-button {
                        position: fixed;
                        bottom: 80px;
                        right: 20px;
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background-color: #f44336;
                        color: white;
                        border: none;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        font-size: 20px;
                    }
                    
                    .simple-fix-button:hover {
                        background-color: #d32f2f;
                    }
                    
                    .simple-fix-button i {
                        animation: spin 2s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                
                // إضافة الأنماط والزر إلى الصفحة
                document.head.appendChild(style);
                document.body.appendChild(button);
                
                // إضافة مستمع لحدث النقر على الزر
                button.addEventListener('click', () => {
                    // محاولة إصلاح التجمد باستخدام المكونات المتاحة
                    attemptSimpleFix();
                });
            }
        }
    }
    
    // محاولة إصلاح بسيطة للتجمد
    function attemptSimpleFix() {
        console.log('[نظام معالجة التجمد] محاولة إصلاح بسيطة للتجمد...');
        
        // استخدام الدوال المتاحة للإصلاح
        if (window.freezeDetector) {
            try {
                window.freezeDetector.refresh();
                console.log('[نظام معالجة التجمد] تم استدعاء كاشف التجمد');
            } catch (error) {
                console.error('[نظام معالجة التجمد] فشل في استدعاء كاشف التجمد:', error);
            }
        }
        
        if (window.formFixer) {
            try {
                window.formFixer.refresh();
                console.log('[نظام معالجة التجمد] تم استدعاء مصلح النماذج');
            } catch (error) {
                console.error('[نظام معالجة التجمد] فشل في استدعاء مصلح النماذج:', error);
            }
        }
        
        // استدعاء دوال تحديث التطبيق المعرفة عالمياً
        const updateFunctions = [
            'updateDashboard',
            'renderInvestorsTable',
            'renderTransactionsTable',
            'renderProfitsTable',
            'renderRecentTransactions',
            'populateInvestorSelects',
            'initEventListeners',
            'updateCharts'
        ];
        
        for (const funcName of updateFunctions) {
            if (window[funcName] && typeof window[funcName] === 'function') {
                try {
                    window[funcName]();
                    console.log(`[نظام معالجة التجمد] تم استدعاء ${funcName}()`);
                } catch (error) {
                    console.error(`[نظام معالجة التجمد] فشل في استدعاء ${funcName}():`, error);
                }
            }
        }
        
        // إعلام المستخدم
        alert('تم تطبيق إصلاح تجمد الواجهة');
    }
    
    // التحقق مما إذا كان الخطأ متعلقاً بالتجمد
    function isFreezingError(errorMessage) {
        if (!errorMessage) return false;
        
        // قائمة بالعبارات المتعلقة بأخطاء التجمد
        const freezeErrorPatterns = [
            'تجمد',
            'freeze',
            'not responding',
            'unresponsive',
            'script timeout',
            'stack overflow'
        ];
        
        // التحقق مما إذا كانت رسالة الخطأ تحتوي على أي من العبارات المتعلقة بالتجمد
        errorMessage = String(errorMessage).toLowerCase();
        return freezeErrorPatterns.some(pattern => errorMessage.includes(pattern.toLowerCase()));
    }
    
    // تحميل النظام عند اكتمال تحميل المستند
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSystem);
    } else {
        // إذا كان المستند قد تم تحميله بالفعل، تحميل النظام فوراً
        loadSystem();
    }
    
    // إضافة النظام إلى window للوصول إليه عالمياً
    window.freezeRecoveryLoader = {
        loadSystem,
        config,
        state
    };
})();

/**
 * إصلاحات خاصة لبعض المشاكل المعروفة في تطبيق نظام الاستثمار المتكامل
 */
(function() {
    // ضمان تنفيذ الإصلاحات بعد تحميل المستند
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySpecificFixes);
    } else {
        // إذا كان المستند قد تم تحميله بالفعل، تنفيذ الإصلاحات فوراً
        applySpecificFixes();
    }
    
    
    function applySpecificFixes() {
        console.log('[إصلاحات خاصة] تطبيق إصلاحات خاصة للمشاكل المعروفة...');
        
        // إصلاح مشكلة زر التحديث
        fixRefreshButton();
        
        // إصلاح مشكلة أزرار النوافذ المنبثقة
        fixModalButtons();
        
        // إصلاح مشكلة الإطار العلوي
        fixTitlebar();
        
        // إصلاح مشاكل التحميل المتأخر
        fixLazyLoading();
        
        // إصلاح زر الإضافة العائم
        fixFloatingActionButton();
    }
    
    // إصلاح مشكلة زر التحديث
    function fixRefreshButton() {
        // البحث عن زر التحديث
        const refreshButton = document.getElementById('refresh-btn');
        
        if (refreshButton) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newButton = refreshButton.cloneNode(true);
            refreshButton.parentNode.replaceChild(newButton, refreshButton);
            
            // إضافة مستمع حدث جديد
            newButton.addEventListener('click', function() {
                // إضافة فئة الدوران
                this.classList.add('rotating');
                
                // عرض إشعار للمستخدم
                if (window.showNotification) {
                    window.showNotification('جارٍ تحديث التطبيق...', 'info');
                }
                
                try {
                    // استدعاء دوال التحديث
                    if (window.loadData) window.loadData();
                    if (window.updateDashboard) window.updateDashboard();
                    if (window.renderInvestorsTable) window.renderInvestorsTable();
                    if (window.renderTransactionsTable) window.renderTransactionsTable();
                    if (window.renderProfitsTable) window.renderProfitsTable();
                    if (window.renderRecentTransactions) window.renderRecentTransactions();
                    if (window.populateInvestorSelects) window.populateInvestorSelects();
                    if (window.updateCharts) window.updateCharts();
                    
                    // استدعاء مصلح النماذج إذا كان متاحاً
                    if (window.formFixer) window.formFixer.refresh();
                    
                    // عرض إشعار نجاح
                    setTimeout(() => {
                        if (window.showNotification) {
                            window.showNotification('تم تحديث التطبيق بنجاح', 'success');
                        }
                        
                        // إزالة فئة الدوران
                        this.classList.remove('rotating');
                    }, 1000);
                } catch (error) {
                    console.error('[إصلاحات خاصة] خطأ في تحديث التطبيق:', error);
                    
                    // عرض إشعار فشل
                    if (window.showNotification) {
                        window.showNotification('حدث خطأ أثناء تحديث التطبيق', 'error');
                    }
                    
                    // إزالة فئة الدوران
                    this.classList.remove('rotating');
                }
            });
            
            console.log('[إصلاحات خاصة] تم إصلاح زر التحديث');
        }
    }
    
    // إصلاح مشكلة أزرار النوافذ المنبثقة
    function fixModalButtons() {
        // إضافة معالج عام لأزرار فتح النوافذ المنبثقة
        document.addEventListener('click', function(event) {
            // البحث عن زر فتح نافذة منبثقة
            const modalTrigger = event.target.closest('[data-modal], .modal-trigger, [data-target]');
            
            if (modalTrigger) {
                // الحصول على معرف النافذة المنبثقة
                const modalId = modalTrigger.getAttribute('data-modal') || 
                               modalTrigger.getAttribute('data-target')?.replace('#', '') ||
                               modalTrigger.getAttribute('href')?.replace('#', '');
                
                if (modalId) {
                    // تأخير المسح للسماح بفتح النافذة المنبثقة
                    setTimeout(() => {
                        // البحث عن جميع عناصر الإدخال في النافذة المنبثقة
                        const modal = document.getElementById(modalId);
                        
                        if (modal) {
                            // إصلاح النماذج وعناصر الإدخال في النافذة المنبثقة
                            if (window.formFixer) {
                                const inputs = modal.querySelectorAll('input, textarea, select');
                                
                                inputs.forEach(input => {
                                    try {
                                        window.formFixer._reinitializeInput(input);
                                    } catch (error) {
                                        // تجاهل الأخطاء
                                    }
                                });
                            }
                        }
                    }, 300);
                }
            }
        }, { passive: true });
    }
    
    // إصلاح مشكلة الإطار العلوي
    function fixTitlebar() {
        // البحث عن أزرار التحكم في الإطار
        const minimizeBtn = document.getElementById('minimize-btn');
        const maximizeBtn = document.getElementById('maximize-btn');
        const closeBtn = document.getElementById('close-btn');
        
        // إصلاح زر التصغير
        if (minimizeBtn) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newMinimizeBtn = minimizeBtn.cloneNode(true);
            minimizeBtn.parentNode.replaceChild(newMinimizeBtn, minimizeBtn);
            
            // إضافة مستمع حدث جديد
            newMinimizeBtn.addEventListener('click', function() {
                if (window.windowControls) {
                    window.windowControls.minimize();
                }
            });
        }
        
        // إصلاح زر التكبير
        if (maximizeBtn) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newMaximizeBtn = maximizeBtn.cloneNode(true);
            maximizeBtn.parentNode.replaceChild(newMaximizeBtn, maximizeBtn);
            
            // إضافة مستمع حدث جديد
            newMaximizeBtn.addEventListener('click', function() {
                if (window.windowControls) {
                    window.windowControls.maximize();
                }
            });
        }
        
        // إصلاح زر الإغلاق
        if (closeBtn) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // إضافة مستمع حدث جديد
            newCloseBtn.addEventListener('click', function() {
                if (window.windowControls) {
                    window.windowControls.close();
                }
            });
        }
    }
    
    // إصلاح مشاكل التحميل المتأخر
    function fixLazyLoading() {
        // التأكد من تحميل البيانات بعد تغيير الصفحة
        document.addEventListener('click', function(event) {
            // البحث عن رابط تنقل
            const navLink = event.target.closest('.nav-link, [data-page]');
            
            if (navLink) {
                // تأخير تحميل البيانات
                setTimeout(() => {
                    const pageId = navLink.getAttribute('data-page') || 
                                  navLink.getAttribute('href')?.replace('#', '');
                    
                    if (pageId) {
                        // تحميل البيانات حسب الصفحة
                        switch (pageId) {
                            case 'dashboard':
                                if (window.updateDashboard) window.updateDashboard();
                                if (window.renderRecentTransactions) window.renderRecentTransactions();
                                break;
                                
                            case 'investors':
                                if (window.renderInvestorsTable) window.renderInvestorsTable();
                                break;
                                
                            case 'transactions':
                                if (window.renderTransactionsTable) window.renderTransactionsTable();
                                break;
                                
                            case 'profits':
                                if (window.renderProfitsTable) window.renderProfitsTable();
                                break;
                        }
                    }
                }, 300);
            }
        }, { passive: true });
    }
    
    // إصلاح زر الإضافة العائم
    function fixFloatingActionButton() {
        // البحث عن زر الإضافة العائم
        const fab = document.getElementById('add-new-fab');
        
        if (fab) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newFab = fab.cloneNode(true);
            fab.parentNode.replaceChild(newFab, fab);
            
            // إضافة مستمع حدث جديد
            newFab.addEventListener('click', function(e) {
                e.stopPropagation(); // منع انتشار الحدث
                
                // التحقق مما إذا كانت القائمة مفتوحة بالفعل
                const existingMenu = document.querySelector('.fab-menu');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }
            
                // إنشاء القائمة المنسدلة
                const menu = document.createElement('div');
                menu.className = 'fab-menu';
                menu.innerHTML = `
                    <div class="fab-menu-item" data-action="add-investor">
                        <i class="fas fa-user-plus"></i>
                        <span>إضافة مستثمر</span>
                    </div>
                    <div class="fab-menu-item" data-action="add-deposit">
                        <i class="fas fa-arrow-up"></i>
                        <span>إيداع جديد</span>
                    </div>
                    <div class="fab-menu-item" data-action="add-withdraw">
                        <i class="fas fa-arrow-down"></i>
                        <span>سحب جديد</span>
                    </div>
                    <div class="fab-menu-item" data-action="pay-profit">
                        <i class="fas fa-hand-holding-usd"></i>
                        <span>دفع أرباح</span>
                    </div>
                `;
            
                // تحديد موقع القائمة بناءً على موقع الزر
                const fabRect = this.getBoundingClientRect();
                menu.style.position = 'fixed';
                menu.style.bottom = (window.innerHeight - fabRect.top + 10) + 'px';
                menu.style.left = (fabRect.left + 10) + 'px';
                menu.style.zIndex = '1000';
            
                // أنماط القائمة
                menu.style.background = 'white';
                menu.style.borderRadius = '16px';
                menu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                menu.style.padding = '12px';
                menu.style.minWidth = '220px';
                menu.style.fontFamily = 'Tajawal, sans-serif';
                menu.style.animation = 'fadeInUp 0.3s ease';
            
                // أنماط عناصر القائمة
                const menuItems = menu.querySelectorAll('.fab-menu-item');
                menuItems.forEach(item => {
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.padding = '12px 16px';
                    item.style.margin = '6px 0';
                    item.style.cursor = 'pointer';
                    item.style.borderRadius = '12px';
                    item.style.transition = 'all 0.2s ease-in-out';
                    item.style.color = '#333';
                    item.style.fontSize = '15px';
                    item.style.fontWeight = '500';
            // تفاعل hover
item.addEventListener('mouseenter', function () {
    this.style.background = '#f0f4ff';
    this.style.transform = 'translateX(-4px)';
});

item.addEventListener('mouseleave', function () {
    this.style.background = 'transparent';
    this.style.transform = 'translateX(0)';
});

// عند النقر على أحد خيارات القائمة
item.addEventListener('click', function (e) {
    e.stopPropagation(); // منع انتشار الحدث
    
    // الحصول على نوع الإجراء من سمة data-action
    const action = this.getAttribute('data-action');
    
    // إغلاق القائمة المنسدلة أولاً
    if (menu.parentNode) {
        document.body.removeChild(menu);
    }
    
    // فتح النافذة المنبثقة المناسبة بعد إغلاق القائمة
    setTimeout(() => {
        try {
            switch (action) {
                case 'add-investor': 
                    if (window.openModal) {
                        window.openModal('add-investor-modal');
                    } else {
                        const modal = document.getElementById('add-investor-modal');
                        if (modal) modal.classList.add('active');
                    }
                    break;
                    
                case 'add-deposit': 
                    if (window.openModal) {
                        window.openModal('add-deposit-modal');
                    } else {
                        const modal = document.getElementById('add-deposit-modal');
                        if (modal) modal.classList.add('active');
                    }
                    break;
                    
                case 'add-withdraw': 
                    if (window.openModal) {
                        window.openModal('add-withdraw-modal');
                    } else {
                        const modal = document.getElementById('add-withdraw-modal');
                        if (modal) modal.classList.add('active');
                    }
                    break;
                    
                case 'pay-profit': 
                    if (window.openModal) {
                        window.openModal('pay-profit-modal');
                    } else {
                        const modal = document.getElementById('pay-profit-modal');
                        if (modal) modal.classList.add('active');
                    }
                    break;
            }
            
            // إطلاق حدث تنقل
            const event = new CustomEvent('page:navigate', {
                detail: { action: action }
            });
            document.dispatchEvent(event);
            
            // تنفيذ إعادة تهيئة النماذج بعد فتح النافذة المنبثقة
            setTimeout(() => {
                if (window.formFixer) {
                    window.formFixer.scanForFormsAndInputs();
                }
            }, 300);
            
        } catch (error) {
            console.error(`[إصلاحات خاصة] خطأ في تنفيذ الإجراء: ${action}`, error);
            
            // محاولة بديلة لفتح النافذة المنبثقة
            try {
                let modalId = '';
                switch (action) {
                    case 'add-investor': modalId = 'add-investor-modal'; break;
                    case 'add-deposit': modalId = 'add-deposit-modal'; break;
                    case 'add-withdraw': modalId = 'add-withdraw-modal'; break;
                    case 'pay-profit': modalId = 'pay-profit-modal'; break;
                }
                
                if (modalId) {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                        console.log(`[إصلاحات خاصة] تم فتح النافذة المنبثقة بديلاً: ${modalId}`);
                    }
                }
            } catch (err) {
                // تجاهل أخطاء المحاولة البديلة
            }
        }
    }, 50);
});

// أنماط الأيقونة
const icon = item.querySelector('i');
if (icon) {
    icon.style.marginLeft = '12px';
    icon.style.fontSize = '1.3rem';
    icon.style.width = '24px';
    icon.style.color = '#007BFF'; // لون أزرق جميل
}
});

// إضافة القائمة إلى الصفحة
document.body.appendChild(menu);

// إغلاق القائمة عند النقر خارجها
const handleClickOutside = function (event) {
    // التحقق مما إذا كان النقر خارج القائمة وليس على الزر العائم
    if (!menu.contains(event.target) && event.target !== document.getElementById('add-new-fab')) {
        if (menu.parentNode) {
            menu.remove();
        }
        document.removeEventListener('click', handleClickOutside);
    }
};

setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
}, 10);
});

console.log('[إصلاحات خاصة] تم إصلاح زر الإضافة العائم');
}
}
})();