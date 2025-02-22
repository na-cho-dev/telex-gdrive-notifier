# 📢 Telex Google Drive Notifier
## 🚀 Description

Telex Google Drive Notifier is a Node.js application that monitors changes in a specified Google Drive folder and sends real-time notifications to the Telex App via a webhook. It detects file uploads, modifications, and deletions, ensuring that users stay updated with any changes in their Google Drive.

## 📌 Features
✅ Monitors file changes in a Google Drive folder   
✅ Sends instant notifications to Telex App     
✅ Uses Google Drive API for real-time updates  
✅ Stores configuration in Redis for persistence    
✅ Supports webhook integration     
✅ Runs as a background service on a VPS

## 📦 Installation
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/telex-gdrive-notifier.git
cd telex-gdrive-notifier
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a .env file in the project root and configure it:
```sh
PORT=3000
GOOGLE_DRIVE_API_KEY=your-api-key
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REDIRECT_URI=your-redirect-uri
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 4️⃣ Start the Application
```sh
npm start
```
or run in development mode

```sh
npm run dev
```

## 🔗 API Endpoints
### 🔹Webhook Setup
**POST /tick**   
Registers a webhook and starts monitoring a Google Drive folder.

Request Body
```json
{
  "channel_id": "your-channel-id",
  "return_url": "https://your-telex-webhook-url.com",
  "settings": [
    { "label": "Folder ID", "default": "your-folder-id" }
  ]
}
```

### 🔹 Get Google Drive Changes
**GET /changes**    
Manually fetches the latest changes from the monitored folder.

## 🛠 Running as a Background Service (Systemd)
If you're running this on a VPS, you can create a systemd service:

### 1️⃣ Create a new service file
```sh
sudo nano /etc/systemd/system/telex-gdrive-notifier.service
```

### 2️⃣ Add the following content:
```ini
[Unit]
Description=Telex GDrive Notifier
After=network.target

[Service]
ExecStart=/usr/bin/npm run start
WorkingDirectory=/root/telex-gdrive-notifier
Restart=always
User=root
Environment=NODE_ENV=production
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=telex-gdrive-notifier

[Install]
WantedBy=multi-user.target
```

### 3️⃣ Reload systemd and enable the service
```sh
sudo systemctl daemon-reload
sudo systemctl enable telex-gdrive-notifier
sudo systemctl start telex-gdrive-notifier
```

### 4️⃣ Check logs
```sh
journalctl -u telex-gdrive-notifier -f
```

## 🚦 Logging Requests
Each request is logged in the format:

```scss
[2025-02-21T12:34:56.789Z] - [GET /api/users HTTP/1.1] - 200 OK (123ms)
```

## 🛑 Clearing Redis Cache
If you need to reset the Redis cache, run:

```sh
redis-cli FLUSHALL
```

## 📜 License
This project is licensed under the **MIT License**.

## 📬 Contact
For support or contributions, reach out at your-email@example.com.