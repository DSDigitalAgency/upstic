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

### Troubleshooting

If you see the error:
```
Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1200/...
```

Run:
```bash
npx playwright install chromium
```

### Environment Variables

No additional environment variables are required for Playwright browser installation.

