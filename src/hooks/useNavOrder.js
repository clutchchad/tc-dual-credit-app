import { useState } from 'react';

export const DEFAULT_TABS = [
  { id: 'home',      label: 'Home',      screen: 'home'      },
  { id: 'acdc',      label: 'My ACDC',   screen: 'acdc'      },
  { id: 'resources', label: 'Resources', screen: 'resources' },
  { id: 'events',    label: 'Events',    screen: 'events'    },
  { id: 'settings',  label: 'Settings',  screen: 'settings'  },
];

const STORAGE_KEY = 'tcdc_v1_tabs';

function loadOrder() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored) && stored.length === DEFAULT_TABS.length) {
      // Validate every stored id exists in DEFAULT_TABS
      const valid = DEFAULT_TABS.map(t => t.id);
      if (stored.every(id => valid.includes(id))) {
        return stored.map(id => DEFAULT_TABS.find(t => t.id === id));
      }
    }
  } catch {}
  return DEFAULT_TABS;
}

export function useNavOrder() {
  const [tabs, setTabs] = useState(loadOrder);

  const saveOrder = (newTabs) => {
    setTabs(newTabs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTabs.map(t => t.id)));
  };

  return [tabs, saveOrder];
}
