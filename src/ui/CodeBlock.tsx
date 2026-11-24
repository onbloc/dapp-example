import { CopyButton } from './CopyButton';

export const CodeBlock = ({ title, code, tone }: { title: string; code: string; tone?: 'success' | 'failure' | 'pending' }) => (
  <div className={`code-block ${tone ? `code-${tone}` : ''}`}>
    <div className="code-header">
      <span>{title}</span>
      <CopyButton text={code} />
    </div>
    <pre>
      <code>{code}</code>
    </pre>
  </div>
);
