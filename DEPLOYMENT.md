# Deployment Guide

## Playwright Browser Installation

This application uses Playwright for web scraping verification services. Playwright browsers must be installed on the production server.

### Automatic Installation

The `postinstall` script will automatically install Playwright browsers after `npm install`. However, if this doesn't run automatically, you can manually install browsers:

```bash
npx playwright install chromium
```

### For Production Servers

If you're deploying to a production server and browsers aren't installed:

1. **SSH into your server:**
   ```bash
   ssh your-server
   ```

2. **Navigate to your application directory:**
   ```bash
   cd /path/to/your/app
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

   Or with system dependencies (if you have sudo access):
   ```bash
   npx playwright install chromium --with-deps
   ```

### Build Process

The build script now automatically installs browsers before building:
```bash
npm run build
```

This ensures browsers are available when the application starts.

### System Dependencies (REQUIRED for Linux servers)

**IMPORTANT:** After installing Playwright browsers, you MUST install system dependencies on Linux servers.

If you see errors like:
```
error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file
```

You need to install system dependencies. Run one of the following:

**Option 1: Using Playwright's installer (Recommended):**
```bash
npx playwright install-deps chromium
```

**Option 2: Manual installation (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libcairo2 \
  libatspi2.0-0 \
  libxss1 \
  libgtk-3-0
```

**Option 3: Manual installation (CentOS/RHEL/Amazon Linux):**
```bash
sudo yum install -y \
  atk \
  cups-libs \
  libdrm \
  libxkbcommon \
  libXcomposite \
  libXdamage \
  libXfixes \
  libXrandr \
  mesa-libgbm \
  alsa-lib \
  pango \
  cairo \
  at-spi2-atk \
  libXScrnSaver \
  libXtst \
  gtk3
```

### Complete Installation Steps for Production

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Install system dependencies (REQUIRED on Linux):**
   ```bash
   npx playwright install-deps chromium
   ```
   
   Or if you don't have sudo access, contact your system administrator to install the required libraries.

### Troubleshooting

**Error: Executable doesn't exist**
```bash
npx playwright install chromium
```

**Error: Missing shared libraries (libatk-1.0.so.0, etc.)**
```bash
npx playwright install-deps chromium
```

**Error: Browser has been closed / Target page closed**
- Usually means system dependencies are missing
- Run: `npx playwright install-deps chromium`

### Environment Variables

No additional environment variables are required for Playwright browser installation.

