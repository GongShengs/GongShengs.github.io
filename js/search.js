/**
 * 全站搜索功能
 */
(function() {
    let searchData = null;
    let searchOverlay = null;
    let searchInput = null;
    let searchResults = null;
    let isLoading = false;

    // 创建搜索弹窗 HTML
    function createSearchModal() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-container">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <input type="text" class="search-input" placeholder="搜索文章..." autocomplete="off">
                    <button class="search-close" aria-label="关闭搜索">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="search-results">
                    <div class="search-status">
                        <div class="search-status-icon">🔍</div>
                        <div class="search-status-text">输入关键词开始搜索</div>
                    </div>
                </div>
                <div class="search-hint">
                    <span><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
                    <span><kbd>Enter</kbd> 打开</span>
                    <span><kbd>Esc</kbd> 关闭</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        searchOverlay = overlay;
        searchInput = overlay.querySelector('.search-input');
        searchResults = overlay.querySelector('.search-results');

        // 绑定事件
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeSearch();
            }
        });

        overlay.querySelector('.search-close').addEventListener('click', closeSearch);

        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keydown', handleKeyboard);
    }

    // 打开搜索
    function openSearch() {
        if (!searchOverlay) {
            createSearchModal();
        }
        searchOverlay.classList.add('active');
        searchInput.value = '';
        searchInput.focus();
        document.body.style.overflow = 'hidden';
        
        // 加载搜索数据
        if (!searchData && !isLoading) {
            loadSearchData();
        }
    }

    // 关闭搜索
    function closeSearch() {
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 加载搜索数据
    function loadSearchData() {
        isLoading = true;
        showLoading();

        fetch('/search.xml')
            .then(response => response.text())
            .then(str => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(str, 'text/xml');
                const entries = xml.querySelectorAll('entry');
                
                searchData = [];
                entries.forEach(entry => {
                    const title = entry.querySelector('title')?.textContent || '';
                    const url = entry.querySelector('url')?.textContent || '';
                    const content = entry.querySelector('content')?.textContent || '';
                    
                    // 清理 HTML 标签，提取纯文本
                    const cleanContent = content
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .substring(0, 500);

                    searchData.push({
                        title: title,
                        url: url,
                        content: cleanContent
                    });
                });
                
                isLoading = false;
                showInitialState();
            })
            .catch(err => {
                console.error('搜索数据加载失败:', err);
                isLoading = false;
                showError();
            });
    }

    // 搜索处理
    function handleSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            showInitialState();
            return;
        }

        if (!searchData) {
            showLoading();
            return;
        }

        const results = searchData.filter(item => {
            return item.title.toLowerCase().includes(query) ||
                   item.content.toLowerCase().includes(query);
        });

        displayResults(results, query);
    }

    // 显示搜索结果
    function displayResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-status">
                    <div class="search-status-icon">😕</div>
                    <div class="search-status-text">未找到 "${escapeHtml(query)}" 相关内容</div>
                </div>
            `;
            return;
        }

        const html = results.map((item, index) => {
            const highlightedTitle = highlightText(item.title, query);
            const highlightedContent = highlightText(item.content.substring(0, 150) + '...', query);
            
            // 根据URL判断分类
            let category = '文章';
            if (item.url.includes('Houdini')) category = 'Houdini';
            else if (item.url.includes('Shader')) category = 'Shader';
            else if (item.url.includes('Unity')) category = 'Unity';

            return `
                <a href="${item.url}" class="search-result-item" data-index="${index}">
                    <span class="search-result-category">${category}</span>
                    <h4 class="search-result-title">${highlightedTitle}</h4>
                    <p class="search-result-content">${highlightedContent}</p>
                </a>
            `;
        }).join('');

        searchResults.innerHTML = html;
    }

    // 高亮匹配文本
    function highlightText(text, query) {
        if (!query) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escaped.replace(regex, '<mark>$1</mark>');
    }

    // 转义 HTML
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 转义正则特殊字符
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 显示加载状态
    function showLoading() {
        searchResults.innerHTML = '<div class="search-loading"></div>';
    }

    // 显示初始状态
    function showInitialState() {
        searchResults.innerHTML = `
            <div class="search-status">
                <div class="search-status-icon">🔍</div>
                <div class="search-status-text">输入关键词开始搜索</div>
            </div>
        `;
    }

    // 显示错误状态
    function showError() {
        searchResults.innerHTML = `
            <div class="search-status">
                <div class="search-status-icon">❌</div>
                <div class="search-status-text">搜索数据加载失败，请刷新重试</div>
            </div>
        `;
    }

    // 键盘导航
    function handleKeyboard(e) {
        const items = searchResults.querySelectorAll('.search-result-item');
        const current = searchResults.querySelector('.search-result-item:focus');
        let index = current ? parseInt(current.dataset.index) : -1;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                index = Math.min(index + 1, items.length - 1);
                items[index]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                index = Math.max(index - 1, 0);
                items[index]?.focus();
                break;
            case 'Enter':
                if (current) {
                    window.location.href = current.href;
                }
                break;
            case 'Escape':
                closeSearch();
                break;
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 初始化：绑定搜索按钮
    function init() {
        // 将搜索按钮的链接行为改为打开弹窗
        document.querySelectorAll('a[href="/search"], a[href="/search/"], a.nav-item-search').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openSearch();
            });
            link.removeAttribute('target');
        });

        // 快捷键 Ctrl/Cmd + K 打开搜索
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            if (e.key === 'Escape' && searchOverlay?.classList.contains('active')) {
                closeSearch();
            }
        });

        // 检查是否从 /search 页面跳转过来，自动打开搜索弹窗
        if (sessionStorage.getItem('openSearch') === 'true') {
            sessionStorage.removeItem('openSearch');
            setTimeout(openSearch, 100);
        }
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
