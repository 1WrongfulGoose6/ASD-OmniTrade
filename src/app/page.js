export const metadata = {
  title: "OmniTrade",
  description: "OmniTrade Home Page",
};

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        OmniTrade
      </h1>
    </main>
  );
}
