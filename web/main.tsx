import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Deck, isPresentHash } from './Deck';
import { Overview } from './Overview';

/** The overview page; `#present/...` shows the presentation on top of it. */
const App: React.FC = () => {
  const [presenting, setPresenting] = useState(() => isPresentHash(location.hash));
  useEffect(() => {
    const onHash = () => setPresenting(isPresentHash(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return (
    <>
      <Overview />
      {presenting ? (
        <Deck
          onExit={() => {
            history.replaceState(null, '', `${location.pathname}${location.search}#slides`);
            setPresenting(false);
          }}
        />
      ) : null}
    </>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
