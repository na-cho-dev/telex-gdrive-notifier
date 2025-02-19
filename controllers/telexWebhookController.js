import axios from "axios";

const telexWebhook = async (req, res) => {
    const { message, settings } = req.body;
    // const url = `${process.env.TELEX_TARGET_URL}/0194ff2f-dd2a-748d-ae91-1cb09a3b4eb4`;
    // const data = {
    // "event_name": "Google drive Notifier",
    // "message": "No Current File To Backup",
    // "status": "success",
    // "username": "Bot",
    // };

    console.log("Body:", req.body)

    // try {
    //     const response = await axios.post(url, data, {
    //         headers: {
    //             "Accept": "application/json",
    //             "Content-Type": "application/json"
    //         }
    //     });
    //     console.log(response.data);
    // } catch (error) {
    //     console.error(error);
    // }

    res.status(200).json({status: "Success", message: message})
}

export default telexWebhook;