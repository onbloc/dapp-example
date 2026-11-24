import { useId, useState } from 'react';

import type { FieldDef, FormValues } from '@/core/action';

import { Button } from './Button';

interface FieldProps {
  field: FieldDef;
  value: string;
  values: FormValues;
  onChange: (value: string) => void;
  onError: (error: unknown) => void;
}

export const Field = ({ field, value, values, onChange, onError }: FieldProps) => {
  const id = useId();
  const [resolving, setResolving] = useState(false);
  const className = `input ${field.mono ? 'mono' : ''}`;

  const resolve = async () => {
    if (!field.resolver) {
      return;
    }
    setResolving(true);
    try {
      onChange(await field.resolver.resolve(values));
    } catch (error) {
      onError(error);
    } finally {
      setResolving(false);
    }
  };

  const control = (() => {
    switch (field.type) {
      case 'segmented':
        return (
          <div className="segmented" role="radiogroup" aria-labelledby={`${id}-label`}>
            {field.options?.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value === option.value}
                className={value === option.value ? 'active' : ''}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        );
      case 'select':
        return (
          <select id={id} className={className} value={value} onChange={event => onChange(event.target.value)}>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return <textarea id={id} className={className} value={value} placeholder={field.placeholder} rows={8} spellCheck={false} onChange={event => onChange(event.target.value)} />;
      default:
        return (
          <div className="input-group">
            <input id={id} className={className} value={value} placeholder={field.placeholder} spellCheck={false} autoComplete="off" onChange={event => onChange(event.target.value)} />
            {field.resolver && (
              <Button size="sm" variant="ghost" loading={resolving} onClick={resolve}>
                {field.resolver.label}
              </Button>
            )}
          </div>
        );
    }
  })();

  return (
    <div className={`field ${field.type === 'textarea' ? 'field-block' : ''}`}>
      <label id={`${id}-label`} htmlFor={field.type === 'segmented' ? undefined : id}>
        {field.label}
      </label>
      {control}
      {field.hint && <small className="hint">{field.hint}</small>}
    </div>
  );
};
