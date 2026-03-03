export function EduLinkUpLogo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const fontSize = size === 'sm' ? '16' : size === 'lg' ? '28' : '22'

  return (
    <span className={`inline-flex items-center ${className}`} aria-label="EduLinkUp">
      <span
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: `${fontSize}px`,
          letterSpacing: '0.5px',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#C8922A' }}>Edu</span>
        <span style={{ color: '#E8B228' }}>Link</span>
        <span style={{ color: '#D4A017' }}>Up</span>
      </span>
    </span>
  )
}
