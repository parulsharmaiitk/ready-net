import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function InfoBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="info-box">
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}

export function DemoTag() {
  return <span className="demo-tag">Demo</span>;
}

export function AlertBanner({ children }: { children: ReactNode }) {
  return (
    <div className="banner banner--alert" role="alert">
      <Icon name="alert" />
      <div className="banner__body">{children}</div>
    </div>
  );
}
