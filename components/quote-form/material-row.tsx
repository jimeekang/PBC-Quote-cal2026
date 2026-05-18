import type { MaterialItem } from './types'
import type { AreaRecord } from '@/lib/areas/types'
import { DecimalInput } from './decimal-input'

interface MaterialRowProps {
  item: MaterialItem
  areas: AreaRecord[]
  onChange: (item: MaterialItem) => void
  onRemove: () => void
}

export function MaterialRow({ item, areas, onChange, onRemove }: MaterialRowProps) {
  function changeArea(areaId: string) {
    const area = areas.find((candidate) => candidate.id === areaId)
    onChange({
      ...item,
      areaId: area?.id,
      areaName: area?.name,
      areaScope: area?.scope,
    })
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <input
          type="text"
          value={item.name}
          onChange={(event) => onChange({ ...item, name: event.target.value })}
          aria-label="Material name"
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-slate-950 hover:border-slate-200 hover:bg-white focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={onRemove}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label={`Remove ${item.name}`}
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M7.25 8.25v5.5M10 8.25v5.5M12.75 8.25v5.5M4.5 5.5h11M8.25 3.5h3.5M6 5.5l.5 10.25c.04.7.62 1.25 1.32 1.25h4.36c.7 0 1.28-.55 1.32-1.25L14 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-[4.25rem_5.25rem_minmax(8rem,1fr)_5.5rem_5.5rem] md:items-end">
        <DecimalInput
          label="Qty"
          value={item.quantity}
          onValueChange={(value) => onChange({ ...item, quantity: value })}
          labelClassName="space-y-1 text-xs font-bold text-slate-500"
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
          warningClassName="block text-[11px] font-normal text-amber-600"
        />
        <DecimalInput
          label="RRP"
          value={item.marketPrice}
          onValueChange={(value) => onChange({ ...item, marketPrice: value, actualPrice: value })}
          labelClassName="space-y-1 text-xs font-bold text-slate-500"
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold"
          warningClassName="block text-[11px] font-normal text-amber-600"
        />
        <label className="space-y-1 text-xs font-bold text-slate-500">
          Area
          <select
            value={item.areaId ?? ''}
            onChange={(event) => changeArea(event.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
            title={item.areaName ?? (areas.length === 0 ? 'Add in Settings' : 'Select area')}
          >
            <option value="">{areas.length === 0 ? 'Add in Settings' : 'Select area'}</option>
            {areas.map((area) => (
              <option
                key={area.id}
                value={area.id}
                title={`${area.scope === 'interior' ? 'Interior' : 'Exterior'} - ${area.name}`}
              >
                {area.scope === 'interior' ? 'Interior' : 'Exterior'} - {area.name}
              </option>
            ))}
          </select>
        </label>
        <DecimalInput
          label="Working Days"
          value={item.workingDays}
          onValueChange={(value) => onChange({ ...item, workingDays: value })}
          labelClassName="space-y-1 text-xs font-bold text-slate-500"
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
          warningClassName="block text-[11px] font-normal text-amber-600"
        />
        <DecimalInput
          label="Labour / Day"
          value={item.labourPerDay}
          onValueChange={(value) => onChange({ ...item, labourPerDay: value })}
          labelClassName="space-y-1 text-xs font-bold text-slate-500"
          inputClassName="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
          warningClassName="block text-[11px] font-normal text-amber-600"
        />
      </div>
    </div>
  )
}
