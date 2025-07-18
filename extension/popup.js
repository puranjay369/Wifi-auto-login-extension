// Popup script for WiFi Auto Login Extension
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('settingsForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const autoLoginCheckbox = document.getElementById('autoLogin');
  const searchEngineSelect = document.getElementById('searchEngine');
  const enableRedirectCheckbox = document.getElementById('enableRedirect');
  const strictModeSelect = document.getElementById('strictMode');
  const blacklistTextarea = document.getElementById('blacklist');
  const networkNameInput = document.getElementById('networkName');
  const masterPasswordInput = document.getElementById('masterPassword');
  const profileSelect = document.getElementById('profileSelect');
  const addProfileBtn = document.getElementById('addProfileBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const clearStatsBtn = document.getElementById('clearStatsBtn');
  const testBtn = document.getElementById('testBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['profiles', 'currentProfile', 'enabled', 'searchEngine', 'enableRedirect', 'strictMode', 'blacklist', 'masterPassword'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      showStatus('Error loading settings', 'error');
      return;
    }
    
    // Load profiles
    const profiles = result.profiles || { default: { username: '', password: '', networkName: '' } };
    const currentProfile = result.currentProfile || 'default';
    
    // Populate profile selector
    profileSelect.innerHTML = '';
    Object.keys(profiles).forEach(profileName => {
      const option = document.createElement('option');
      option.value = profileName;
      option.textContent = profileName === 'default' ? 'Default Profile' : profileName;
      profileSelect.appendChild(option);
    });
    
    profileSelect.value = currentProfile;
    
    // Load current profile data
    const profile = profiles[currentProfile];
    if (profile) {
      usernameInput.value = profile.username || '';
      passwordInput.value = profile.password || '';
      networkNameInput.value = profile.networkName || '';
    }
    
    autoLoginCheckbox.checked = result.enabled !== false;
    
    if (result.searchEngine) {
      searchEngineSelect.value = result.searchEngine;
    }
    enableRedirectCheckbox.checked = result.enableRedirect !== false;
    
    if (result.strictMode) {
      strictModeSelect.value = result.strictMode;
    } else {
      strictModeSelect.value = 'strict';
    }
    
    if (result.blacklist) {
      blacklistTextarea.value = result.blacklist;
    }
    
    if (result.masterPassword) {
      masterPasswordInput.placeholder = 'Master password is set';
    }
    
    // Load and display statistics
    loadStatistics();
    loadRecentLogins();
  });

  // Load usage statistics
  function loadStatistics() {
    chrome.storage.local.get(['loginAttempts', 'successfulLogins', 'lastLoginDate', 'networksUsed'], function(stats) {
      const attempts = stats.loginAttempts || 0;
      const successful = stats.successfulLogins || 0;
      const lastLogin = stats.lastLoginDate ? new Date(stats.lastLoginDate).toLocaleDateString() : 'Never';
      const successRate = attempts > 0 ? Math.round((successful / attempts) * 100) : 0;
      const networks = stats.networksUsed || 0;
      
      document.getElementById('statsContent').innerHTML = `
        Total Attempts: ${attempts} | Successful: ${successful} | Success Rate: ${successRate}%<br>
        Networks Used: ${networks} | Last Login: ${lastLogin}
      `;
    });
  }

  // Load recent login activity
  function loadRecentLogins() {
    chrome.storage.local.get(['recentLogins'], function(data) {
      const recent = data.recentLogins || [];
      if (recent.length === 0) {
        document.getElementById('recentLoginsContent').innerHTML = 'No recent activity';
        return;
      }
      
      const recentHtml = recent.slice(0, 5).map(login => {
        const date = new Date(login.timestamp).toLocaleString();
        const status = login.success ? '✅' : '❌';
        return `${status} ${login.network || 'Unknown'} - ${date}`;
      }).join('<br>');
      
      document.getElementById('recentLoginsContent').innerHTML = recentHtml;
    });
  }

  // Save settings
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const networkName = networkNameInput.value.trim();
    const autoLoginEnabled = autoLoginCheckbox.checked;
    const searchEngine = searchEngineSelect.value;
    const enableRedirect = enableRedirectCheckbox.checked;
    const strictMode = strictModeSelect.value;
    const blacklist = blacklistTextarea.value.trim();
    const masterPassword = masterPasswordInput.value.trim();
    const currentProfile = profileSelect.value;

    if (!username || !password) {
      showStatus('Please enter both username and password', 'error');
      return;
    }

    // Get existing profiles
    chrome.storage.sync.get(['profiles'], function(result) {
      const profiles = result.profiles || {};
      
      // Update current profile
      profiles[currentProfile] = {
        username: username,
        password: password,
        networkName: networkName
      };

      chrome.storage.sync.set({
        profiles: profiles,
        currentProfile: currentProfile,
        enabled: autoLoginEnabled,
        searchEngine: searchEngine,
        enableRedirect: enableRedirect,
        strictMode: strictMode,
        blacklist: blacklist,
        masterPassword: masterPassword
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error saving settings:', chrome.runtime.lastError);
          showStatus('Error saving settings', 'error');
          return;
        }
        
        showStatus('Settings saved successfully!', 'success');
        setTimeout(() => {
          window.close();
        }, 1500);
      });
    });
  });

  // Test button
  testBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        showStatus('Error accessing current tab', 'error');
        return;
      }
      
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: testAutoLogin
      }, function(result) {
        if (chrome.runtime.lastError) {
          console.error('Error executing script:', chrome.runtime.lastError);
          showStatus('Error testing on current page', 'error');
          return;
        }
        
        showStatus('Testing auto-login on current page...', 'success');
        setTimeout(() => {
          window.close();
        }, 1000);
      });
    });
  });

  // Pause button
  pauseBtn.addEventListener('click', function() {
    const pauseUntil = Date.now() + (60 * 60 * 1000); // 1 hour from now
    chrome.storage.sync.set({
      pausedUntil: pauseUntil
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error setting pause:', chrome.runtime.lastError);
        showStatus('Error pausing extension', 'error');
        return;
      }
      
      showStatus('Extension paused for 1 hour', 'success');
      setTimeout(() => {
        window.close();
      }, 1500);
    });
  });

  // Profile management
  profileSelect.addEventListener('change', function() {
    const selectedProfile = profileSelect.value;
    chrome.storage.sync.get(['profiles'], function(result) {
      const profiles = result.profiles || {};
      const profile = profiles[selectedProfile];
      if (profile) {
        usernameInput.value = profile.username || '';
        passwordInput.value = profile.password || '';
        networkNameInput.value = profile.networkName || '';
      }
    });
  });

  addProfileBtn.addEventListener('click', function() {
    const profileName = prompt('Enter a name for the new profile:');
    if (profileName && profileName.trim()) {
      const name = profileName.trim();
      chrome.storage.sync.get(['profiles'], function(result) {
        const profiles = result.profiles || {};
        profiles[name] = { username: '', password: '', networkName: '' };
        
        chrome.storage.sync.set({ profiles: profiles }, function() {
          // Refresh profile selector
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          profileSelect.appendChild(option);
          profileSelect.value = name;
          
          // Clear form for new profile
          usernameInput.value = '';
          passwordInput.value = '';
          networkNameInput.value = '';
          
          showStatus('New profile created', 'success');
        });
      });
    }
  });

  // Export settings
  exportBtn.addEventListener('click', function() {
    chrome.storage.sync.get(null, function(data) {
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-autologin-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showStatus('Settings exported successfully', 'success');
    });
  });

  // Import settings
  importBtn.addEventListener('click', function() {
    importFile.click();
  });

  importFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importData = JSON.parse(e.target.result);
          
          chrome.storage.sync.set(importData, function() {
            if (chrome.runtime.lastError) {
              showStatus('Error importing settings', 'error');
            } else {
              showStatus('Settings imported successfully! Please reload.', 'success');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          });
        } catch (error) {
          showStatus('Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  });

  // Clear statistics
  clearStatsBtn.addEventListener('click', function() {
    if (confirm('Clear all usage statistics?')) {
      chrome.storage.local.clear(function() {
        showStatus('Statistics cleared', 'success');
        loadStatistics();
        loadRecentLogins();
      });
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});

// Function to inject for testing
function testAutoLogin() {
  // This function will be injected into the current page for testing
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

  function findElement(selectors) {
    for (let selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) {
        return element;
      }
    }
    return null;
  }

  // Get stored credentials
  chrome.storage.sync.get(['username', 'password', 'enabled'], function(result) {
    if (!result.enabled || !result.username || !result.password) {
      console.log('Auto-login disabled or credentials not set');
      return;
    }

    const usernameField = findElement(USERNAME_SELECTORS);
    const passwordField = findElement(PASSWORD_SELECTORS);
    const submitButton = findElement(SUBMIT_SELECTORS);

    if (usernameField && passwordField) {
      usernameField.value = result.username;
      passwordField.value = result.password;
      
      // Trigger input events to ensure form validation
      usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      
      console.log('Credentials filled automatically');
      
      if (submitButton) {
        setTimeout(() => {
          submitButton.click();
          console.log('Login form submitted automatically');
        }, 500);
      }
    } else {
      console.log('Login form not found on this page');
    }
  });
}
