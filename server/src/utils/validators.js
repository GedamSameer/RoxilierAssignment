const NAME_MIN = 20
const NAME_MAX = 60

export function validateName(field='name') {
  return (req) => {
    const v = (req.body?.[field] ?? '').trim()
    if(v.length < NAME_MIN || v.length > NAME_MAX) return `Name must be ${NAME_MIN}-${NAME_MAX} characters.`
    return null
  }
}

export function validateAddress(field='address') {
  return (req) => {
    const v = (req.body?.[field] ?? '')
    if(v.length > 400) return 'Address max 400 characters.'
    return null
  }
}

export function validateEmail(field='email') {
  return (req) => {
    const v = (req.body?.[field] ?? '').trim()
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!re.test(v)) return 'Invalid email.'
    return null
  }
}

export function validatePassword(field='password') {
  return (req) => {
    const v = (req.body?.[field] ?? '')
    if(v.length < 8 || v.length > 16) return 'Password must be 8-16 characters.'
    if(!/[A-Z]/.test(v) || !/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(v)) return 'Password must include at least one uppercase letter and one special character.'
    return null
  }
}

export function validateRating(field='rating') {
  return (req) => {
    const n = Number(req.body?.[field])
    if(!Number.isInteger(n) || n < 1 || n > 5) return 'Rating must be integer 1..5'
    return null
  }
}
