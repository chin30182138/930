export default function Home() {
  async function testAPI() {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aBeast: "青龍", aKin: "兄弟", aBranch: "酉" })
    });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>API 測試頁</h1>
      <button onClick={testAPI}>一鍵測試 API</button>
    </div>
  );
}
