'use client';

export default function ResetSessionButton() {
  const handleReset = async () => {
    await fetch('/api/logout', {
      method: 'POST',
  });
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleReset}
      style={{
        padding: '0.5rem 1rem',
        background: '#c00',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '1rem',
      }}
    >
      🔄 Сбросить сессию
    </button>
  );
}
