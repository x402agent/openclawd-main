export const PUBLIC_PATHS = new Set([
  '/',
  '/launch',
  '/hub',
  '/mobile',
  '/auth/callback',
  '/pair',
  '/skills',
  '/souls',
  '/mining',
  '/strategy',
  '/privacy',
  '/terms',
  '/copyright',
  '/license',
  '/scanner',
  '/terminal',
  '/chess',
  '/godmode',
  '/early-access',
])

const PUBLIC_PREFIXES = [
  '/skills/',
  '/souls/',
  '/agents/',
  '/chart/',
]

export function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
