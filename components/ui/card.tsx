/*
 * PBC Quote Calculator — 카드/섹션 라벨 프리미티브
 * Claude Design handoff(components.jsx)의 Card / SectionLabel 이식.
 */
import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  pad = true,
}: {
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return <section className={`pbc-card ${pad ? 'pbc-card--pad' : ''} ${className}`}>{children}</section>
}

export function SectionLabel({
  icon,
  children,
  aside,
}: {
  icon?: ReactNode
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="pbc-seclabel">
      <span className="pbc-seclabel__title">
        {icon ? <span className="pbc-seclabel__icon">{icon}</span> : null}
        {children}
      </span>
      {aside ? <span className="pbc-seclabel__aside">{aside}</span> : null}
    </div>
  )
}
