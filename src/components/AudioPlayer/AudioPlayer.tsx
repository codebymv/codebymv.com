import React from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import HiddenWidget from './HiddenWidget';
import PlayerBar from './PlayerBar';
import PlayerPanel from './PlayerPanel';

const AudioPlayer: React.FC = () => {
  const { shouldMountIframe, embedUrl, iframeRef } = useAudioPlayer();

  return (
    <>
      <HiddenWidget iframeRef={iframeRef} embedUrl={embedUrl} visible={shouldMountIframe} />
      <PlayerPanel />
      <div className="player-shell fixed bottom-0 left-0 right-0 z-[45]">
        <PlayerBar />
      </div>
    </>
  );
};

export default AudioPlayer;
