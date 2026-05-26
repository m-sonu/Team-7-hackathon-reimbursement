import './animations.css'

export type StepEmotion  = 'proud' | 'focused' | 'sleepy'
export type StepHeadState = 'completed' | 'active' | 'pending'

type Props = {
  emotion: StepEmotion
  state: StepHeadState
  size?: number
}

const FUR    = '#C17F3E'
const EAR_IN = '#D4956A'
const PATCH  = '#3D1C02'
const MUZZLE = '#E8C99A'
const NOSE   = '#1A0A00'
const WHITE  = '#FFFFFF'
const LEAF   = '#5BAD52'
const LEAF_D = '#3D8A35'
const OL     = '#2C1810'
const BLUSH  = '#F4A0A0'

export function TanukiStepHead({ emotion, state, size = 40 }: Props) {
  const isProud   = emotion === 'proud'
  const isFocused = emotion === 'focused'
  const isSleepy  = emotion === 'sleepy'

  const leafRotate =
    isSleepy  ? 'rotate(30 60 16)'
    : isFocused ? 'rotate(-20 60 16)'
    : 'rotate(-8 60 16)'

  // One connected raccoon mask — shape shifts per emotion
  const raccoonMask =
    isProud   ? 'M16,61 Q26,49 42,52 Q51,49 60,51 Q69,49 78,52 Q94,49 104,61 Q102,75 88,79 Q74,82 64,75 Q61,71 60,72 Q59,71 56,75 Q46,82 32,79 Q18,75 16,61 Z'
    : isFocused ? 'M16,62 Q26,50 42,53 Q51,50 60,52 Q69,51 79,55 Q94,53 104,64 Q102,77 88,81 Q74,84 64,77 Q61,73 60,74 Q59,73 56,77 Q46,84 32,81 Q18,77 16,62 Z'
    :             'M18,65 Q26,57 42,60 Q51,57 60,59 Q69,57 78,60 Q94,57 102,65 Q100,75 86,77 Q72,79 64,73 Q61,70 60,71 Q59,70 56,73 Q48,79 34,77 Q20,75 18,65 Z'

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity: state === 'pending' ? 0.6 : 1 }}
    >
      {/* ── Leaf ── */}
      <g transform={leafRotate}>
        <ellipse cx="60" cy="16" rx="10" ry="16" fill={LEAF}
                 stroke={LEAF_D} strokeWidth="2" />
        <line x1="60" y1="18" x2="60" y2="30"
              stroke={LEAF_D} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ── Ears — pointed rotated ellipses, behind head ── */}
      <ellipse cx="26" cy="26" rx="13" ry="17" fill={FUR} stroke={OL}
               strokeWidth="2" transform="rotate(-15 26 26)" />
      <ellipse cx="94" cy="26" rx="13" ry="17" fill={FUR} stroke={OL}
               strokeWidth="2" transform="rotate(15 94 26)" />
      <ellipse cx="26" cy="28" rx="7"  ry="11" fill={EAR_IN}
               transform="rotate(-15 26 28)" />
      <ellipse cx="94" cy="28" rx="7"  ry="11" fill={EAR_IN}
               transform="rotate(15 94 28)" />

      {/* ── Head — wider than tall ── */}
      <ellipse cx="60" cy="65" rx="52" ry="48" fill={FUR} stroke={OL} strokeWidth="3.5" />

      {/* ── Muzzle — elongated snout, drawn before mask ── */}
      <ellipse cx="60" cy="83" rx="22" ry="17" fill={MUZZLE}
               stroke={OL} strokeWidth="2" />

      {/* ── Pale forehead stripe ── */}
      <ellipse cx="60" cy="56" rx="20" ry="9" fill={EAR_IN} opacity="0.45" />

      {/* ── Cheek tufts — fluffy fur beyond head boundary ── */}
      <ellipse cx="8"   cy="74" rx="18" ry="13" fill={FUR} stroke={OL} strokeWidth="1.5" />
      <ellipse cx="112" cy="74" rx="18" ry="13" fill={FUR} stroke={OL} strokeWidth="1.5" />

      {/* ── Connected raccoon mask ── */}
      <path d={raccoonMask} fill={PATCH} />

      {/* ── Snout tip — paler patch at nose bridge ── */}
      <ellipse cx="60" cy="77" rx="10" ry="8" fill={EAR_IN} opacity="0.35" />

      {/* ── Nose — wide and flat ── */}
      <path d="M53,75 Q60,71 67,75 Q63,82 60,83 Q57,82 53,75 Z" fill={NOSE} />
      <ellipse cx="57" cy="75" rx="2.5" ry="1.8" fill={WHITE} opacity="0.5" />

      {/* ── Eyebrows (focused) ── */}
      {isFocused && (
        <>
          <path d="M33,50 Q42,46 51,50" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
          <path d="M69,48 Q78,43 87,48" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* ── Eyes — inside the connected mask ── */}
      {isProud && (
        /* Happy closed crescents */
        <>
          <path d="M33,61 Q42,53 51,61" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
          <path d="M69,61 Q78,53 87,61" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {isFocused && (
        <>
          {/* Left — wide open */}
          <circle cx="42" cy="61" r="9"    fill={WHITE} />
          <circle cx="45" cy="62" r="5.5"  fill={PATCH} />
          <circle cx="47" cy="59" r="2"    fill={WHITE} />
          <circle cx="39" cy="66" r="1.2"  fill={WHITE} opacity="0.6" />
          {/* Right — squinted */}
          <ellipse cx="78" cy="62" rx="9" ry="6" fill={WHITE} />
          <circle  cx="80" cy="62" r="4"          fill={PATCH} />
          <circle  cx="77" cy="60" r="1.2"  fill={WHITE} opacity="0.6" />
          <path d="M69,57 Q78,54 87,57" stroke={OL} fill="none" strokeWidth="3" />
        </>
      )}
      {isSleepy && (
        <>
          <ellipse cx="42" cy="63" rx="9" ry="4" fill={WHITE} />
          <ellipse cx="42" cy="63" rx="9" ry="4" fill={PATCH} opacity="0.4" />
          <path d="M33,60 Q42,56 51,60" stroke={OL} fill={FUR} strokeWidth="5"
                strokeLinecap="round" />
          <ellipse cx="78" cy="63" rx="9" ry="4" fill={WHITE} />
          <path d="M69,60 Q78,56 87,60" stroke={OL} fill={FUR} strokeWidth="5"
                strokeLinecap="round" />
        </>
      )}

      {/* ── Mouth — wider, on lower muzzle ── */}
      {isProud && (
        <path d="M44,90 Q60,102 76,90" stroke={OL} fill="none"
              strokeWidth="2.5" strokeLinecap="round" />
      )}
      {isFocused && (
        <path d="M50,88 L70,88" stroke={OL} strokeWidth="2.5" strokeLinecap="round" />
      )}
      {isSleepy && (
        <ellipse cx="60" cy="91" rx="5" ry="6" fill={OL} opacity="0.7" />
      )}

      {/* ── Blush on cheek tufts (proud) ── */}
      {isProud && (
        <>
          <ellipse cx="10"  cy="76" rx="10" ry="7" fill={BLUSH} opacity="0.7" />
          <ellipse cx="110" cy="76" rx="10" ry="7" fill={BLUSH} opacity="0.7" />
        </>
      )}

      {/* ── Sweat bead (focused) ── */}
      {isFocused && (
        <>
          <ellipse cx="94" cy="46" rx="4" ry="6" fill="#87CEEB"
                   opacity="0.85" className="step-sweat-pulse" />
          <path d="M92,42 Q94,38 96,42" fill="#87CEEB" opacity="0.85" />
        </>
      )}

      {/* ── Floating z (sleepy) ── */}
      {isSleepy && (
        <text x="88" y="40" fontSize="14" fontWeight="bold" fill="#94A3B8"
              fontFamily="sans-serif" className="step-sleepy-z">z</text>
      )}
    </svg>
  )
}
