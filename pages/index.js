import { useState } from "react";

export default function Home() {
  const [beast, setBeast] = useState("");
  const [kin, setKin] = useState("");
  const [branch, setBranch] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beast, kin, branch, context }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "分析失敗，請檢查伺服器。" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>新版分析介面</h1>
      <form onSubmit={handleSubmit}>
        <label>
          六獸：
          <select value={beast} onChange={(e) => setBeast(e.target.value)} required>
            <option value="">請選擇</option>
            <option value="青龍">青龍</option>
            <option value="朱雀">朱雀</option>
            <option value="勾陳">勾陳</option>
            <option value="螣蛇">螣蛇</option>
            <option value="白虎">白虎</option>
            <option value="玄武">玄武</option>
          </select>
        </label>
        <br /><br />

        <label>
          六親：
          <select value={kin} onChange={(e) => setKin(e.target.value)} required>
            <option value="">請選擇</option>
            <option value="父母">父母</option>
            <option value="兄弟">兄弟</option>
            <option value="子孫">子孫</option>
            <option value="妻財">妻財</option>
            <option value="官鬼">官鬼</option>
          </select>
        </label>
        <br /><br />

        <label>
          地支：
          <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
            <option value="">請選擇</option>
            <option value="子">子</option>
            <option value="丑">丑</option>
            <option value="寅">寅</option>
            <option value="卯">卯</option>
            <option value="辰">辰</option>
            <option value="巳">巳</option>
            <option value="午">午</option>
            <option value="未">未</option>
            <option value="申">申</option>
            <option value="酉">酉</option>
            <option value="戌">戌</option>
            <option value="亥">亥</option>
          </select>
        </label>
        <br /><br />

        <label>
          情境：
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="例如：愛情 / 事業 / 健康"
            required
          />
        </label>
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "分析中…" : "開始分析"}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px", padding: "15px", border: "1px solid gray" }}>
          <h2>分析結果：</h2>
          <div style={{ whiteSpace: "pre-line" }}>
            {result.text || result.error || JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
