export function saveAuth({ token, user }) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
export function getToken() { return localStorage.getItem('token') }
export function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
