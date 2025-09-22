export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    return res.status(200).json({
      ok: true,
      message: "Analyze success",
      echo: body
    });
  } catch (err) {
    return res.status(500).json({ error: "server_error", detail: String(err.message || err) });
  }
}
