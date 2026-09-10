import React, { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';

export default function AnimatedCounter({ end, duration = 1800, prefix = '', suffix = '' }) {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  // Format with commas (Indian/standard number format)
  const formatNumber = (num) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <span ref={ref} className="animated-counter">
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
