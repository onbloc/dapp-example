import type { ActionGroup } from '@/core/action';

import { ActionCard } from './ActionCard';

export const ActionGroups = ({ groups }: { groups: ActionGroup[] }) => (
  <>
    {groups.map(group => (
      <section key={group.id} id={`group-${group.id}`} className="group">
        <div className="group-heading">
          <h2>{group.title}</h2>
          {group.description && <p>{group.description}</p>}
        </div>
        <div className="grid">
          {group.actions.map(action => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </section>
    ))}
  </>
);

export const GroupNav = ({ groups }: { groups: ActionGroup[] }) => (
  <nav className="group-nav" aria-label="Sections">
    {groups.map(group => (
      <a key={group.id} href={`#group-${group.id}`} onClick={event => {
        event.preventDefault();
        document.getElementById(`group-${group.id}`)?.scrollIntoView({ behavior: 'smooth' });
      }}>
        {group.title}
        <span>{group.actions.length}</span>
      </a>
    ))}
  </nav>
);
