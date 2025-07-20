// Content script for WiFi Auto Login Extension
(function() {
  'use strict';

  // Function to detect network name from page content
  function detectNetworkName() {
    const pageText = document.body.innerText.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    
    // Common patterns for network names in portal pages
    const networkPatterns = [
      /network:?\s*([a-zA-Z0-9_-]+)/i,
      /ssid:?\s*([a-zA-Z0-9_-]+)/i,
      /wifi:?\s*([a-zA-Z0-9_-]+)/i,
      /connected to:?\s*([a-zA-Z0-9_-]+)/i,
      /welcome to:?\s*([a-zA-Z0-9_-]+)/i
    ];
    
    // Try to extract from page text
    for (const pattern of networkPatterns) {
      const match = pageText.match(pattern) || pageTitle.match(pattern);
      if (match && match[1]) {
        console.log('WiFi Auto Login: Detected network name:', match[1]);
        return match[1].trim();
      }
    }
    
    // Try to extract from URL hostname (sometimes contains network info)
    const hostname = window.location.hostname;
    if (hostname && !hostname.includes('192.168') && !hostname.includes('10.0') && !hostname.includes('172.')) {
      const networkName = hostname.split('.')[0];
      if (networkName && networkName.length > 2) {
        console.log('WiFi Auto Login: Detected network name from hostname:', networkName);
        return networkName;
      }
    }
    
    return null;
  }

  // Common portal page indicators
  const PORTAL_INDICATORS = [
    'username',
    'password',
    'login',
    'signin',
    'auth',
    'captive',
    'portal',
    'welcome',
    'connect',
    'internet access',
    'wifi',
    'hotspot'
  ];

  // Common form field selectors
  const USERNAME_SELECTORS = [
    'input[name*="user" i]',
    'input[name*="login" i]',
    'input[name*="email" i]',
    'input[name*="username" i]',
    'input[name*="userid" i]',
    'input[name*="account" i]',
    'input[id*="user" i]',
    'input[id*="login" i]',
    'input[id*="email" i]',
    'input[id*="username" i]',
    'input[id*="userid" i]',
    'input[id*="account" i]',
    'input[type="text"]:not([name*="pass" i]):not([id*="pass" i])',
    'input[type="email"]',
    'input[placeholder*="user" i]',
    'input[placeholder*="login" i]',
    'input[placeholder*="email" i]',
    'input[placeholder*="username" i]',
    'input[placeholder*="account" i]'
  ];

  const PASSWORD_SELECTORS = [
    'input[name*="pass" i]',
    'input[name*="pwd" i]',
    'input[id*="pass" i]',
    'input[id*="pwd" i]',
    'input[type="password"]',
    'input[placeholder*="pass" i]'
  ];

  const SUBMIT_SELECTORS = [
    'input[type="submit"]',
    'button[type="submit"]',
    'button[name*="login" i]',
    'button[id*="login" i]',
    'button[name*="connect" i]',
    'button[id*="connect" i]',
    'button[name*="submit" i]',
    'button[id*="submit" i]',
    'input[value*="login" i]',
    'input[value*="connect" i]',
    'input[value*="submit" i]',
    'input[value*="sign in" i]',
    'input[value*="access" i]',
    '.btn-login',
    '.login-btn',
    '.submit-btn',
    '.connect-btn',
    'form button:last-child',
    'form input[type="submit"]:last-child'
  ];

  function isPortalPage(strictMode = 'strict') {
    const pageText = document.body.innerText.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    // Early exit for known non-portal sites
    const nonPortalDomains = [
      'google.com', 'facebook.com', 'youtube.com', 'amazon.com', 
      'microsoft.com', 'github.com', 'stackoverflow.com', 'reddit.com',
      'twitter.com', 'linkedin.com', 'instagram.com', 'netflix.com',
      'apple.com', 'adobe.com', 'dropbox.com', 'spotify.com',
      'paypal.com', 'ebay.com', 'wikipedia.org', 'mozilla.org',
      'office.com', 'outlook.com', 'live.com', 'skype.com',
      'discord.com', 'slack.com', 'zoom.us', 'teams.microsoft.com'
    ];
    
    const hostname = window.location.hostname.toLowerCase();
    if (nonPortalDomains.some(domain => hostname.includes(domain))) {
      console.log('WiFi Auto Login: Skipping known non-portal site:', hostname);
      return false;
    }
    
    // Must have login form with both username/password fields
    const passwordField = document.querySelector('input[type="password"]');
    const usernameField = document.querySelector('input[type="text"], input[type="email"], input[name*="user" i], input[name*="login" i], input[id*="user" i], input[id*="login" i]');
    const hasLoginForm = passwordField && usernameField;
    
    if (!hasLoginForm) {
      console.log('WiFi Auto Login: No login form found');
      return false;
    }
    
    if (strictMode === 'strict') {
      // Skip HTTPS sites (most portals are HTTP)
      if (url.startsWith('https://') && !url.includes('192.168.') && !url.includes('10.0.') && !url.includes('172.16.')) {
        console.log('WiFi Auto Login: Skipping HTTPS site (likely not a portal)');
        return false;
      }
      
      // Strict portal URL patterns - must match at least one
      const strictPortalPatterns = [
        // Private IP ranges (most common for portals)
        /^https?:\/\/(192\.168\.|10\.0?\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/,
        // Common portal domains
        /connectify\.me|neverssl\.com|captive\.apple\.com/,
        // Portal-specific paths
        /\/(captive|portal|auth|login|gateway|wifi|hotspot)/,
        // Query parameters indicating portal
        /[?&](redirect|continue|url|dest|destination)=/
      ];
      
      const hasStrictPortalURL = strictPortalPatterns.some(pattern => pattern.test(url));
      
      // Portal-specific content indicators (much stricter)
      const strictPortalContent = [
        // Must contain specific portal phrases
        /internet access|wifi access|captive portal|guest access|wifi login|connect to wifi|accept terms|agree to terms|wifi portal|hotspot login/,
        // Or connection-related terms with login
        /(connect|access).*(internet|wifi|network).*(login|signin|auth)/,
        /(wifi|internet).*(login|signin|connect)/
      ];
      
      const hasStrictPortalContent = strictPortalContent.some(pattern => 
        pattern.test(pageText) || pattern.test(pageTitle)
      );
      
      // Additional checks for portal pages
      const hasPortalTitle = /wifi|portal|captive|gateway|hotspot|internet access/i.test(pageTitle);
      
      // Look for portal-specific form actions or method
      const forms = document.querySelectorAll('form');
      const hasPortalForm = Array.from(forms).some(form => {
        const action = (form.action || '').toLowerCase();
        const method = (form.method || '').toLowerCase();
        return action.includes('auth') || action.includes('login') || 
               action.includes('portal') || action.includes('captive') ||
               (method === 'post' && hasLoginForm);
      });
      
      // Very strict requirements: Must have BOTH portal URL pattern AND login form AND portal content
      const isPortal = hasStrictPortalURL && hasLoginForm && (hasStrictPortalContent || hasPortalTitle || hasPortalForm);
      
      console.log('Portal detection (strict):', {
        url: url.substring(0, 100),
        hostname: hostname,
        hasStrictPortalURL,
        hasLoginForm,
        hasStrictPortalContent,
        hasPortalTitle,
        hasPortalForm,
        isPortal
      });
      
      return isPortal;
      
    } else if (strictMode === 'moderate') {
      // Moderate detection - include more potential portals
      const moderatePortalIndicators = PORTAL_INDICATORS.some(indicator => 
        pageText.includes(indicator) || 
        pageTitle.includes(indicator) || 
        url.includes(indicator)
      );
      
      const hasPortalURL = url.includes('192.168.') || 
                          url.includes('10.0.') || 
                          url.includes('172.16.') ||
                          url.includes('captive') ||
                          url.includes('portal') ||
                          url.includes('auth') ||
                          url.includes('gateway') ||
                          url.includes('wifi') ||
                          url.includes('hotspot');
      
      return hasLoginForm && (hasPortalURL || moderatePortalIndicators);
      
    } else { // permissive
      // Permissive - any page with login form
      return hasLoginForm;
    }
  }

  function findElement(selectors) {
    for (let selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) { // Check if element is visible
        return element;
      }
    }
    return null;
  }

  function findUsernameField() {
    // Try specific selectors first
    const specificSelectors = [
      'input[name*="user" i]',
      'input[name*="login" i]',
      'input[name*="email" i]',
      'input[name*="username" i]',
      'input[id*="user" i]',
      'input[id*="login" i]',
      'input[id*="email" i]',
      'input[id*="username" i]'
    ];

    for (let selector of specificSelectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        console.log('Found username field with selector:', selector);
        return element;
      }
    }

    // If not found, try to find the first visible text input that's not a password field
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])');
    for (let input of textInputs) {
      if (input.offsetParent !== null && 
          !input.name.toLowerCase().includes('pass') && 
          !input.id.toLowerCase().includes('pass')) {
        console.log('Found username field as first text input:', input);
        return input;
      }
    }

    return null;
  }

  async function getStoredCredentials() {
    return new Promise((resolve) => {
      // Fix: Use consistent storage keys
      chrome.storage.sync.get(['username', 'password', 'enabled'], (result) => {
        resolve(result);
      });
    });
  }

  // Function to fill form fields
  function fillField(element, value) {
    if (element) {
      element.focus();
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Visual notification system
  function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.getElementById('wifi-auto-login-notification');
    if (existing) {
      existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'wifi-auto-login-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Set colors based on type
    const colors = {
      success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.border = `1px solid ${color.border}`;
    notification.style.color = color.text;
    
    notification.textContent = message;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('wifi-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'wifi-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  }

  // Search engine detection patterns and their redirect URLs
  const SEARCH_ENGINE_PATTERNS = {
    'google': {
      patterns: ['google.com', 'google.co', 'google.ca', 'google.co.uk', 'google.de', 'google.fr', 'google.it', 'google.es', 'google.com.au', 'google.co.in', 'google.com.br', 'google.co.jp'],
      url: 'https://www.google.com'
    },
    'bing': {
      patterns: ['bing.com', 'msn.com', 'microsoft.com', 'outlook.com', 'hotmail.com', 'live.com'],
      url: 'https://www.bing.com'
    },
    'yahoo': {
      patterns: ['yahoo.com', 'yahoo.co', 'yahoo.ca', 'yahoo.co.uk', 'yahoo.de', 'yahoo.fr', 'yahoo.it', 'yahoo.es', 'yahoo.com.au', 'yahoo.co.in', 'yahoo.com.br', 'yahoo.co.jp'],
      url: 'https://search.yahoo.com'
    },
    'duckduckgo': {
      patterns: ['duckduckgo.com', 'ddg.co'],
      url: 'https://duckduckgo.com'
    },
    'yandex': {
      patterns: ['yandex.com', 'yandex.ru', 'yandex.co'],
      url: 'https://yandex.com'
    },
    'baidu': {
      patterns: ['baidu.com', 'baidu.cn'],
      url: 'https://www.baidu.com'
    },
    'brave': {
      patterns: ['search.brave.com', 'brave.com'],
      url: 'https://search.brave.com'
    },
    'startpage': {
      patterns: ['startpage.com'],
      url: 'https://www.startpage.com'
    },
    'ecosia': {
      patterns: ['ecosia.org'],
      url: 'https://www.ecosia.org'
    }
  };

  // Function to detect intended search engine from browser history/referrer
  function detectIntendedSearchEngine() {
    return new Promise((resolve) => {
      // Check document referrer first
      let referrer = document.referrer.toLowerCase();
      if (referrer) {
        for (let engine in SEARCH_ENGINE_PATTERNS) {
          if (SEARCH_ENGINE_PATTERNS[engine].patterns.some(pattern => referrer.includes(pattern))) {
            console.log('WiFi Auto Login: Detected intended search engine from referrer:', engine);
            resolve(SEARCH_ENGINE_PATTERNS[engine].url);
            return;
          }
        }
      }

      // Check current URL for search engine patterns (in case user was redirected from a search engine)
      let currentUrl = window.location.href.toLowerCase();
      for (let engine in SEARCH_ENGINE_PATTERNS) {
        if (SEARCH_ENGINE_PATTERNS[engine].patterns.some(pattern => currentUrl.includes(pattern))) {
          console.log('WiFi Auto Login: Detected intended search engine from current URL:', engine);
          resolve(SEARCH_ENGINE_PATTERNS[engine].url);
          return;
        }
      }

      // Check for common search engine attempts in the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect') || urlParams.get('url') || urlParams.get('continue') || '';
      if (redirectParam) {
        for (let engine in SEARCH_ENGINE_PATTERNS) {
          if (SEARCH_ENGINE_PATTERNS[engine].patterns.some(pattern => redirectParam.toLowerCase().includes(pattern))) {
            console.log('WiFi Auto Login: Detected intended search engine from redirect param:', engine);
            resolve(SEARCH_ENGINE_PATTERNS[engine].url);
            return;
          }
        }
      }

      // Ask background script for last intended URL
      chrome.runtime.sendMessage({action: 'getLastIntendedUrl'}, function(response) {
        if (response && response.url) {
          const lastUrl = response.url.toLowerCase();
          for (let engine in SEARCH_ENGINE_PATTERNS) {
            if (SEARCH_ENGINE_PATTERNS[engine].patterns.some(pattern => lastUrl.includes(pattern))) {
              console.log('WiFi Auto Login: Detected intended search engine from background script:', engine);
              resolve(SEARCH_ENGINE_PATTERNS[engine].url);
              return;
            }
          }
        }
        resolve(null);
      });
    });
  }

  // Enhanced function to check if login was successful
  async function isLoginSuccessful() {
    const successIndicators = [
      'success',
      'welcome',
      'connected',
      'internet access',
      'online',
      'authenticated',
      'access granted',
      'connection successful',
      'you are now connected',
      'login successful',
      'authentication complete'
    ];
    
    const pageText = document.body.innerText.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    
    // Check text-based indicators
    const hasSuccessText = successIndicators.some(indicator => 
      pageText.includes(indicator) || pageTitle.includes(indicator)
    );
    
    if (hasSuccessText) {
      return true;
    }
    
    // Try to test actual internet connectivity
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log('WiFi Auto Login: Internet connectivity test passed');
      return true;
    } catch (error) {
      console.log('WiFi Auto Login: Internet connectivity test failed:', error);
      return false;
    }
  }

  // Enhanced function to redirect intelligently
  async function smartRedirect() {
    // First try to detect the intended search engine automatically
    const detectedUrl = await detectIntendedSearchEngine();
    
    if (detectedUrl) {
      console.log('WiFi Auto Login: Smart redirect detected, redirecting to:', detectedUrl);
      setTimeout(() => {
        window.location.href = detectedUrl;
      }, 2000);
      return;
    }

    // Fallback to user's manual preference if no automatic detection
    chrome.storage.sync.get(['searchEngine', 'enableRedirect'], function(result) {
      if (result.enableRedirect !== false) { // Default to enabled if not set
        if (result.searchEngine) {
          // Legacy support for old configuration
          const legacyUrls = {
            'google': 'https://www.google.com',
            'edge': 'https://www.msn.com',
            'duckduckgo': 'https://duckduckgo.com',
            'yahoo': 'https://search.yahoo.com',
            'brave': 'https://search.brave.com'
          };
          
          const searchUrl = legacyUrls[result.searchEngine];
          if (searchUrl) {
            console.log('WiFi Auto Login: Using manual preference, redirecting to:', result.searchEngine);
            setTimeout(() => {
              window.location.href = searchUrl;
            }, 2000);
            return;
          }
        }
        
        // If no preference set and no detection, default to Google
        console.log('WiFi Auto Login: No preference set and no detection, defaulting to Google');
        setTimeout(() => {
          window.location.href = 'https://www.google.com';
        }, 2000);
      } else {
        console.log('WiFi Auto Login: Redirect disabled by user');
      }
    });
  }

  // Enhanced autoLogin function with redirect
  function autoLoginWithRedirect() {
    // Early exit for known non-portal sites
    const hostname = window.location.hostname.toLowerCase();
    const knownSites = [
      'google.com', 'facebook.com', 'youtube.com', 'amazon.com', 
      'microsoft.com', 'github.com', 'stackoverflow.com', 'reddit.com',
      'twitter.com', 'linkedin.com', 'instagram.com', 'netflix.com',
      'apple.com', 'adobe.com', 'dropbox.com', 'spotify.com',
      'paypal.com', 'ebay.com', 'wikipedia.org', 'mozilla.org',
      'office.com', 'outlook.com', 'live.com', 'skype.com',
      'discord.com', 'slack.com', 'zoom.us', 'teams.microsoft.com',
      'banking', 'bank.', '.edu', '.gov'
    ];
    
    if (knownSites.some(site => hostname.includes(site))) {
      console.log('WiFi Auto Login: Skipping known non-portal site:', hostname);
      return;
    }
    
    // Skip if page has CSRF tokens (indicates it's a real application, not a portal)
    if (document.querySelector('input[name*="csrf"], input[name*="token"], input[name="_token"]')) {
      console.log('WiFi Auto Login: Skipping page with CSRF tokens (likely real app)');
      return;
    }
    
    // Skip if page has complex authentication (2FA, OAuth, etc.)
    if (document.querySelector('[data-testid*="oauth"], [class*="oauth"], [id*="oauth"], [class*="2fa"], [id*="2fa"]')) {
      console.log('WiFi Auto Login: Skipping page with OAuth/2FA (likely real app)');
      return;
    }
    
    console.log('WiFi Auto Login: Checking if this is a portal page...');
    
    // Check if extension is paused
    chrome.storage.sync.get(['pausedUntil'], function(pauseResult) {
      if (pauseResult.pausedUntil && Date.now() < pauseResult.pausedUntil) {
        console.log('WiFi Auto Login: Extension is paused');
        return;
      }
      
      // Get all settings including profiles
      chrome.storage.sync.get(['profiles', 'currentProfile', 'enabled', 'strictMode', 'blacklist'], function(result) {
        console.log('Storage result:', result);
        
        if (!result.enabled) {
          console.log('WiFi Auto Login: Auto-login is disabled');
          return;
        }
        
        // Get the appropriate profile
        const profiles = result.profiles || {};
        let currentProfile = result.currentProfile || 'default';
        
        // Try to detect network and use appropriate profile
        const detectedNetwork = detectNetworkName();
        if (detectedNetwork) {
          // Look for a profile that matches this network
          const matchingProfile = Object.keys(profiles).find(profileName => {
            const profile = profiles[profileName];
            return profile.networkName && detectedNetwork.toLowerCase().includes(profile.networkName.toLowerCase());
          });
          
          if (matchingProfile) {
            currentProfile = matchingProfile;
            console.log('WiFi Auto Login: Using profile for network:', matchingProfile);
          }
        }
        
        const profile = profiles[currentProfile];
        if (!profile || !profile.username || !profile.password) {
          console.log('WiFi Auto Login: Missing credentials in profile:', currentProfile);
          return;
        }

        // Check blacklist
        if (result.blacklist) {
          const blacklistedDomains = result.blacklist.split(',').map(d => d.trim().toLowerCase());
          const currentDomain = window.location.hostname.toLowerCase();
          
          if (blacklistedDomains.some(domain => currentDomain.includes(domain))) {
            console.log('WiFi Auto Login: Current domain is blacklisted:', currentDomain);
            return;
          }
        }

        // Check if this is a portal page based on strictness mode
        const strictMode = result.strictMode || 'strict';
        if (!isPortalPage(strictMode)) {
          console.log('WiFi Auto Login: Not a portal page (strict mode:', strictMode + ')');
          return;
        }

        console.log('WiFi Auto Login: Portal page detected, starting auto-login...');
        showNotification('🔐 Auto-login detected, filling credentials...', 'info');
        
        // Perform login
        const usernameField = findUsernameField();
        const passwordField = findElement(PASSWORD_SELECTORS);
        const submitButton = findElement(SUBMIT_SELECTORS);
        
        console.log('Form elements found:', {
          username: !!usernameField,
          password: !!passwordField,
          submit: !!submitButton
        });
        
        if (usernameField && passwordField) {
          console.log('Filling form fields...');
          
          // Track login attempt
          chrome.storage.local.get(['loginAttempts'], function(stats) {
            const attempts = (stats.loginAttempts || 0) + 1;
            chrome.storage.local.set({ loginAttempts: attempts });
          });
          
          // Fill credentials
          fillField(usernameField, profile.username);
          setTimeout(() => {
            fillField(passwordField, profile.password);
            console.log('Credentials filled');
            
            // Submit form with enhanced portal support
            setTimeout(() => {
              // Enhanced submit logic for complex portals
              if (submitButton) {
                console.log('Clicking submit button:', submitButton);
                
                // Special handling for Palo Alto Networks portals
                if (window.location.href.includes('uid.php') || 
                    window.location.href.includes('paloalto') ||
                    document.querySelector('input[name="prot"]') ||
                    document.querySelector('input[name="magic"]')) {
                  console.log('WiFi Auto Login: Detected Palo Alto Networks portal');
                  
                  // Try multiple submission methods for Palo Alto
                  // Method 1: Direct button click with events
                  submitButton.focus();
                  submitButton.dispatchEvent(new Event('focus', { bubbles: true }));
                  setTimeout(() => {
                    submitButton.click();
                    submitButton.dispatchEvent(new Event('click', { bubbles: true }));
                  }, 200);
                  
                  // Method 2: Trigger form validation if exists
                  const form = submitButton.closest('form');
                  if (form && form.onsubmit) {
                    setTimeout(() => {
                      if (typeof form.onsubmit === 'function') {
                        form.onsubmit();
                      }
                    }, 500);
                  }
                  
                  // Method 3: Look for custom JavaScript functions
                  setTimeout(() => {
                    // Check for common Palo Alto submit functions
                    if (typeof window.submitForm === 'function') {
                      window.submitForm();
                    } else if (typeof window.doLogin === 'function') {
                      window.doLogin();
                    } else if (typeof window.loginSubmit === 'function') {
                      window.loginSubmit();
                    }
                  }, 1000);
                  
                } else {
                  // Standard portal submission
                  submitButton.click();
                }
                
                console.log('WiFi Auto Login: Form submitted');
                
                // Check for successful login after submit
                setTimeout(async () => {
                  if (await isLoginSuccessful()) {
                    console.log('WiFi Auto Login: Login successful, checking for smart redirect...');
                    showNotification('✅ WiFi Login Successful!', 'success');
                    
                    // Track successful login
                    chrome.storage.local.get(['successfulLogins'], function(stats) {
                      const successful = (stats.successfulLogins || 0) + 1;
                      chrome.storage.local.set({ 
                        successfulLogins: successful,
                        lastLoginDate: Date.now()
                      });
                    });
                    
                    smartRedirect();
                  } else {
                    console.log('WiFi Auto Login: Login may have failed or page still loading');
                    showNotification('⏳ Checking login status...', 'info');
                  }
                }, 3000);
              } else {
                console.log('WiFi Auto Login: No submit button found, trying alternative methods');
                
                // Try to submit the form directly
                const form = usernameField.closest('form');
                if (form) {
                  console.log('WiFi Auto Login: Attempting direct form submission');
                  
                  // Method 1: Standard form submit
                  try {
                    form.submit();
                    console.log('WiFi Auto Login: Form submitted directly');
                  } catch (e) {
                    console.log('WiFi Auto Login: Direct submit failed:', e);
                  }
                  
                  // Method 2: Trigger form submit event
                  setTimeout(() => {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }, 500);
                  
                  // Method 3: Look for hidden submit buttons or alternative selectors
                  setTimeout(() => {
                    const alternativeSubmits = [
                      'input[type="image"]',
                      'button[onclick*="submit"]',
                      'a[onclick*="submit"]',
                      'div[onclick*="submit"]',
                      'span[onclick*="submit"]',
                      '[role="button"]',
                      '.login-button',
                      '.submit-button',
                      '#login-btn',
                      '#submit-btn'
                    ];
                    
                    for (let selector of alternativeSubmits) {
                      const altButton = document.querySelector(selector);
                      if (altButton && altButton.offsetParent !== null) {
                        console.log('WiFi Auto Login: Found alternative submit element:', selector);
                        altButton.click();
                        break;
                      }
                    }
                  }, 1000);
                  
                  // Method 4: Simulate Enter key press on password field
                  setTimeout(() => {
                    const enterEvent = new KeyboardEvent('keypress', {
                      key: 'Enter',
                      keyCode: 13,
                      which: 13,
                      bubbles: true
                    });
                    passwordField.dispatchEvent(enterEvent);
                  }, 1500);
                }
              }
            }, 1000);
          }, 500);
        } else {
          console.log('WiFi Auto Login: Required form fields not found');
          console.log('Available input fields:', document.querySelectorAll('input'));
          console.log('Available buttons:', document.querySelectorAll('button, input[type="submit"]'));
        }
      });
    });
  }

  // Manual debug function - you can call this from console
  window.debugWifiLogin = function() {
    console.log('=== WiFi Login Debug ===');
    console.log('All input fields:', document.querySelectorAll('input'));
    console.log('Text inputs:', document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])'));
    console.log('Password inputs:', document.querySelectorAll('input[type="password"]'));
    console.log('All buttons:', document.querySelectorAll('button, input[type="submit"]'));
    
    const usernameField = findUsernameField();
    const passwordField = findElement(PASSWORD_SELECTORS);
    const submitButton = findElement(SUBMIT_SELECTORS);
    
    console.log('Detected fields:', {
      username: usernameField,
      password: passwordField,
      submit: submitButton
    });
    
    if (usernameField) {
      console.log('Username field details:', {
        name: usernameField.name,
        id: usernameField.id,
        type: usernameField.type,
        placeholder: usernameField.placeholder,
        value: usernameField.value
      });
    }
    
    if (passwordField) {
      console.log('Password field details:', {
        name: passwordField.name,
        id: passwordField.id,
        type: passwordField.type,
        placeholder: passwordField.placeholder
      });
    }
    
    // Additional debug for Palo Alto portals
    console.log('=== Palo Alto Portal Debug ===');
    console.log('Hidden fields:', document.querySelectorAll('input[type="hidden"]'));
    console.log('Form onsubmit:', document.querySelector('form')?.onsubmit);
    console.log('Global functions:', {
      submitForm: typeof window.submitForm,
      doLogin: typeof window.doLogin,
      loginSubmit: typeof window.loginSubmit
    });
    console.log('Portal indicators:', {
      isPaloAlto: window.location.href.includes('uid.php'),
      hasTokens: !!document.querySelector('input[name="prot"], input[name="magic"]'),
      hasJavaScript: !!document.querySelector('script')
    });
  };

  // Special debug function for Palo Alto portals
  window.debugPaloAlto = function() {
    console.log('=== Palo Alto Portal Specific Debug ===');
    const form = document.querySelector('form');
    if (form) {
      console.log('Form action:', form.action);
      console.log('Form method:', form.method);
      console.log('Form elements:', form.elements);
      
      // Try to find Palo Alto specific fields
      const paloAltoFields = {
        prot: document.querySelector('input[name="prot"]'),
        magic: document.querySelector('input[name="magic"]'),
        token: document.querySelector('input[name="token"]'),
        vsys: document.querySelector('input[name="vsys"]'),
        rule: document.querySelector('input[name="rule"]')
      };
      
      console.log('Palo Alto fields:', paloAltoFields);
      
      // Check for JavaScript validation
      const scripts = document.querySelectorAll('script');
      console.log('Number of scripts:', scripts.length);
      
      // Try manual submission
      console.log('Attempting manual form submission...');
      if (typeof window.submitForm === 'function') {
        console.log('Found submitForm function, calling...');
        window.submitForm();
      } else {
        console.log('No submitForm function, trying direct submit...');
        form.submit();
      }
    }
  };

  // Check if this is a portal page and attempt auto-login
  function init() {
    if (isPortalPage()) {
      console.log('Portal page detected');
      chrome.runtime.sendMessage({
        action: 'portalDetected',
        url: window.location.href
      });
      
      // Wait a bit for the page to fully load
      setTimeout(autoLoginWithRedirect, 1000);
    }
  }

  // Run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoLoginWithRedirect);
  } else {
    autoLoginWithRedirect();
  }

  // Also listen for navigation changes (for single-page apps)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(autoLoginWithRedirect, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

})();
