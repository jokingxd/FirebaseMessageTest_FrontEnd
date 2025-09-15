// src/pages/api/registerToken.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;

    try {
      const response = await fetch(
        "https://pushnotificationbackend-kvi4.onrender.com/api/PushNotification/register-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
