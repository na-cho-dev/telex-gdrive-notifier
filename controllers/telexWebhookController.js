import axios from "axios";

const telexWebhook = async (req, res) => {
    const { message, settings } = req.body;
    const url = `${process.env.TELEX_APP_URL}/monitor/:folderId`

    console.log("Payload:", req.body)

    try {
        const response = await axios.post(url, data, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }

    res.status(200).json({status: "Success", message: message})
}

export default telexWebhook;