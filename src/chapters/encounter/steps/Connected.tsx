import React from 'react';
import { PEOPLE, type Who } from '../../../kit/cast';
import { At, Avatar } from '../../../kit/ui';

/** "Connected with <peer>": both avatars, the phone's owner in front. Shown once both sides have confirmed. */
export const Connected: React.FC<{ self: Who; peer: Who }> = ({ self, peer }) => {
  const me = PEOPLE[self];
  const them = PEOPLE[peer];
  return (
    <At top={170}>
      <div style={{ display: 'flex' }}>
        <Avatar initial={me.initial} size={96} tone={me.tone} ring />
        <div style={{ marginLeft: -20 }}>
          <Avatar initial={them.initial} size={96} tone={them.tone} ring />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 22 }}>Connected with {them.name}</div>
    </At>
  );
};
