import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { ActionGroups, GroupNav } from '@/features/actions/ActionGroups';
import { hasAdenaExtension, isMobileDevice } from '@/lib/platform';
import { Badge } from '@/ui/Badge';

import { WEB_ACTION_GROUPS } from './actions';

// The extension injects window.adena after load, so detection is retried briefly.
const useExtensionDetected = (): boolean => {
  const [detected, setDetected] = useState(hasAdenaExtension);

  useEffect(() => {
    if (detected) {
      return;
    }
    const timer = setInterval(() => hasAdenaExtension() && setDetected(true), 500);
    const stop = setTimeout(() => clearInterval(timer), 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [detected]);

  return detected;
};

export const WebPage = () => {
  const detected = useExtensionDetected();

  return (
    <div className="page">
      <section className="hero">
        <Badge tone={detected ? 'success' : 'failure'}>{detected ? 'Extension detected' : 'Extension not found'}</Badge>
        <h1>Browser extension</h1>
        <p>Calls the provider injected by the Adena extension (<code>window.adena</code>). Every execution is saved to the history in this browser.</p>
      </section>

      {isMobileDevice() && !detected && (
        <div className="notice">
          On a phone, the extension is not available. <Link to="/mobile">Open the Mobile page</Link> to use Adena Mobile through deep links.
        </div>
      )}

      <div className="layout">
        <GroupNav groups={WEB_ACTION_GROUPS} />
        <div className="content">
          <ActionGroups groups={WEB_ACTION_GROUPS} />
        </div>
      </div>
    </div>
  );
};
