// Full Tailwind class strings must be written out in full so the CSS scanner
// includes them. Never build them dynamically (e.g. `bg-${color}-500`).
export const MEMBER_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-cyan-600',
  'bg-pink-500',
  'bg-orange-500',
]

// Derive initials from a name: first character of each word, uppercased, max 2.
// "Father"     → "F"
// "Daughter 1" → "D1"
// "Mary Jane"  → "MJ"
export function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Fallback: derive a stable color from the first character code of the name
// so members without a stored color always get the same color on every render.
function fallbackColor(name) {
  return MEMBER_COLORS[name.charCodeAt(0) % MEMBER_COLORS.length]
}

const sizes = {
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-12 h-12 text-lg',
}

function MemberAvatar({ member, size = 'md' }) {
  const initials = getInitials(member.name)
  const color    = member.color || fallbackColor(member.name)

  return (
    <span className={`${sizes[size]} ${color} rounded-full text-white flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </span>
  )
}

export default MemberAvatar
