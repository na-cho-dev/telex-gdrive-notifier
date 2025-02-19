import axios from "axios";

const telexWebhook = async (req, res) => {
    const payload = req.body;

    console.log("Payload:", payload)

    res.status(202).json({ status: "accepted" });
}

export default telexWebhook;