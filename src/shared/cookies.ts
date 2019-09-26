// Set default cookie exp
const {
  env: {
    JWT_COOKIE_PATH,
    HTTP_ONLY_COOKIE,
    SIGNED_COOKIE,
    COOKIE_DOMAIN,
    SECURE_COOKIE,
    jwtCookieExp: JWT_COOKIE_EXP,
  },
} = process

if (
  JWT_COOKIE_PATH === undefined ||
  HTTP_ONLY_COOKIE === undefined ||
  SIGNED_COOKIE === undefined ||
  COOKIE_DOMAIN === undefined ||
  SECURE_COOKIE === undefined
) {
  throw new Error('Env is missing required cookie attributes')
}

export const jwtCookieExp = JWT_COOKIE_EXP || 3

// Admin Cookie Properties
export const jwtCookieProps = Object.freeze({
  key: 'JwtCookieKey',
  options: {
    path: JWT_COOKIE_PATH,
    httpOnly: HTTP_ONLY_COOKIE === 'true',
    signed: SIGNED_COOKIE === 'true',
    maxAge: 1000 * 60 * 60 * 24 * Number(jwtCookieExp),
    domain: COOKIE_DOMAIN,
    secure: SECURE_COOKIE === 'true',
  },
})
