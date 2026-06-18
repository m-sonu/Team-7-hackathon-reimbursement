type Props = {
  title: string
  subtitle?: string
  onClose: () => void
  variant: 'success' | 'error'
}

const VARIANTS = {
  success: {
    fill:       '#F1FDF4',
    stroke:     '#2E7D32',
    titleColor: '#1B5E20',
    subColor:   '#388E3C',
    btnStroke:  '#2E7D32',
    btnText:    '#2E7D32',
    sp1: '#43A047',
    sp2: '#66BB6A',
    sp3: '#81C784',
  },
  error: {
    fill:       '#FFF5F5',
    stroke:     '#C62828',
    titleColor: '#B71C1C',
    subColor:   '#E53935',
    btnStroke:  '#C62828',
    btnText:    '#C62828',
    sp1: '#EF9A9A',
    sp2: '#EF9A9A',
    sp3: '#FFCDD2',
  },
} as const

export function CloudBubbleSVG({ title, subtitle, onClose, variant }: Props) {
  const c = VARIANTS[variant]

  return (
    <div style={{ position: 'relative', width: 'min(320px, 90vw)', aspectRatio: '320 / 240' }}>

      {/* Cloud shape + sparkles — purely visual */}
      <svg
        viewBox="0 0 320 240"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shadow layer */}
        <g opacity="0.08" transform="translate(4,6)">
          <circle cx="80"  cy="140" r="55" fill={c.stroke} />
          <circle cx="130" cy="110" r="62" fill={c.stroke} />
          <circle cx="190" cy="110" r="62" fill={c.stroke} />
          <circle cx="240" cy="140" r="55" fill={c.stroke} />
          <ellipse cx="160" cy="175" rx="110" ry="52" fill={c.stroke} />
        </g>

        {/* Cloud outline circles */}
        <circle cx="80"  cy="140" r="55" fill={c.fill} stroke={c.stroke} strokeWidth="3.5" />
        <circle cx="130" cy="110" r="62" fill={c.fill} stroke={c.stroke} strokeWidth="3.5" />
        <circle cx="190" cy="110" r="62" fill={c.fill} stroke={c.stroke} strokeWidth="3.5" />
        <circle cx="240" cy="140" r="55" fill={c.fill} stroke={c.stroke} strokeWidth="3.5" />
        <ellipse cx="160" cy="175" rx="112" ry="54" fill={c.fill} stroke={c.stroke} strokeWidth="3.5" />

        {/* Cover inner stroke joins */}
        <circle cx="80"  cy="140" r="50" fill={c.fill} />
        <circle cx="130" cy="110" r="57" fill={c.fill} />
        <circle cx="190" cy="110" r="57" fill={c.fill} />
        <circle cx="240" cy="140" r="50" fill={c.fill} />
        <ellipse cx="160" cy="175" rx="107" ry="49" fill={c.fill} />

        {/* Sparkles beside where head overlaps (above cloud bumps) */}
        <text x="84"  y="36" fontSize="18" fill={c.sp1} fontFamily="sans-serif">✦</text>
        <text x="224" y="32" fontSize="14" fill={c.sp2} fontFamily="sans-serif">✦</text>
        <text x="74"  y="50" fontSize="11" fill={c.sp3} fontFamily="sans-serif">★</text>
        <text x="232" y="46" fontSize="11" fill={c.sp3} fontFamily="sans-serif">★</text>
      </svg>

      {/* Text + button — HTML overlay for proper wrapping */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '9%',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 14%',
          gap: '6px',
        }}
      >
        <p
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: c.titleColor,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
            opacity: 1,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </p>

        {subtitle && (
          <p
            style={{
              fontSize: '12px',
              color: c.subColor,
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.4,
              opacity: 1,
              wordBreak: 'break-word',
            }}
          >
            {subtitle}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '6px',
            borderRadius: '16px',
            border: `2px solid ${c.btnStroke}`,
            background: 'white',
            color: c.btnText,
            fontWeight: 600,
            fontSize: '13px',
            padding: '6px 26px',
            cursor: 'pointer',
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
