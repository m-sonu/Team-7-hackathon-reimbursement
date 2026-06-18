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

// AI palette
const AI_VIOLET = '#7C3AED'
const AI_INDIGO = '#4F46E5'
const AI_GREEN  = '#10B981'
const AI_CYAN   = '#06B6D4'
const AI_SLATE  = '#94A3B8'

export function TanukiStepHead({ emotion, state, size = 40 }: Props) {
  const isProud   = emotion === 'proud'
  const isFocused = emotion === 'focused'
  const isSleepy  = emotion === 'sleepy'

  const leafRotate =
    isSleepy  ? 'rotate(30 60 16)'
    : isFocused ? 'rotate(-20 60 16)'
    : 'rotate(-8 60 16)'

  const raccoonMask =
    isProud   ? 'M16,61 Q26,49 42,52 Q51,49 60,51 Q69,49 78,52 Q94,49 104,61 Q102,75 88,79 Q74,82 64,75 Q61,71 60,72 Q59,71 56,75 Q46,82 32,79 Q18,75 16,61 Z'
    : isFocused ? 'M16,62 Q26,50 42,53 Q51,50 60,52 Q69,51 79,55 Q94,53 104,64 Q102,77 88,81 Q74,84 64,77 Q61,73 60,74 Q59,73 56,77 Q46,84 32,81 Q18,77 16,62 Z'
    :             'M18,65 Q26,57 42,60 Q51,57 60,59 Q69,57 78,60 Q94,57 102,65 Q100,75 86,77 Q72,79 64,73 Q61,70 60,71 Q59,70 56,73 Q48,79 34,77 Q20,75 18,65 Z'

  // Circuit trace color and opacity per emotion
  const cc = isProud ? AI_GREEN : isFocused ? AI_VIOLET : AI_SLATE
  const co = isSleepy ? 0.28 : 0.65

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
      {/* ── Active AI glow ring ── */}
      {isFocused && (
        <circle cx="60" cy="65" r="56" stroke={AI_VIOLET} strokeWidth="1.5"
                opacity="0.18" className="step-sweat-pulse" />
      )}

      {/* ── Leaf / Signal antenna ── */}
      <g transform={leafRotate}>
        <ellipse cx="60" cy="16" rx="10" ry="16" fill={LEAF}
                 stroke={LEAF_D} strokeWidth="2" />
        <line x1="60" y1="18" x2="60" y2="30"
              stroke={LEAF_D} strokeWidth="1.5" strokeLinecap="round" />
        {/* Signal pulse dot at tip */}
        <circle cx="60" cy="5" r="3"
                fill={isProud ? AI_GREEN : isFocused ? AI_VIOLET : AI_SLATE}
                opacity="0.9" />
      </g>

      {/* ── Ears ── */}
      <ellipse cx="26" cy="26" rx="13" ry="17" fill={FUR} stroke={OL}
               strokeWidth="2" transform="rotate(-15 26 26)" />
      <ellipse cx="94" cy="26" rx="13" ry="17" fill={FUR} stroke={OL}
               strokeWidth="2" transform="rotate(15 94 26)" />
      <ellipse cx="26" cy="28" rx="7"  ry="11" fill={EAR_IN}
               transform="rotate(-15 26 28)" />
      <ellipse cx="94" cy="28" rx="7"  ry="11" fill={EAR_IN}
               transform="rotate(15 94 28)" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="65" rx="52" ry="48" fill={FUR} stroke={OL} strokeWidth="3.5" />

      {/* ── Muzzle ── */}
      <ellipse cx="60" cy="83" rx="22" ry="17" fill={MUZZLE} stroke={OL} strokeWidth="2" />

      {/* ── Pale forehead stripe ── */}
      <ellipse cx="60" cy="56" rx="20" ry="9" fill={EAR_IN} opacity="0.45" />

      {/* ── Cheek tufts ── */}
      <ellipse cx="8"   cy="74" rx="18" ry="13" fill={FUR} stroke={OL} strokeWidth="1.5" />
      <ellipse cx="112" cy="74" rx="18" ry="13" fill={FUR} stroke={OL} strokeWidth="1.5" />

      {/* ── Raccoon mask ── */}
      <path d={raccoonMask} fill={PATCH} />

      {/* ── Neural circuit traces on forehead ── */}
      {/* Left trace: cheek-side → elbow → center */}
      <path d={`M27,57 L31,53 L46,53 L55,47`}
            stroke={cc} strokeWidth="1.2" fill="none" opacity={co}
            strokeLinecap="round" strokeLinejoin="round" />
      {/* Right trace: mirror */}
      <path d={`M93,57 L89,53 L74,53 L65,47`}
            stroke={cc} strokeWidth="1.2" fill="none" opacity={co}
            strokeLinecap="round" strokeLinejoin="round" />
      {/* Elbow nodes */}
      <circle cx="31" cy="53" r="1.8" fill={cc} opacity={co} />
      <circle cx="89" cy="53" r="1.8" fill={cc} opacity={co} />
      {/* Central brain node */}
      <circle cx="60" cy="46" r="3.2" fill={cc} opacity={co} />
      <circle cx="60" cy="46" r="1.6" fill={WHITE} opacity={co} />

      {/* ── Snout tip ── */}
      <ellipse cx="60" cy="77" rx="10" ry="8" fill={EAR_IN} opacity="0.35" />

      {/* ── Nose ── */}
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

      {/* ── Eyes ── */}
      {isProud && (
        <>
          {/* Happy crescents */}
          <path d="M33,61 Q42,53 51,61" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
          <path d="M69,61 Q78,53 87,61" stroke={OL} fill="none"
                strokeWidth="3" strokeLinecap="round" />
          {/* AI sparkle glints above crescents */}
          <circle cx="39" cy="57" r="2.2" fill={AI_GREEN} opacity="0.9" />
          <circle cx="41" cy="55" r="1"   fill={WHITE}    opacity="0.9" />
          <circle cx="75" cy="57" r="2.2" fill={AI_GREEN} opacity="0.9" />
          <circle cx="77" cy="55" r="1"   fill={WHITE}    opacity="0.9" />
        </>
      )}
      {isFocused && (
        <>
          {/* Left — targeting reticle */}
          <circle cx="42" cy="61" r="9"   fill={WHITE} />
          <circle cx="42" cy="61" r="6.5" fill="none" stroke={AI_VIOLET} strokeWidth="0.9" opacity="0.5" />
          <circle cx="45" cy="62" r="4.5" fill={AI_VIOLET} />
          <circle cx="47" cy="59" r="1.8" fill={WHITE} />
          {/* Crosshair ticks */}
          <line x1="33" y1="61" x2="36" y2="61" stroke={AI_VIOLET} strokeWidth="1" opacity="0.6" />
          <line x1="48" y1="61" x2="51" y2="61" stroke={AI_VIOLET} strokeWidth="1" opacity="0.6" />
          <line x1="42" y1="52" x2="42" y2="55" stroke={AI_VIOLET} strokeWidth="1" opacity="0.6" />

          {/* Right — scan beam eye */}
          <ellipse cx="78" cy="62" rx="9" ry="6" fill={WHITE} />
          <circle  cx="80" cy="62" r="3.8" fill={AI_INDIGO} />
          <circle  cx="78" cy="60" r="1.2" fill={WHITE} opacity="0.8" />
          {/* Horizontal cyan scan line */}
          <line x1="69" y1="62" x2="87" y2="62"
                stroke={AI_CYAN} strokeWidth="1.2" className="ai-scan" />
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

      {/* ── Mouth ── */}
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

      {/* ── Cheek glow — AI green instead of pink blush (proud) ── */}
      {isProud && (
        <>
          <ellipse cx="10"  cy="76" rx="10" ry="7"   fill={AI_GREEN} opacity="0.28" />
          <ellipse cx="10"  cy="76" rx="5"  ry="3.5" fill={AI_GREEN} opacity="0.48" />
          <ellipse cx="110" cy="76" rx="10" ry="7"   fill={AI_GREEN} opacity="0.28" />
          <ellipse cx="110" cy="76" rx="5"  ry="3.5" fill={AI_GREEN} opacity="0.48" />
        </>
      )}

      {/* ── Data pulse (focused — violet teardrop, replaces sweat bead) ── */}
      {isFocused && (
        <>
          <ellipse cx="96" cy="46" rx="4" ry="6" fill={AI_VIOLET}
                   opacity="0.85" className="step-sweat-pulse" />
          <path d="M94,42 Q96,38 98,42" fill={AI_VIOLET} opacity="0.85" />
        </>
      )}

      {/* ── Loading dots (sleepy — replaces floating "z") ── */}
      {isSleepy && (
        <>
          <circle cx="88"  cy="36" r="2.8" fill={AI_SLATE} className="ai-dot-1" />
          <circle cx="97"  cy="36" r="2.8" fill={AI_SLATE} className="ai-dot-2" />
          <circle cx="106" cy="36" r="2.8" fill={AI_SLATE} className="ai-dot-3" />
        </>
      )}
    </svg>
  )
}
