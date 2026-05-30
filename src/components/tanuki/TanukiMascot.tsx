import './animations.css'

export type TanukiMood =
  | 'excited'     // arms wide, sparkle eyes, big smile, bouncing — popup success
  | 'sad'         // teary eyes, frown, swaying — popup error
  | 'happy'       // alias → excited
  | 'sleeping'    // head drooped, ZZZs, gentle breathing
  | 'embarrassed' // alias → sad
  | 'stamping'    // holds 承認 hanko
  | 'idle'        // neutral, gentle blink
  | 'searching'   // paw to forehead, scanning, paper stack

const SIZE_MAP = { sm: 48, md: 80, lg: 140 } as const

type Props = {
  mood: TanukiMood
  size?: keyof typeof SIZE_MAP
  className?: string
}

const FUR      = '#C17F3E'
const FUR_D    = '#8B4513'
const PATCH    = '#3D1C02'
const MUZZLE   = '#E8C99A'
const NOSE     = '#1A0A00'
const WHITE    = '#FFFFFF'
const EAR_IN   = '#D4956A'
const LEAF     = '#5BAD52'
const LEAF_D   = '#3D8A35'
const OL       = '#2C1810'
const BLUSH    = '#F4A0A0'
const BLUE_CH  = '#B0C4DE'

export function TanukiMascot({ mood, size = 'md', className }: Props) {
  const px = SIZE_MAP[size]
  const py = Math.round(px * 260 / 200)

  const isExcited   = mood === 'excited' || mood === 'happy'
  const isSad       = mood === 'sad'     || mood === 'embarrassed'
  const isSleeping  = mood === 'sleeping'
  const isStamping  = mood === 'stamping'
  const isIdle      = mood === 'idle'
  const isSearching = mood === 'searching'

  const bodyAnim =
    isExcited   ? 'tanuki-excited-bounce'
    : isSleeping  ? 'tanuki-breathe'
    : isSad       ? 'tanuki-sway'
    : ''

  const headTransform =
    isSleeping ? 'translate(4,8) rotate(12 100 74)'
    : isSad    ? 'translate(0,3) rotate(6 100 74)'
    : ''

  const leafRotate =
    isSleeping  ? 'rotate(-46 100 12)'
    : isSad     ? 'rotate(-24 100 12)'
    : isSearching ? 'rotate(-18 100 12)'
    : 'rotate(-8 100 12)'

  // One connected raccoon mask — shape shifts per mood
  const raccoonMask =
    isExcited   ? 'M50,69 Q62,57 80,60 Q90,57 100,59 Q110,57 120,60 Q138,57 150,69 Q148,83 134,87 Q120,90 110,83 Q105,79 100,80 Q95,79 90,83 Q80,90 66,87 Q52,83 50,69 Z'
    : isSad     ? 'M50,78 Q60,69 78,72 Q90,68 100,70 Q110,68 122,72 Q140,69 150,78 Q149,91 135,94 Q120,97 110,90 Q105,86 100,87 Q95,86 90,90 Q80,97 65,94 Q51,91 50,78 Z'
    : isSleeping? 'M52,76 Q62,68 80,71 Q90,68 100,70 Q110,68 120,71 Q138,68 148,76 Q146,86 132,88 Q118,90 110,84 Q105,81 100,82 Q95,81 90,84 Q82,90 68,88 Q54,86 52,76 Z'
    : isSearching?'M50,72 Q62,60 80,63 Q90,60 100,62 Q110,61 121,65 Q139,63 150,74 Q148,87 134,91 Q120,94 110,87 Q105,83 100,84 Q95,83 90,87 Q80,94 66,91 Q52,87 50,72 Z'
    :             'M50,73 Q62,61 80,64 Q90,61 100,63 Q110,61 120,64 Q138,61 150,73 Q148,87 134,91 Q120,94 110,87 Q105,83 100,84 Q95,83 90,87 Q80,94 66,91 Q52,87 50,73 Z'

  return (
    <svg
      width={px}
      height={py}
      viewBox="0 0 200 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Tail (behind body) ── */}
      {isExcited ? (
        <ellipse cx="154" cy="162" rx="16" ry="28" fill={MUZZLE} stroke={OL}
                 strokeWidth="2.5" transform="rotate(-30 154 162)" />
      ) : isSad ? (
        <ellipse cx="152" cy="222" rx="16" ry="28" fill={MUZZLE} stroke={OL}
                 strokeWidth="2.5" transform="rotate(34 152 222)" />
      ) : (
        <ellipse cx="152" cy="210" rx="16" ry="28" fill={MUZZLE} stroke={OL}
                 strokeWidth="2.5" transform="rotate(20 152 210)" />
      )}
      <path d="M143,196 Q156,207 150,223" stroke={FUR_D} strokeWidth="4"
            fill="none" opacity="0.45" />

      {/* ── Head group ── */}
      <g transform={headTransform || undefined}>

        {/* Leaf */}
        <g transform={leafRotate}>
          <ellipse cx="100" cy="12" rx="10" ry="16" fill={LEAF}
                   stroke={LEAF_D} strokeWidth="2" />
          <line x1="100" y1="15" x2="100" y2="26"
                stroke={LEAF_D} strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Ears — pointed rotated ellipses, behind head */}
        <ellipse cx="54"  cy="32" rx="16" ry="20" fill={FUR} stroke={OL}
                 strokeWidth="2.5" transform="rotate(-15 54 32)" />
        <ellipse cx="146" cy="32" rx="16" ry="20" fill={FUR} stroke={OL}
                 strokeWidth="2.5" transform="rotate(15 146 32)" />
        <ellipse cx="54"  cy="34" rx="9"  ry="13" fill={EAR_IN}
                 transform="rotate(-15 54 34)" />
        <ellipse cx="146" cy="34" rx="9"  ry="13" fill={EAR_IN}
                 transform="rotate(15 146 34)" />

        {/* Head — wider than tall */}
        <ellipse cx="100" cy="74" rx="54" ry="50" fill={FUR} stroke={OL} strokeWidth="3.5" />

        {/* Muzzle — elongated snout, drawn early so mask overlaps its top */}
        <ellipse cx="100" cy="96" rx="24" ry="20" fill={MUZZLE}
                 stroke={OL} strokeWidth="2" />

        {/* Pale forehead stripe — tanuki signature above mask */}
        <ellipse cx="100" cy="63" rx="26" ry="12" fill={EAR_IN} opacity="0.45" />

        {/* Cheek tufts — fluffy fur beyond head boundary */}
        <ellipse cx="38"  cy="84" rx="16" ry="12" fill={FUR} stroke={OL} strokeWidth="1.5" />
        <ellipse cx="162" cy="84" rx="16" ry="12" fill={FUR} stroke={OL} strokeWidth="1.5" />

        {/* Connected raccoon mask — THE critical tanuki feature */}
        <path d={raccoonMask} fill={PATCH} />

        {/* Snout tip — paler patch at nose bridge */}
        <ellipse cx="100" cy="88" rx="12" ry="10" fill={EAR_IN} opacity="0.35" />

        {/* Nose — wide and flat */}
        <path d="M93,86 Q100,82 107,86 Q103,94 100,95 Q97,94 93,86 Z" fill={NOSE} />
        <ellipse cx="96" cy="86" rx="3" ry="2" fill={WHITE} opacity="0.5" />

        {/* ── Eyebrows ── */}
        {isSad && (
          <>
            <path d="M63,59 Q79,63 94,59"  stroke={OL} fill="none"
                  strokeWidth="3" strokeLinecap="round" />
            <path d="M106,59 Q121,63 137,59" stroke={OL} fill="none"
                  strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {isSearching && (
          <>
            <path d="M70,59 Q79,55 89,59"   stroke={OL} fill="none"
                  strokeWidth="3" strokeLinecap="round" />
            <path d="M111,57 Q121,52 131,57" stroke={OL} fill="none"
                  strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* ── Eyes — inside the connected mask ── */}
        {isExcited && (
          <>
            <circle cx="79"  cy="70" r="12" fill={WHITE} />
            <circle cx="82"  cy="71" r="8"  fill={PATCH} />
            <circle cx="85"  cy="67" r="3"  fill={WHITE} />
            <circle cx="76"  cy="75" r="1.5" fill={WHITE} opacity="0.6" />
            <path d="M89,64 l1,-3 l1,3 l3,1 l-3,1 l-1,3 l-1,-3 l-3,-1 z"
                  fill={WHITE} opacity="0.9" />
            <circle cx="121" cy="70" r="12" fill={WHITE} />
            <circle cx="124" cy="71" r="8"  fill={PATCH} />
            <circle cx="127" cy="67" r="3"  fill={WHITE} />
            <circle cx="118" cy="75" r="1.5" fill={WHITE} opacity="0.6" />
          </>
        )}
        {isSad && (
          <>
            <circle cx="79"  cy="73" r="9"   fill={WHITE} />
            <circle cx="79"  cy="74" r="5.5" fill={PATCH} />
            <circle cx="81"  cy="71" r="2"   fill={WHITE} />
            <circle cx="76"  cy="78" r="1.5" fill={WHITE} opacity="0.6" />
            <circle cx="121" cy="73" r="9"   fill={WHITE} />
            <circle cx="121" cy="74" r="5.5" fill={PATCH} />
            <circle cx="123" cy="71" r="2"   fill={WHITE} />
            <circle cx="118" cy="78" r="1.5" fill={WHITE} opacity="0.6" />
            <ellipse cx="75"  cy="84" rx="3" ry="5" fill="#87CEEB" opacity="0.9" />
            <ellipse cx="117" cy="84" rx="3" ry="5" fill="#87CEEB" opacity="0.9" />
          </>
        )}
        {isSleeping && (
          <>
            <ellipse cx="79"  cy="73" rx="9" ry="4" fill={WHITE} />
            <ellipse cx="79"  cy="73" rx="9" ry="4" fill={PATCH} opacity="0.4" />
            <path d="M70,70 Q79,66 88,70" stroke={OL} fill={FUR} strokeWidth="5"
                  strokeLinecap="round" />
            <ellipse cx="121" cy="73" rx="9" ry="4" fill={WHITE} />
            <path d="M112,70 Q121,66 130,70" stroke={OL} fill={FUR} strokeWidth="5"
                  strokeLinecap="round" />
          </>
        )}
        {isSearching && (
          <>
            <circle cx="79"  cy="70" r="10" fill={WHITE} />
            <circle cx="82"  cy="71" r="6"  fill={PATCH} />
            <circle cx="84"  cy="68" r="2"  fill={WHITE} />
            <circle cx="76"  cy="74" r="1.5" fill={WHITE} opacity="0.6" />
            <ellipse cx="121" cy="71" rx="9" ry="6" fill={WHITE} />
            <circle  cx="123" cy="71" r="4"          fill={PATCH} />
            <circle  cx="120" cy="69" r="1.3" fill={WHITE} opacity="0.6" />
            <path d="M112,66 Q121,63 130,66" stroke={OL} fill="none" strokeWidth="3" />
          </>
        )}
        {(isStamping || isIdle) && (
          <g className={isIdle ? 'tanuki-blink' : ''}
             style={{ transformOrigin: '100px 71px' }}>
            <circle cx="79"  cy="70" r="10"  fill={WHITE} />
            <circle cx="81"  cy="71" r="6"   fill={PATCH} />
            <circle cx="83"  cy="68" r="2.5" fill={WHITE} />
            <circle cx="76"  cy="75" r="1.5" fill={WHITE} opacity="0.6" />
            <circle cx="121" cy="70" r="10"  fill={WHITE} />
            <circle cx="123" cy="71" r="6"   fill={PATCH} />
            <circle cx="125" cy="68" r="2.5" fill={WHITE} />
            <circle cx="118" cy="75" r="1.5" fill={WHITE} opacity="0.6" />
          </g>
        )}

        {/* ── Mouth — wider, on lower muzzle below mask ── */}
        {isExcited && (
          <>
            <path d="M80,101 Q100,116 120,101" stroke={OL} fill={MUZZLE} strokeWidth="2.5"
                  strokeLinecap="round" />
            <path d="M84,109 Q100,113 116,109" stroke={OL} fill="none"
                  strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </>
        )}
        {isSad && (
          <path d="M84,106 Q100,99 116,106" stroke={OL} fill="none"
                strokeWidth="2.5" strokeLinecap="round" />
        )}
        {isSleeping && (
          <ellipse cx="100" cy="102" rx="5" ry="6" fill={OL} opacity="0.7" />
        )}
        {isSearching && (
          <path d="M88,100 L112,100" stroke={OL} strokeWidth="2.5" strokeLinecap="round" />
        )}
        {(isStamping || isIdle) && (
          <>
            <path d="M86,102 Q100,113 114,102" stroke={OL} fill="none"
                  strokeWidth="2.5" strokeLinecap="round" />
            <path d="M88,110 Q100,114 112,110" stroke={OL} fill="none"
                  strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </>
        )}

        {/* ── Blush on cheek tufts ── */}
        {isExcited && (
          <>
            <ellipse cx="40"  cy="86" rx="11" ry="8" fill={BLUSH}   opacity="0.6" />
            <ellipse cx="160" cy="86" rx="11" ry="8" fill={BLUSH}   opacity="0.6" />
          </>
        )}
        {isSad && (
          <>
            <ellipse cx="40"  cy="86" rx="11" ry="8" fill={BLUE_CH} opacity="0.55" />
            <ellipse cx="160" cy="86" rx="11" ry="8" fill={BLUE_CH} opacity="0.55" />
          </>
        )}
        {(isIdle || isStamping) && (
          <>
            <ellipse cx="40"  cy="86" rx="9"  ry="6" fill={BLUSH}   opacity="0.22" />
            <ellipse cx="160" cy="86" rx="9"  ry="6" fill={BLUSH}   opacity="0.22" />
          </>
        )}
      </g>

      {/* ── Body group (animated) ── */}
      <g className={bodyAnim} style={{ transformOrigin: '100px 190px' }}>

        <ellipse cx="100" cy="183" rx="52" ry="58" fill={FUR}
                 stroke={OL} strokeWidth="3" />
        <ellipse cx="100" cy="191" rx="34" ry="40" fill={MUZZLE}
                 stroke={OL} strokeWidth="2" />
        <circle cx="100" cy="213" r="4" fill={OL} opacity="0.35" />

        {/* ── Arms ── */}
        {isExcited ? (
          <>
            <ellipse cx="54"  cy="170" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-55 54 170)" />
            <circle  cx="36"  cy="153" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <ellipse cx="146" cy="170" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(55 146 170)" />
            <circle  cx="164" cy="153" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
          </>
        ) : isStamping ? (
          <>
            <ellipse cx="58"  cy="190" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-28 58 190)" />
            <circle  cx="50"  cy="197" r="12"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <g className="tanuki-stamp-arm">
              <ellipse cx="148" cy="178" rx="13" ry="10" fill={FUR} stroke={OL}
                       strokeWidth="2.5" transform="rotate(-14 148 178)" />
              <circle  cx="154" cy="188" r="12"           fill={FUR} stroke={OL}
                       strokeWidth="2.5" />
              <rect x="144" y="194" width="28" height="14" rx="4"
                    fill="#DC2626" stroke={OL} strokeWidth="2" />
              <text x="158" y="205" textAnchor="middle" fontSize="10"
                    fill={WHITE} fontWeight="bold" fontFamily="serif">承認</text>
            </g>
          </>
        ) : isSleeping ? (
          <>
            <ellipse cx="72"  cy="208" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-10 72 208)" />
            <circle  cx="68"  cy="218" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <ellipse cx="128" cy="208" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(10 128 208)" />
            <circle  cx="132" cy="218" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
          </>
        ) : isSearching ? (
          <>
            <ellipse cx="52"  cy="164" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-56 52 164)" />
            <circle  cx="30"  cy="146" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <ellipse cx="148" cy="187" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(24 148 187)" />
            <circle  cx="160" cy="197" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <rect x="155" y="192" width="28" height="36" rx="3" fill={MUZZLE}
                  stroke="#CBD5E1" strokeWidth="1.5"
                  transform="rotate(-10 169 210)" />
            <rect x="159" y="188" width="28" height="36" rx="3" fill={WHITE}
                  stroke="#CBD5E1" strokeWidth="1.5"
                  transform="rotate(-4 173 206)" />
            <line x1="163" y1="196" x2="183" y2="196" stroke="#94A3B8"
                  strokeWidth="1.5" strokeLinecap="round"
                  transform="rotate(-4 173 206)" />
            <line x1="163" y1="202" x2="181" y2="202" stroke="#94A3B8"
                  strokeWidth="1.5" strokeLinecap="round"
                  transform="rotate(-4 173 206)" />
          </>
        ) : isSad ? (
          <>
            <ellipse cx="56"  cy="198" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(24 56 198)" />
            <circle  cx="47"  cy="210" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <ellipse cx="144" cy="198" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-24 144 198)" />
            <circle  cx="153" cy="210" r="13"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
          </>
        ) : (
          <>
            <ellipse cx="58"  cy="190" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(-28 58 190)" />
            <circle  cx="50"  cy="197" r="12"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
            <ellipse cx="142" cy="190" rx="13" ry="10" fill={FUR} stroke={OL}
                     strokeWidth="2.5" transform="rotate(28 142 190)" />
            <circle  cx="150" cy="197" r="12"           fill={FUR} stroke={OL}
                     strokeWidth="2.5" />
          </>
        )}

        <ellipse cx="82"  cy="232" rx="18" ry="14" fill={FUR}
                 stroke={OL} strokeWidth="2.5" />
        <ellipse cx="118" cy="232" rx="18" ry="14" fill={FUR}
                 stroke={OL} strokeWidth="2.5" />
      </g>

      {/* ── Sleeping ZZZs ── */}
      {isSleeping && (
        <>
          <text className="tanuki-zzz"  x="156" y="56" fontSize="16" fill="#6366F1"
                fontWeight="bold" fontFamily="sans-serif">z</text>
          <text className="tanuki-zzz2" x="170" y="36" fontSize="22" fill="#818CF8"
                fontWeight="bold" fontFamily="sans-serif">Z</text>
          <text className="tanuki-zzz3" x="184" y="14" fontSize="28" fill="#A5B4FC"
                fontWeight="bold" fontFamily="sans-serif">Z</text>
        </>
      )}

      {/* ── Excited ¥ + ★ sparkles ── */}
      {isExcited && (
        <>
          <text className="tanuki-sparkle" x="16"  y="86"
                fontSize="16" fill="#F59E0B" fontWeight="bold" fontFamily="sans-serif"
                style={{ animationDelay: '0s' }}>¥</text>
          <text className="tanuki-sparkle" x="176" y="70"
                fontSize="14" fill="#F59E0B" fontWeight="bold" fontFamily="sans-serif"
                style={{ animationDelay: '0.6s' }}>¥</text>
          <text className="tanuki-sparkle" x="26"  y="54"
                fontSize="11" fill="#FBBF24" fontWeight="bold" fontFamily="sans-serif"
                style={{ animationDelay: '1.2s' }}>¥</text>
          <text className="tanuki-sparkle" x="188" y="48"
                fontSize="13" fill="#FFD700" fontWeight="bold" fontFamily="sans-serif"
                style={{ animationDelay: '0.9s' }}>★</text>
          <text className="tanuki-sparkle" x="8"   y="50"
                fontSize="11" fill="#FFD700" fontWeight="bold" fontFamily="sans-serif"
                style={{ animationDelay: '1.5s' }}>★</text>
        </>
      )}

      {/* ── Sad sweat drop ── */}
      {isSad && (
        <g className="tanuki-sweat">
          <path d="M155,44 C152,52 147,56 150,63 C153,70 161,70 164,63
                   C167,56 162,52 155,44 Z"
                fill="#93C5FD" opacity="0.85" />
        </g>
      )}
    </svg>
  )
}
