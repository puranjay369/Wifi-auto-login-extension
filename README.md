# � WiFi Auto Login Extension - Perfect Edition

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0-orange.svg)](extension/manifest.json)

A powerful Chrome extension that automatically logs you into WiFi captive portals with advanced features like multiple profiles, network detection, and smart redirects.

![WiFi Auto Login Demo](https://img.shields.io/badge/Status-Perfect%20Edition-brightgreen)

## ✨ Key Features

🔐 **Multiple Credential Profiles** - Create separate profiles for different WiFi networks  
🔒 **Master Password Security** - Optional encryption for stored credentials  
📊 **Analytics & Statistics** - Track login attempts and success rates  
💾 **Backup & Restore** - Export/import settings and profiles  
🎯 **Smart Automation** - Intelligent search engine detection and redirects  
🛡️ **Enhanced Security** - Strict portal detection, blacklisting, CSRF protection  
🎛️ **Modern Interface** - Clean, intuitive popup with profile management  

## 🚀 Quick Start

### Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `extension` folder
5. Click the extension icon to configure your credentials
6. Enjoy automatic WiFi portal login!

### Basic Usage
1. **Create Profile**: Add your WiFi credentials in the extension popup
2. **Set Network Name**: Optionally add network names for auto-profile switching
3. **Enable Auto-Login**: Toggle the extension on/off as needed
4. **Visit Portal**: The extension will automatically detect and login

## 📁 Project Structure

```
wifi-auto-login-extension/
├── README.md                    # This file
├── LICENSE                      # MIT License
├── FEATURES.md                  # Detailed feature documentation
├── extension/                   # 📦 Chrome Extension Files
│   ├── manifest.json           # Extension configuration
│   ├── background.js           # Service worker for navigation tracking
│   ├── content.js              # Main auto-login logic and portal detection
│   ├── popup.html              # User interface
│   ├── popup.js                # Popup functionality and profile management
│   └── icons/                  # Extension icons (16px, 48px, 128px)
└── tests/                      # 🧪 Testing Files
    ├── test_portal.html        # Basic portal simulation
    └── test_suite.html         # Advanced testing scenarios
```

## 🔧 Advanced Features

### Multiple Profiles
Create different profiles for various networks:
- **Home WiFi**: Personal credentials
- **Work Network**: Office credentials  
- **Hotel/Cafe**: Guest access credentials
- **Auto-Detection**: Automatically switches based on network name

### Security Features
- **Strict Portal Detection**: Avoids false positives on banking/sensitive sites
- **Domain Blacklisting**: Automatically skips specified domains
- **CSRF Protection**: Detects and avoids pages with security tokens
- **Private IP Validation**: Focuses on actual WiFi portals (192.168.x.x, etc.)

### Smart Automation
- **Search Engine Detection**: Auto-redirects to intended search engine after login
- **Navigation Tracking**: Remembers user intent for accurate redirection
- **Visual Notifications**: Clear feedback on login status and actions
- **Success Verification**: Tests actual internet connectivity

## 🧪 Testing

Test the extension using the included test pages:
- Open `tests/test_portal.html` for basic portal simulation
- Use `tests/test_suite.html` for comprehensive testing scenarios
- Check browser console for detailed debug information
- Use `debugWifiLogin()` function in console for troubleshooting

## 🛡️ Security & Privacy

- **No Data Collection**: All data stays on your device
- **Local Storage Only**: Uses Chrome's sync storage for convenience
- **HTTPS Support**: Works with secure portals
- **Smart Filtering**: Automatically skips banking and sensitive sites
- **Open Source**: Full transparency - inspect the code yourself

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Clone the repository
2. Make your changes in the `extension/` folder
3. Test with the files in `tests/` folder
4. Submit a pull request

## 📝 Changelog

### Version 2.0 - Perfect Edition (Latest)
- ✅ Multiple credential profiles with network auto-detection
- ✅ Master password security field
- ✅ Enhanced statistics and analytics
- ✅ Export/Import backup system
- ✅ Advanced user interface
- ✅ Smart security features
- ✅ Intelligent automation and redirects

### Version 1.0 - Initial Release
- Basic auto-login functionality
- Simple credential storage
- Portal detection
- Search engine redirect

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and community
- WiFi portal testing and feedback from users
- Open source community for inspiration and best practices

---

**Made with ❤️ for seamless WiFi connectivity everywhere!**

## 🔗 Links

- [Detailed Features](FEATURES.md)
- [Chrome Web Store](https://chrome.google.com/webstore) (Coming Soon)
- [Issues & Feature Requests](../../issues)

---

**🎯 Perfect WiFi Auto Login Extension - Never manually connect to WiFi portals again!** 🚀

## 🚀 Quick Start

### For Microsoft Edge:
1. Download or clone this repository
2. Open Edge and go to `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the downloaded folder
5. Configure your WiFi credentials in the extension popup
6. Enjoy automatic WiFi portal login!

### For Google Chrome:
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the downloaded folder
5. Configure your WiFi credentials in the extension popup
6. Enjoy automatic WiFi portal login!

### For Mozilla Firefox:
1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the downloaded folder
6. Configure your WiFi credentials in the extension popup
7. Enjoy automatic WiFi portal login! (Note: Extension will be temporary until Firefox restart)

### For Chromium-based browsers (Brave, Opera, Vivaldi):
1. Download or clone this repository
2. Open your browser's extensions page:
   - **Brave**: `brave://extensions/`
   - **Opera**: `opera://extensions/`
   - **Vivaldi**: `vivaldi://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the downloaded folder
5. Configure your WiFi credentials in the extension popup
6. Enjoy automatic WiFi portal login!

## 📦 Installation

### Method 1: Developer Mode (Recommended)

#### Microsoft Edge
1. **Download the Extension**:
   - Download or clone this repository to your computer
   - Extract the files if downloaded as a zip

2. **Enable Developer Mode**:
   - Open Microsoft Edge
   - Go to `edge://extensions/`
   - Turn on "Developer mode" in the left sidebar

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Select the `wifiAutoLogin` folder containing the extension files

#### Google Chrome
1. **Download the Extension**:
   - Download or clone this repository to your computer
   - Extract the files if downloaded as a zip

2. **Enable Developer Mode**:
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Turn on "Developer mode" toggle (top right)

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Select the `wifiAutoLogin` folder containing the extension files

#### Mozilla Firefox
1. **Download the Extension**:
   - Download or clone this repository to your computer
   - Extract the files if downloaded as a zip

2. **Load Temporary Add-on**:
   - Open Firefox
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the folder

**Note**: Firefox loads extensions as temporary, so you'll need to reload after each browser restart.

#### Other Chromium Browsers (Brave, Opera, Vivaldi)
1. **Download the Extension**:
   - Download or clone this repository to your computer
   - Extract the files if downloaded as a zip

2. **Access Extensions Page**:
   - **Brave**: Go to `brave://extensions/`
   - **Opera**: Go to `opera://extensions/`
   - **Vivaldi**: Go to `vivaldi://extensions/`

3. **Enable Developer Mode**:
   - Turn on "Developer mode"

4. **Load the Extension**:
   - Click "Load unpacked" button
   - Select the `wifiAutoLogin` folder containing the extension files

## 🌐 Browser Compatibility

| Browser | Support | Installation Method | Notes |
|---------|---------|-------------------|-------|
| **Microsoft Edge** | ✅ Full | Developer Mode | Recommended browser |
| **Google Chrome** | ✅ Full | Developer Mode | Fully compatible |
| **Mozilla Firefox** | ⚠️ Limited | Temporary Add-on | Reloads required after restart |
| **Brave** | ✅ Full | Developer Mode | Chromium-based, fully compatible |
| **Opera** | ✅ Full | Developer Mode | Chromium-based, fully compatible |
| **Vivaldi** | ✅ Full | Developer Mode | Chromium-based, fully compatible |
| **Safari** | ❌ No | N/A | Different extension system |

### Why Firefox is Limited:
Firefox uses a different extension system and doesn't support permanent loading of unpacked extensions. The extension works perfectly but needs to be reloaded after each browser restart.

### Features

- 🔐 **Automatic Login**: Detects WiFi portal pages and automatically fills in your credentials
- 🛡️ **Secure Storage**: Safely stores your credentials using browser sync storage
- 🎯 **Smart Detection**: Recognizes common portal patterns and form fields
- 🧪 **Test Mode**: Test the extension on any page to see if it can detect login forms
- ⚡ **Fast & Lightweight**: Minimal resource usage with efficient detection
- 🌐 **Cross-Browser**: Works on Chrome, Edge, Brave, Opera, Vivaldi, and Firefox

## Setup and Usage

### Initial Setup

1. **Click the Extension Icon**:
   - Look for the WiFi Auto Login icon in your toolbar
   - Click it to open the settings popup

2. **Enter Your Credentials**:
   - Enter your WiFi portal username
   - Enter your WiFi portal password
   - Make sure "Enable auto-login" is checked
   - Click "Save Settings"

### How It Works

1. **Automatic Detection**: The extension monitors web pages for common WiFi portal indicators
2. **Smart Form Recognition**: It identifies username, password, and submit button fields
3. **Secure Auto-Fill**: Your saved credentials are automatically filled in
4. **Auto-Submit**: The login form is automatically submitted after a short delay

### Testing

1. **Test on Current Page**:
   - Navigate to your WiFi portal login page
   - Open the extension popup
   - Click "Test on Current Page"
   - The extension will highlight detected fields and fill them

2. **Live Testing**:
   - Connect to a WiFi network that requires portal login
   - The extension should automatically detect the portal and log you in

## Supported Portal Types

The extension works with most common WiFi portal types:

- **Hotel WiFi**: Most hotel chains and independent hotels
- **Airport WiFi**: Major airports worldwide
- **Coffee Shop WiFi**: Starbucks, McDonald's, etc.
- **Public WiFi**: Libraries, malls, restaurants
- **Corporate WiFi**: Office buildings and business centers
- **University WiFi**: Campus guest networks

## Common Portal Patterns Detected

- Username/password combinations
- Email/password combinations
- Login forms with "Connect" or "Access Internet" buttons
- Captive portal pages with terms acceptance
- Pages containing keywords like "login", "portal", "captive", "auth"

## Troubleshooting

### Extension Not Working?

1. **Check Permissions**:
   - Make sure the extension has permission to access websites
   - Go to `edge://extensions/` and check the extension permissions

2. **Verify Credentials**:
   - Open the extension popup and verify your saved credentials
   - Make sure "Enable auto-login" is checked

3. **Test Detection**:
   - Use the "Test on Current Page" button to see if forms are detected
   - Check the browser console for any error messages

### Portal Not Detected?

1. **Manual Testing**:
   - Try the test button on the portal page
   - Check if the form fields are highlighted

2. **Report Issues**:
   - Note the portal URL and form structure
   - The extension can be updated to support new portal types

### Security Concerns

1. **Password Storage**:
   - Passwords are stored securely using Chrome's sync storage
   - Data is encrypted and synchronized across your devices

2. **Network Security**:
   - Only works on forms with standard HTML input fields
   - Does not transmit data to external servers

## Customization

### Adding New Portal Patterns

Edit `content.js` to add new portal detection patterns:

```javascript
const PORTAL_INDICATORS = [
  'captive',
  'portal',
  'login',
  // Add your custom indicators here
];
```

### Custom Form Selectors

Add custom selectors for specific portal types:

```javascript
const USERNAME_SELECTORS = [
  'input[name*="user" i]',
  // Add your custom selectors here
];
```

## Privacy Policy

- **Data Collection**: No personal data is collected or transmitted
- **Local Storage**: Credentials are stored locally on your device
- **No Tracking**: No analytics or tracking code included
- **Open Source**: Full source code available for review

## Version History

- **v1.0.0**: Initial release with basic auto-login functionality

## Support

For issues, suggestions, or contributions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Test with the built-in test functionality

## License

This extension is provided as-is for educational and personal use. Modify and distribute as needed.

---

**Note**: Always ensure you have permission to use automated login tools on the networks you connect to. Some networks may have policies against automated access.
