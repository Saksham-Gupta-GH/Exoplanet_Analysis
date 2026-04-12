import { Info } from 'lucide-react';
import { FEATURE_META } from '../lib/analysis';
import { EXAMPLE_VALUES, NEGATIVE_ALLOWED_FIELDS } from '../lib/appData';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function InputField({
  fieldKey,
  value,
  onChange,
  placeholder,
  required = false,
  tooltip,
}) {
  const meta = FEATURE_META[fieldKey] ?? { label: fieldKey, unit: '' };
  const allowNegative = NEGATIVE_ALLOWED_FIELDS.has(fieldKey);

  const blockNegativeText = (text) => !allowNegative && text.trim().startsWith('-');

  const handleChange = (event) => {
    const nextValue = event.target.value;
    if (blockNegativeText(nextValue)) return;
    onChange(nextValue);
  };

  return (
    <label className="group block space-y-1.5">
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-google-text">{meta.label}</span>
        <span className="flex items-center gap-1.5">
          {meta.unit ? (
            <span className="text-xs text-google-text-tertiary">{meta.unit}</span>
          ) : null}
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-google-text-tertiary transition hover:text-google-text-secondary" aria-label={`${meta.label} help`}>
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </span>
      </span>
      <Input
        type="number"
        inputMode="decimal"
        step="any"
        min={allowNegative ? undefined : 0}
        required={required}
        value={value}
        placeholder={placeholder ?? EXAMPLE_VALUES[fieldKey] ?? 'Optional'}
        onChange={handleChange}
        onBeforeInput={(event) => {
          if (!allowNegative && event.data === '-') event.preventDefault();
        }}
        onPaste={(event) => {
          const pasted = event.clipboardData?.getData('text') ?? '';
          if (blockNegativeText(pasted)) event.preventDefault();
        }}
        onKeyDown={(event) => {
          if (!allowNegative && event.key === '-') event.preventDefault();
        }}
        className="font-mono"
      />
    </label>
  );
}
