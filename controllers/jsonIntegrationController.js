const jsonIntegration = (req, res) => {
    const integration_json_data = {
      "data": {
        "date": {
          "created_at": "2025-02-19",
          "updated_at": "2025-02-19"
        },
        "descriptions": {
          "app_name": "Telex GDrive Notifier",
          "app_description": "Telex GDrive Notifier is a lightweight service that monitors Google Drive and sends real-time backup notifications to a Telex Channel 🚀",
          "app_logo": "https://imgur.com/a/S2KPQ3W",
          "app_url": process.env.TELEX_APP_URL,
          "background_color": "#fff"
        },
        "is_active": true,
        "integration_category": "Cloud Services",
        "integration_type": "interval",
        "key_features": [
          "Folder Backup",
          "File Backup",
          "Notify File Change"
        ],
        "author": "NachoDev",
        "settings": [
          {
            "label": "Time Interval",
            "type": "dropdown",
            "required": true,
            "default": "1min",
            "options": [
              "1min",
              "2min",
              "5min",
              "10min"
            ]
          },
          {
            "label": "Folder ID",
            "type": "text",
            "required": true,
            "default": ""
          }
        ],
        "target_url": `${process.env.TELEX_TARGET_URL}/0194ff2f-dd2a-748d-ae91-1cb09a3b4eb4`,
        "tick_url": `${process.env.TELEX_APP_URL}/telex-webhook`
      }
    }

    res.status(200).json(integration_json_data)
}

export default jsonIntegration;