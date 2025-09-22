// pages/api/analyze.js
export default async function handler(req, res) {
  try {
    // 限定只允許 POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "缺少 API Key，請在 Vercel 設定環境變數 OPENAI_API_KEY" });
    }

    // 取出前端傳來的內容
    const { beast, kin, branch, context } = req.body ?? {};

    if (!beast || !kin || !branch || !context) {
      return res.status(400).json({ error: "缺少必要欄位（beast, kin, branch, context）" });
    }

    // 呼叫 OpenAI API
    const prompt = `
你是一位精通金錢卦的占卜師。請根據以下輸入，給出一段完整的分析說明。

六獸：${beast}
六親：${kin}
地支：${branch}
情境：${context}

請給出三部分：
1. 個性描述（說明該組合特質）
2. 衝突或優勢（該組合容易產生的矛盾或強項）
3. 建議方向（如何調整或應用在生活/職場/感情/健康）
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 這裡可以換成 gpt-4o, gpt-4.1 等
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "未產生分析結果";

    // 回傳給前端
    res.status(200).json({ text });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || "伺服器內部錯誤" });
  }
}
