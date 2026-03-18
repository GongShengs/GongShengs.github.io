(() => {
    var navEl = document.getElementById("theme-nav");
    if (navEl) {
        navEl.addEventListener('click', (e) => {
            if (window.innerWidth <= 600) {
                if (navEl.classList.contains('open')) {
                    navEl.style.height = ''
                } else {
                    navEl.style.height = 48 + document.querySelector('#theme-nav .nav-items').clientHeight + 'px'
                }
                navEl.classList.toggle('open')
            } else {
                if (navEl.classList.contains('open')) {
                    navEl.style.height = ''
                    navEl.classList.remove('open')
                }
            }
        })
        window.addEventListener('resize', (e) => {
            if (navEl.classList.contains('open')) {
                navEl.style.height = 48 + document.querySelector('#theme-nav .nav-items').clientHeight + 'px'
            }
            if (window.innerWidth > 600) {
                if (navEl.classList.contains('open')) {
                    navEl.style.height = ''
                    navEl.classList.remove('open')
                }
            }
        })
    }

    // 简历链接：根据语言打开对应PDF
    function updateResumeLinks() {
        const lang = localStorage.getItem('lang') || 'en';
        const pdf = lang === 'zh-CN' 
            ? '/resume/简历-胡武强-技术美术.pdf' 
            : '/resume/简历-胡武强-技术美术_EN.pdf';
        document.querySelectorAll('a[href^="/resume"]').forEach(link => {
            if (!link.href.includes('.pdf')) return;
            link.href = pdf;
            link.target = '_blank';
        });
    }
    // 初始设置
    document.querySelectorAll('a[href="/resume"]').forEach(link => {
        const lang = localStorage.getItem('lang') || 'en';
        link.href = lang === 'zh-CN' 
            ? '/resume/简历-胡武强-技术美术.pdf' 
            : '/resume/简历-胡武强-技术美术_EN.pdf';
        link.target = '_blank';
    });
    // 暴露给全局，供语言切换时调用
    window.updateResumeLinks = updateResumeLinks;

    // 动态加载搜索功能
    (function loadSearch() {
        // 加载搜索 CSS
        if (!document.querySelector('link[href="/css/search.css"]')) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = '/css/search.css';
            document.head.appendChild(css);
        }
        // 加载搜索 JS
        if (!document.querySelector('script[src="/js/search.js"]')) {
            const script = document.createElement('script');
            script.src = '/js/search.js';
            document.body.appendChild(script);
        }
    })();
})()