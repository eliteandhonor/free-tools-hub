/**
 * Free Tools Hub - Main JavaScript Application
 * Handles all site functionality including search, navigation, and tool loading
 */

const FreeToolsHub = {
    // Application state
    config: {
        tools: [],
        categories: {},
        searchIndex: []
    },
    
    // Core components
    components: {
        navigation: null,
        toolsDisplay: null,
        search: null
    },
    
    // Initialize application
    init: function() {
        console.log('FreeToolsHub: Initializing application...');
        this.loadToolsConfiguration();
        this.setupNavigation();
        this.setupMobileNavigation();
        this.setupSearch();
        this.setupAccessibility();
        this.displayFeaturedTools();
        this.updateCategoryStats();
    },
    
    // Load tools configuration
    loadToolsConfiguration: async function() {
        try {
            const response = await fetch('/data/tools-config.json');
            const data = await response.json();
            
            this.config.tools = data.tools || [];
            this.config.categories = data.categories || {};
            
            // Build search index
            this.buildSearchIndex();
            
            console.log(`FreeToolsHub: Loaded ${this.config.tools.length} tools`);
            return data;
        } catch (error) {
            console.error('FreeToolsHub: Error loading tools configuration:', error);
            // Fallback to window.toolsConfig if available
            if (window.toolsConfig) {
                this.config.tools = window.toolsConfig.tools || [];
                this.config.categories = window.toolsConfig.categories || {};
                this.buildSearchIndex();
            }
        }
    },
    
    // Build search index for fast searching
    buildSearchIndex: function() {
        this.config.searchIndex = this.config.tools.map(tool => ({
            id: tool.id,
            name: tool.name.toLowerCase(),
            description: tool.description.toLowerCase(),
            category: tool.category.toLowerCase(),
            tags: (tool.tags || []).join(' ').toLowerCase()
        }));
    },
    
    // Setup navigation functionality
    setupNavigation: function() {
        // Handle dropdown menus
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', !isOpen);
                    menu.style.display = isOpen ? 'none' : 'block';
                });
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    if (toggle && menu) {
                        toggle.setAttribute('aria-expanded', 'false');
                        menu.style.display = 'none';
                    }
                });
            }
        });
    },
    
    // Setup mobile navigation
    setupMobileNavigation: function() {
        const navToggle = document.getElementById('navbar-toggle');
        const navMenu = document.getElementById('navbar-nav');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isOpen);
                navMenu.classList.toggle('active');
            });
        }
    },
    
    // Setup search functionality
    setupSearch: function() {
        const heroSearch = document.getElementById('heroSearch');
        const heroSearchBtn = document.getElementById('heroSearchBtn');
        
        if (heroSearch) {
            // Handle Enter key
            heroSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(heroSearch.value);
                }
            });
            
            // Handle real-time search
            heroSearch.addEventListener('input', (e) => {
                if (e.target.value.length > 2) {
                    this.showSearchSuggestions(e.target.value);
                } else {
                    this.hideSearchSuggestions();
                }
            });
        }
        
        if (heroSearchBtn) {
            heroSearchBtn.addEventListener('click', () => {
                const query = heroSearch ? heroSearch.value : '';
                this.performSearch(query);
            });
        }
    },
    
    // Perform search
    performSearch: function(query) {
        if (!query.trim()) return;
        
        const results = this.searchTools(query);
        console.log(`FreeToolsHub: Found ${results.length} results for "${query}"`);
        
        // For now, redirect to tools page with search parameter
        window.location.href = `/tools/?search=${encodeURIComponent(query)}`;
    },
    
    // Search tools
    searchTools: function(query) {
        if (!query || !this.config.searchIndex.length) return [];
        
        const searchTerm = query.toLowerCase();
        
        return this.config.searchIndex.filter(tool => 
            tool.name.includes(searchTerm) ||
            tool.description.includes(searchTerm) ||
            tool.category.includes(searchTerm) ||
            tool.tags.includes(searchTerm)
        ).map(result => this.config.tools.find(tool => tool.id === result.id));
    },
    
    // Show search suggestions
    showSearchSuggestions: function(query) {
        const results = this.searchTools(query).slice(0, 5);
        const resultsContainer = document.getElementById('search-results');
        
        if (resultsContainer && results.length > 0) {
            resultsContainer.innerHTML = results.map(tool => 
                `<div class="search-suggestion" data-tool-id="${tool.id}">
                    <strong>${tool.name}</strong>
                    <small>${tool.description}</small>
                </div>`
            ).join('');
            resultsContainer.style.display = 'block';
        }
    },
    
    // Hide search suggestions
    hideSearchSuggestions: function() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    },
    
    // Setup accessibility features
    setupAccessibility: function() {
        // Add focus management
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }
        
        // Keyboard navigation for dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open dropdowns
                const openDropdowns = document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]');
                openDropdowns.forEach(toggle => {
                    toggle.setAttribute('aria-expanded', 'false');
                    const menu = toggle.parentElement.querySelector('.dropdown-menu');
                    if (menu) menu.style.display = 'none';
                    toggle.focus();
                });
            }
        });
    },
    
    // Display featured tools
    displayFeaturedTools: function() {
        const container = document.getElementById('featured-tools-grid');
        if (!container) return;
        
        // Get featured tools (first 6 tools for now)
        const featuredTools = this.config.tools.slice(0, 6);
        
        if (featuredTools.length > 0) {
            container.innerHTML = featuredTools.map(tool => 
                `<div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${tool.name}</h5>
                            <p class="card-text">${tool.description}</p>
                            <a href="/tools/${tool.id}/" class="btn btn-primary">Use Tool</a>
                        </div>
                    </div>
                </div>`
            ).join('');
        }
    },
    
    
    // Display tools functionality
    displayTools: function() {
        const container = document.getElementById('tools-grid');
        if (!container) return;
        
        const tools = this.config.tools;
        if (tools.length === 0) return;
        
        container.innerHTML = tools.map(tool => 
            `<div class="tool-card" data-tool-id="${tool.id}">
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <a href="/tools/${tool.id}/" class="btn btn-primary">Use Tool</a>
            </div>`
        ).join('');
    },
    // Update category statistics
    updateCategoryStats: function() {
        Object.keys(this.config.categories).forEach(categoryKey => {
            const count = this.config.tools.filter(tool => tool.category === categoryKey).length;
            const element = document.getElementById(`${categoryKey}-tools-count`);
            if (element) {
                element.textContent = `${count} tools`;
            }
        });
    }
};

// Global helper functions for backward compatibility
function searchToolsFromHero() {
    const searchInput = document.getElementById('heroSearch');
    if (searchInput && FreeToolsHub.searchTools) {
        const query = searchInput.value;
        if (query.length > 2) {
            FreeToolsHub.showSearchSuggestions(query);
        } else {
            FreeToolsHub.hideSearchSuggestions();
        }
    }
}

function performSearch() {
    const searchInput = document.getElementById('heroSearch');
    if (searchInput && FreeToolsHub.performSearch) {
        FreeToolsHub.performSearch(searchInput.value);
    }
}

function sortTools() {
    // Future implementation for tool sorting
    console.log('Sort tools functionality');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FreeToolsHub.init();
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is visible again, refresh if needed
        FreeToolsHub.updateCategoryStats();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeToolsHub;
}

// Make available globally
window.FreeToolsHub = FreeToolsHub;
