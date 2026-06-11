import React, { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Phoenix',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const LocalTime: React.FC<{ className?: string }> = ({ className }) => {
  const [time, setTime] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatter.format(new Date()));
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`font-mono text-[0.6875rem] tracking-[0.15em] uppercase ${className ?? ''}`} style={{ color: 'var(--text-muted)' }}>
      Tucson, AZ {time}
    </span>
  );
};

export default LocalTime;
