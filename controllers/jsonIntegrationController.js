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
        "background_color": "#HEXCODE"
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
          "default": "103QnFCkx6PIv25Pxt3rE1uRkNun0ZKiT"
        }
      ],
      "tick_url": `${baseURL}/tick`,
      "target_url": ""
    }
  }

  // const integration_json_data = {
  //   "data": {
  //     "date": {
  //       "created_at": "2025-02-19",
  //       "updated_at": "2025-02-19"
  //     },
  //     "descriptions": {
  //       "app_name": "Telex GDrive Notifier",
  //       "app_description": "Telex GDrive Notifier is a lightweight service that monitors Google Drive and sends real-time backup notifications to a Telex Channel 🚀",
  //       "app_logo": "https://iili.io/2ybBmwQ.png",
  //       "app_url": baseURL,
  //       "background_color": "#fff"
  //     },
  //     "is_active": false,
  //     "integration_category": "Cloud Services",
  //     "integration_type": "interval",
  //     "key_features": [
  //       "Folder Backup",
  //       "File Backup",
  //       "Notify File Change"
  //     ],
  //     "permissions": {
  //       "monitoring_user": {
  //         "always_online": true,
  //         "display_name": "Telex GDrive Notifier"
  //       }
  //     },
  //     "settings": [
  //       {
  //         "label": "interval",
  //         "type": "text",
  //         "required": true,
  //         "default": "*/10 * * * * *"
  //       },
  //       {
  //         "label": "Folder ID",
  //         "type": "text",
  //         "required": true,
  //         "default": "103QnFCkx6PIv25Pxt3rE1uRkNun0ZKiT"
  //       }
  //     ],
  //     "target_url": "",
  //     "tick_url": `${baseURL}/tick`
  //   }
  // }

  res.status(200).json(jsonIntegration)
}

export default jsonIntegration;