(() => {
    var navEl = document.getElementById("theme-nav");
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

    // 简历链接：直接打开PDF到新标签页
    document.querySelectorAll('a[href="/resume"]').forEach(link => {
        link.href = '/resume/简历-胡武强-技术美术.pdf';
        link.target = '_blank';
    });

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