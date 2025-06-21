/**
 * Vendor Library Loader with CDN Fallbacks
 * Provides maximum reliability by falling back to local files if CDN fails
 */

class VendorLoader {
    constructor() {
        this.loaded = {};
        this.loading = {};
    }

    /**
     * Load CSS with CDN fallback
     */
    loadCSS(name, cdnUrl, localUrl) {
        return new Promise((resolve, reject) => {
            if (this.loaded[name]) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cdnUrl;
            
            const timeout = setTimeout(() => {
                console.warn(`CDN timeout for ${name}, falling back to local`);
                this.loadLocalCSS(name, localUrl, resolve, reject);
            }, 5000);

            link.onload = () => {
                clearTimeout(timeout);
                this.loaded[name] = true;
                resolve();
            };

            link.onerror = () => {
                clearTimeout(timeout);
                console.warn(`CDN failed for ${name}, falling back to local`);
                this.loadLocalCSS(name, localUrl, resolve, reject);
            };

            document.head.appendChild(link);
        });
    }

    loadLocalCSS(name, localUrl, resolve, reject) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = localUrl;
        
        link.onload = () => {
            this.loaded[name] = true;
            resolve();
        };
        
        link.onerror = () => {
            console.error(`Failed to load ${name} from both CDN and local`);
            reject(new Error(`Failed to load ${name}`));
        };
        
        document.head.appendChild(link);
    }

    /**
     * Load JS with CDN fallback
     */
    loadJS(name, cdnUrl, localUrl, globalCheck = null) {
        return new Promise((resolve, reject) => {
            if (this.loaded[name]) {
                resolve();
                return;
            }

            if (this.loading[name]) {
                this.loading[name].push({ resolve, reject });
                return;
            }

            this.loading[name] = [{ resolve, reject }];

            const script = document.createElement('script');
            script.src = cdnUrl;
            script.async = true;
            
            const timeout = setTimeout(() => {
                console.warn(`CDN timeout for ${name}, falling back to local`);
                this.loadLocalJS(name, localUrl, globalCheck);
            }, 5000);

            script.onload = () => {
                clearTimeout(timeout);
                this.handleJSLoad(name, globalCheck);
            };

            script.onerror = () => {
                clearTimeout(timeout);
                console.warn(`CDN failed for ${name}, falling back to local`);
                this.loadLocalJS(name, localUrl, globalCheck);
            };

            document.head.appendChild(script);
        });
    }

    loadLocalJS(name, localUrl, globalCheck) {
        const script = document.createElement('script');
        script.src = localUrl;
        script.async = true;
        
        script.onload = () => {
            this.handleJSLoad(name, globalCheck);
        };
        
        script.onerror = () => {
            console.error(`Failed to load ${name} from both CDN and local`);
            this.handleJSError(name, new Error(`Failed to load ${name}`));
        };
        
        document.head.appendChild(script);
    }

    handleJSLoad(name, globalCheck) {
        // Optional check if global variable exists
        if (globalCheck && !window[globalCheck]) {
            setTimeout(() => {
                if (!window[globalCheck]) {
                    this.handleJSError(name, new Error(`Global ${globalCheck} not found after loading ${name}`));
                    return;
                }
                this.completeJSLoad(name);
            }, 100);
        } else {
            this.completeJSLoad(name);
        }
    }

    completeJSLoad(name) {
        this.loaded[name] = true;
        const callbacks = this.loading[name] || [];
        delete this.loading[name];
        
        callbacks.forEach(({ resolve }) => resolve());
    }

    handleJSError(name, error) {
        const callbacks = this.loading[name] || [];
        delete this.loading[name];
        
        callbacks.forEach(({ reject }) => reject(error));
    }

    /**
     * Load multiple libraries in parallel
     */
    async loadAll(libraries) {
        const promises = libraries.map(lib => {
            if (lib.type === 'css') {
                return this.loadCSS(lib.name, lib.cdnUrl, lib.localUrl);
            } else {
                return this.loadJS(lib.name, lib.cdnUrl, lib.localUrl, lib.globalCheck);
            }
        });

        try {
            await Promise.all(promises);
            console.log('All vendor libraries loaded successfully');
        } catch (error) {
            console.error('Some vendor libraries failed to load:', error);
        }
    }
}

// Global instance
window.vendorLoader = new VendorLoader();

// Auto-load critical libraries
document.addEventListener('DOMContentLoaded', function() {
    const criticalLibraries = [
        {
            name: 'bootstrap-css',
            type: 'css',
            cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css',
            localUrl: '/vendor/bootstrap/css/bootstrap.min.css'
        },
        {
            name: 'fontawesome',
            type: 'css', 
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
            localUrl: '/vendor/fontawesome/css/all.min.css'
        },
        {
            name: 'bootstrap-js',
            type: 'js',
            cdnUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js',
            localUrl: '/vendor/bootstrap/js/bootstrap.bundle.min.js',
            globalCheck: 'bootstrap'
        }
    ];

    window.vendorLoader.loadAll(criticalLibraries);
});
