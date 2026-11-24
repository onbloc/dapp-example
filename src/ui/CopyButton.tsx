import { useState } from 'react';

import { Button } from './Button';
import { CheckIcon, CopyIcon } from './icons';

export const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="ghost" size="sm" icon={copied ? <CheckIcon /> : <CopyIcon />} onClick={copy} aria-label={label ?? 'Copy'}>
      {label}
    </Button>
  );
};
