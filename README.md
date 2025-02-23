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
PORT=3300
GOOGLE_SERVICE_ACCOUNT_PATH=./config/service-account.json
GOOGLE_DRIVE_WEBHOOK_TOKEN='b996c1ef-89d5-4961-8950-0611d580d4f6'

TELEX_ENV='dev'
```

### 4️⃣ Start the Application
```sh
npm start
```
or run in development mode

```sh
npm run dev
```

### Get Google Service Account
- To get the json for the `GOOGLE_SERVICE_ACCOUNT_PATH`, click [here](https://docs.edna.io/kb/get-service-json/)

- Then copy the file to `./config` in the app root directory.   


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

## ✈️ Deployment
The live app is deployed [here](https://telexgdrivenotifier.live)


## ⚙️ Telex Integration
- Add the integration JSON URL in your telex organization
- Configure the Time Interval to update settings in app and check for file changes.
- Configure the Folder ID to watch for file changes in that Folder.   

You can easily copy a Google Drive folder ID using the following methods:

1. Open Google Drive.
2. Navigate to the folder you want to copy the ID from.
3. Look at the URL in the address bar. It will look like this:
```ruby
https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
```
The folder ID is the long string after /folders/ → 1AbCdEfGhIjKlMnOpQrStUvWxYz.    

4. Copy and use it.

## 📷 Screenshot
![Telex Test Image](./docs/telex_test_image.png)



## 📜 License
This project is licensed under the **MIT License**.

## 📬 Contact
For support or contributions, reach out at nachodev369@gmail.com