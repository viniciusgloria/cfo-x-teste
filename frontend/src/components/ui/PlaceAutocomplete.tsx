import React, { useEffect, useRef, useState } from 'react';
import { Input } from './Input';

interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

interface Props {
  value: string;
  /** chamado apenas quando o usuário selecionar uma sugestão ou ao perder o foco (blur) */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (place: PlaceSuggestion) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  inputClassName?: string;
}

export function PlaceAutocomplete({ value, onChange, onSelect, placeholder, leftIcon, inputClassName }: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const fetchRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [inputValue, setInputValue] = useState<string>(value || '');

  useEffect(() => {
    // close on outside click
    const handler = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // keep internal inputValue in sync when parent value changes
  useEffect(() => {
    if (value !== inputValue) setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (fetchRef.current) fetchRef.current.abort();
      const controller = new AbortController();
      fetchRef.current = controller;
      const q = encodeURIComponent(inputValue.trim());
      // limitar resultados ao Brasil com countrycodes=br
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=pt-BR&countrycodes=br&q=${q}`;
      fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'CFO-Hub/1.0 (https://github.com/viniciusgloria/cfo-hub)', Referer: window.location.origin } as any })
        .then((res) => {
          if (!res.ok) throw new Error('Nominatim error');
          return res.json();
        })
        .then((json) => {
          setSuggestions((json || []).map((p: any) => ({
            place_id: p.place_id,
            display_name: p.display_name,
            lat: p.lat,
            lon: p.lon,
            type: p.type,
            class: p.class,
          })));
          setOpen(true);
          setHighlight(-1);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('PlaceAutocomplete error', err);
          setSuggestions([]);
          setOpen(false);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (fetchRef.current) fetchRef.current.abort();
    };
  }, [inputValue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlight >= 0 && highlight < suggestions.length) {
          handleSelect(suggestions[highlight]);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, suggestions, highlight]);

  const handleSelect = (s: PlaceSuggestion) => {
    // set the input value to display_name and close
    setInputValue(s.display_name);
    // notify parent with synthetic event
    const fakeEvent = { target: { value: s.display_name } } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(fakeEvent);
    setOpen(false);
    setSuggestions([]);
    setHighlight(-1);
    onSelect?.(s);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        placeholder={placeholder}
        leftIcon={leftIcon}
        className={inputClassName}
        value={inputValue}
        onChange={(e) => {
          const v = (e.target as HTMLInputElement).value;
          setInputValue(v);
          // não propagamos onChange a cada teclado para evitar re-renders do pai
          setOpen(true);
        }}
        onBlur={() => {
          // ao perder foco, se não houver seleção, propagar valor final ao pai
          setTimeout(() => {
            // se o foco não está dentro do container (ou seja, usuário saiu)
            if (!containerRef.current) return;
            const active = document.activeElement;
            if (!containerRef.current.contains(active)) {
              onChange?.({ target: { value: inputValue } } as unknown as React.ChangeEvent<HTMLInputElement>);
              setOpen(false);
            }
          }, 150);
        }}
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded shadow-lg max-h-56 overflow-auto">
          {suggestions.map((s, idx) => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setHighlight(idx)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${highlight === idx ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
            >
              <div className="truncate text-gray-800 dark:text-slate-100">{s.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceAutocomplete;
