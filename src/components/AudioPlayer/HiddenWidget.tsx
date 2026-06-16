import React from 'react';

interface HiddenWidgetProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  embedUrl: string;
  visible: boolean;
}

/** Off-screen SoundCloud iframe — powers the custom player UI via Widget API. */
const HiddenWidget: React.FC<HiddenWidgetProps> = ({ iframeRef, embedUrl, visible }) => {
  if (!visible) return null;

  return (
    <div className="sc-widget-host" aria-hidden="true">
      <iframe
        ref={iframeRef}
        title="SoundCloud player"
        src={embedUrl}
        allow="autoplay"
        scrolling="no"
      />
    </div>
  );
};

export default HiddenWidget;
