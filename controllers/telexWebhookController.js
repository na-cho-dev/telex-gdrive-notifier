import axios from "axios";

export const telexWebhook = async (req, res) => {
    const { channel_id, return_url, settings } = req.body;
    const baseUrl = req.protocol + "://" + req.get("host");

    export const folderId = settings.find(setting => setting.label === 'Folder ID')?.default;
    // console.log("Payload:", req.body)
    // console.log("Folder ID:", folderId)
    export const monitorUrl = `${baseUrl}/monitor/${folderId}`

    try {
        const response = await axios.get(monitorUrl, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }

    const data = {
        "event_name": "Google Drive Notifier",
        "message": "No Current File To Backup",
        "status": "success",
        "username": "Telex GDrive Backup Notifier Bot"
    };

    const sendRequest = async () => {
        try {
            const response = await fetch(return_url, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            // console.log("Result:", result);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    sendRequest();



    res.status(200).json({ status: "Success" })
}

// export default telexWebhook;