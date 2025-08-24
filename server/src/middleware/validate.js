export function validate(rules) {
  return (req, res, next) => {
    for(const rule of rules) {
      const msg = rule(req)
      if(msg) return res.status(400).json({ error: msg })
    }
    next()
  }
}
