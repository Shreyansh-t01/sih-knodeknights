import React from 'react';
import { useInView } from '../hooks/useInView';

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 650,
  className = '',
  style = {},
  threshold = 0.12,
  triggerOnce = true,
  as: Component = 'div',
  ...props
}) {
  const [ref, inView] = useInView({ threshold, triggerOnce });

  const animClass = `reveal-${animation}`;
  const visibleClass = inView ? 'is-visible' : '';

  const combinedStyle = {
    ...style,
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`
  };

  return (
    <Component
      ref={ref}
      className={`reveal-base ${animClass} ${visibleClass} ${className}`.trim()}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
}
