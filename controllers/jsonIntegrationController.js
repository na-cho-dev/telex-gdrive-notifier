// import { getConfig } from "../config/config.js";

const jsonIntegration = (req, res) => {
  // const { baseURL } = getConfig();
  const baseURL = req.protocol + "s://" + req.get("host");

  const jsonIntegration = {
    "data": {
      "date": {
        "created_at": "2025-02-22",
        "updated_at": "2025-02-22"
      },
      "descriptions": {
        "app_description": "Telex GDrive Notifier is a lightweight service that monitors Google Drive and sends real-time backup notifications to a Telex Channel 🚀",
        "app_logo": "https://iili.io/2ybBmwQ.png",
        "app_name": "Telex GDrive Notifier",
        "app_url": baseURL,
        "background_color": "#fff"
      },
      "integration_category": "Cloud Services",
      "integration_type": "interval",
      "is_active": false,
      "key_features": [
        "File Change Update",
        "File Deleted Update",
        "File Modified Update"
      ],
      "permissions": {
        "monitoring_user": {
          "always_online": true,
          "display_name": "Telex GDrive Notifier"
        }
      },
      "settings": [
        {
          "label": "interval",
          "type": "text",
          "required": true,
          "default": "* * * * *"
        },
        {
          "label": "Folder ID",
          "type": "text",
          "required": true,
          "default": ""
        }
      ],
      "tick_url": `${baseURL}/tick`,
      "target_url": ""
    }
  }

  res.status(200).json(jsonIntegration)
}

export default jsonIntegration;