import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Dropdown({
  value,
  options,
  onChange,
  icon: Icon,
  placeholder = 'Selecione',
  variant = 'field',
  className = '',
  disabled = false,
  id
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function aoClicarFora(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function aoPressionarTecla(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoPressionarTecla)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoPressionarTecla)
    }
  }, [])

  const selecionado = options.find((o) => String(o.value) === String(value))

  function selecionar(novoValor) {
    setOpen(false)
    if (String(novoValor) !== String(value)) {
      onChange(novoValor)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`dropdown dropdown--${variant} ${open ? 'dropdown-open' : ''} ${className}`}
    >
      <button
        type="button"
        id={id}
        className="dropdown-trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        {Icon && <Icon size={13} className="dropdown-trigger-icon" />}
        <span className="dropdown-trigger-label">
          {selecionado ? selecionado.label : placeholder}
        </span>
        <ChevronDown size={14} className="dropdown-chevron" />
      </button>

      {open && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((o) => {
            const OpcaoIcon = o.icon
            const ativo = String(o.value) === String(value)
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={ativo}
                className={`dropdown-option ${ativo ? 'dropdown-option-active' : ''}`}
                onClick={() => selecionar(o.value)}
              >
                {OpcaoIcon && <OpcaoIcon size={13} />}
                {o.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
