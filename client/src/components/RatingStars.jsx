import React from 'react'

export default function RatingStars({ value=0, onChange }) {
  // simple select 1..5 to keep it minimal
  return (
    <select value={value || ''} onChange={e=>onChange(Number(e.target.value))}>
      <option value="">Rate…</option>
      {[1,2,3,4,5].map(n => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  )
}
