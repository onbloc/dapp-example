import { useState } from 'react';

import type { ActionTemplate, FormValues } from '@/core/action';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { CloseIcon, TemplateIcon } from '@/ui/icons';

interface TemplatePanelProps {
  templates: ActionTemplate[];
  onApply: (values: FormValues) => void;
  onError: (error: unknown) => void;
}

export const TemplatePanel = ({ templates, onApply, onError }: TemplatePanelProps) => {
  const [active, setActive] = useState<ActionTemplate | null>(null);
  const [input, setInput] = useState<FormValues>({});
  const [applying, setApplying] = useState(false);

  const open = (template: ActionTemplate) => {
    setActive(current => (current?.id === template.id ? null : template));
    setInput(template.defaults);
  };

  const apply = async () => {
    if (!active) {
      return;
    }
    setApplying(true);
    try {
      onApply(await active.apply(input));
      setActive(null);
    } catch (error) {
      onError(error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="templates">
      <div className="template-bar">
        <span>Templates</span>
        {templates.map(template => (
          <Button key={template.id} size="sm" variant={active?.id === template.id ? 'primary' : 'secondary'} icon={<TemplateIcon />} onClick={() => open(template)}>
            {template.label}
          </Button>
        ))}
      </div>

      {active && (
        <div className="template-panel">
          <div className="template-panel-header">
            <p>{active.description}</p>
            <Button size="sm" variant="ghost" icon={<CloseIcon />} onClick={() => setActive(null)} aria-label="Close template" />
          </div>
          <div className="fields">
            {active.fields.map(field => (
              <Field
                key={field.name}
                field={field}
                value={input[field.name] ?? ''}
                values={input}
                onChange={value => setInput(prev => ({ ...prev, [field.name]: value }))}
                onError={onError}
              />
            ))}
          </div>
          <Button variant="primary" loading={applying} onClick={apply}>
            Apply template
          </Button>
        </div>
      )}
    </div>
  );
};
