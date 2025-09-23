const { google } = require("google-auth-library");
const axios = require("axios");
const key = require("../service-account.json");
const admin = require("../config/firebase");

// Hàm lấy access token từ service account
async function getAccessToken() {
  const client = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/firebase.messaging"],
    null
  );
  const tokens = await client.authorize();
  return tokens.access_token;
}

// Controller gửi notification
exports.sendNotification = async (req, res) => {
  try {
    const { fcmToken, title, body } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: "Thiếu fcmToken" });
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${key.project_id}/messages:send`,
      {
        message: {
          token: fcmToken,
          notification: {
            title: title || "Thông báo mới",
            body: body || "Bạn có một tin nhắn",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.sendNotification = async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Thiếu device token" });
    }

    const message = {
      notification: { title, body },
      token,
    };

    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

