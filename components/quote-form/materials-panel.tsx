import Decimal from 'decimal.js'
import { useMemo, useState } from 'react'
import { MaterialRow } from './material-row'
import { PaintSearch } from './paint-search'
import type { MaterialItem } from './types'
import type { AreaRecord, AreaScope } from '@/lib/areas/types'

interface MaterialsPanelProps {
  materials: MaterialItem[]
  areas: AreaRecord[]
  onAdd: (item: MaterialItem) => void
  onChange: (item: MaterialItem) => void
  onRemove: (id: string) => void
}

function lineTotal(price: string, quantity: string): Decimal {
  return new Decimal(price || 0).mul(new Decimal(quantity || 0))
}

function getInitialAreaScope(materials: MaterialItem[], areas: AreaRecord[]): AreaScope {
  const selectedScope = materials.find((item) => item.areaScope)?.areaScope
  if (selectedScope) return selectedScope
  return areas.some((area) => area.scope === 'interior') ? 'interior' : 'exterior'
}

export function MaterialsPanel({ materials, areas, onAdd, onChange, onRemove }: MaterialsPanelProps) {
  const [areaScope, setAreaScope] = useState<AreaScope>(() => getInitialAreaScope(materials, areas))
  const materialTotal = materials.reduce((total, item) => total.add(lineTotal(item.marketPrice, item.quantity)), new Decimal(0))
  const filteredAreas = useMemo(() => areas.filter((area) => area.scope === areaScope), [areaScope, areas])

  function changeAreaScope(nextScope: AreaScope) {
    setAreaScope(nextScope)
    for (const item of materials) {
      if (item.areaScope && item.areaScope !== nextScope) {
        onChange({
          ...item,
          areaId: undefined,
          areaName: undefined,
          areaScope: undefined,
        })
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase text-slate-400">Materials</h2>
        {areas.length > 0 ? (
          <div className="rounded-lg bg-slate-100 p-1">
            {(['interior', 'exterior'] as AreaScope[]).map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => changeAreaScope(scope)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${areaScope === scope ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}
                aria-pressed={areaScope === scope}
              >
                {scope === 'interior' ? 'Interior' : 'Exterior'}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <PaintSearch onAdd={onAdd} />
      {areas.length > 0 && filteredAreas.length === 0 ? (
        <p className="rounded-lg border border-amber-100 bg-[var(--warning-soft)] px-3 py-2 text-sm text-amber-800">
          No {areaScope} areas yet. Add them in Settings.
        </p>
      ) : null}
      {materials.length === 0 ? (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500">No materials yet. Search paint or add a custom material.</p>
      ) : (
        <div className="space-y-2">
          {materials.map((item) => (
            <MaterialRow key={item.id} item={item} areas={filteredAreas} onChange={onChange} onRemove={() => onRemove(item.id)} />
          ))}
        </div>
      )}
      <div className="border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Material total</span>
          <span className="font-mono font-semibold text-slate-950">${materialTotal.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
