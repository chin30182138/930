// /pages/api/analyze.js —— 統一版（含六維度分析 + 性愛章節）
// 支援單人 / 雙人、六獸、六親、地支，情境可選「個性分析 / 愛情 / 性愛 / 職場情境」

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const {
      mode = "single",
      aBeast = "", aKin = "", aBranch = "",
      bBeast = "", bKin = "", bBranch = "",
      context = "",        
      sexDetail = ""       
    } = req.body ?? {};

    const isDual = mode === "dual";
    const isSex  = (context || "").trim() === "性愛";

    // ===== 工具 =====
    const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
    const bullet = (arr) => arr.map(s => `- ${s}`).join("\n");
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const elemOf = (branch) => {
      const 水 = ["子","亥"], 木 = ["寅","卯"], 火 = ["巳","午"], 金 = ["申","酉"], 土 = ["丑","辰","未","戌"];
      if (水.includes(branch)) return "水";
      if (木.includes(branch)) return "木";
      if (火.includes(branch)) return "火";
      if (金.includes(branch)) return "金";
      if (土.includes(branch)) return "土";
      return "";
    };

    // ===== 六維度基礎分數 =====
    const base = { fit:60, comm:60, pace:60, account:60, trust:60, innov:60 };
    const beastW = {
      "青龍": { fit:4, comm:0, pace:6, account:0, trust:0, innov:8 },
      "朱雀": { fit:0, comm:10, pace:0, account:0, trust:0, innov:4 },
      "勾陳": { fit:0, comm:0, pace:-3, account:9, trust:2, innov:0 },
      "螣蛇": { fit:0, comm:3, pace:0, account:0, trust:-3, innov:9 },
      "白虎": { fit:3, comm:0, pace:9, account:0, trust:-4, innov:0 },
      "玄武": { fit:0, comm:0, pace:0, account:6, trust:10, innov:-3 }
    };
    const kinW = {
      "父母": { account:8, trust:3 },
      "兄弟": { comm:6 },
      "子孫": { innov:6, trust:2 },
      "妻財": { fit:6, account:2 },
      "官鬼": { pace:6, account:2 }
    };
    const elemW = {
      "水": { trust:6, comm:2 },
      "木": { innov:6, comm:3 },
      "火": { pace:6, innov:2 },
      "金": { account:6, fit:2 },
      "土": { fit:4, account:3, pace:-1 }
    };
    const zero = () => ({ fit:0, comm:0, pace:0, account:0, trust:0, innov:0 });
    const add = (dst, d) => { for(const k in d) dst[k]=(dst[k]??0)+(d[k]??0); return dst; };

    function scoreOne(beast, kin, branch) {
      const out = zero();
      if (beastW[beast]) add(out, beastW[beast]);
      if (kinW[kin]) add(out, kinW[kin]);
      const el = elemOf(branch);
      if (elemW[el]) add(out, elemW[el]);
      return out;
    }

    const A = scoreOne(aBeast, aKin, aBranch);
    const B = isDual ? scoreOne(bBeast, bKin, bBranch) : zero();
    const syn = zero();

    if (isDual) {
      if (aBeast && bBeast && aBeast === bBeast) add(syn, { fit:3, comm:2 });
      const pair = new Set([aBeast, bBeast]);
      if (pair.has("青龍") && pair.has("玄武")) add(syn, { trust:4, comm:2 });
      if (pair.has("白虎") && pair.has("玄武")) add(syn, { trust:-4 });
      if (pair.has("朱雀") && pair.has("勾陳")) add(syn, { comm:-2, account:2 });
      if (pair.has("螣蛇") && pair.has("玄武")) add(syn, { trust:-2, innov:2 });
      if (elemOf(aBranch) && elemOf(aBranch) === elemOf(bBranch)) add(syn, { fit:2 });
    }

    const ctxTweaks = zero();
    if (context === "跨部門協作") add(ctxTweaks, { comm:4, account:2 });
    if (context === "壓期交付專案") add(ctxTweaks, { pace:6, account:3, trust:-2 });
    if (context === "愛情") add(ctxTweaks, { trust:4, comm:2 });
    if (isSex) add(ctxTweaks, { comm:3, trust:3 });

    const scores = {};
    for (const k of Object.keys(base)) scores[k] = clamp(base[k] + A[k] + B[k] + syn[k] + ctxTweaks[k]);

    // ===== 個性 & 衝突 =====
    const personaMap = {
      "青龍": ["擅長設局與節奏帶領。","重視成果驗證，對承諾敏感。"],
      "朱雀": ["善於表達與共鳴。","喜歡互動靈感與即時回饋。"],
      "勾陳": ["務實穩定，偏好流程。","重視資源與邊界。"],
      "螣蛇": ["創意豐富，思路跳躍。","需要彈性，忌被約束。"],
      "白虎": ["行動派，推進快。","需注意情緒與同頻。"],
      "玄武": ["重安全與信任。","偏好穩紮穩打，重視界線。"]
    };

    const elemTone = {
      "水": "情緒流動度高，需要清楚同意與回看。",
      "木": "成長導向，需明確階段回饋。",
      "火": "節奏快，容易追求刺激。",
      "金": "標準明確，討厭模糊。",
      "土": "重秩序與承諾。"
    };

    const elA = elemOf(aBranch);
    const elB = isDual ? elemOf(bBranch) : "";

    const p1 = [
      "1) 個性描述",
      ...(personaMap[aBeast] || ["特質待補。"]),
      ...(isDual ? (personaMap[bBeast] || []).map(s => `對方：${s}`) : []),
      `我方元素：${elA || "—"} ${elemTone[elA] || ""}`,
      ...(isDual ? [`對方元素：${elB || "—"} ${elemTone[elB] || ""}`] : [])
    ].map(s => (s.startsWith("1)") ? s : `- ${s}`)).join("\n");

    const p2 = `2) 衝突熱點
${bullet(isDual
  ? ["節奏與責任標準不同。","回饋頻率與形式不一。","情緒安全感建立速度不同。"]
  : ["自我要求高，易忽略情緒。","高壓下傾向加速。","對模糊容忍度低。"]
)}`;

    // ===== 六維度解讀 =====
    const dimNames = { fit:"契合", comm:"溝通", pace:"節奏", account:"責任", trust:"信任", innov:"創新" };
    const dimSorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const top = dimSorted[0]?.[0], low = dimSorted[5]?.[0];
    const p3 = `3) 六維度分數解讀
${bullet([
  `整體：以「${dimNames[top]}」為優勢，「${dimNames[low]}」為提升點。`,
  `契合/溝通：${scores.fit}/${scores.comm}`,
  `節奏/責任：${scores.pace}/${scores.account}`,
  `信任/創新：${scores.trust}/${scores.innov}`
])}`;

    // ===== 性愛章節（精簡展示） =====
    const sexBlock = isSex ? `
性愛分析
- 基調：以「${aBeast}${aBranch}」${isDual ? ` × ${bBeast}${bBranch}` : ""} 的組合為核心。
- 情境：${getRandom([
      "營造安全舒適的氛圍，循序漸進。",
      "強調語言互動，透過溝通引導情感。",
      "追求刺激與速度感，讓節奏成為亮點。"
    ])}
- 建議：${getRandom([
      "保持節奏一致，兼顧情感與身體。",
      "嘗試新鮮元素，但需明確邊界。",
      "專注於信任與情感連結。"
    ])}
` : "";

    // ===== 標籤 =====
    const dimLabel = { fit:"契合", comm:"溝通", pace:"節奏", account:"責任", trust:"信任", innov:"創新" };
    const top2 = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>dimLabel[k]);
    const tags = [...new Set([...top2, context || "", isSex ? "情感連結" : ""])]
      .filter(Boolean).slice(0,6);

    const jsonBlock =
` \`\`\`json
{
  "scores": ${JSON.stringify(scores)},
  "tags": ${JSON.stringify(tags)}
}
\`\`\``;

    // ===== 最終輸出 =====
    const text = [p1, "", p2, "", p3, sexBlock, "", jsonBlock].join("\n").trim();
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
}
