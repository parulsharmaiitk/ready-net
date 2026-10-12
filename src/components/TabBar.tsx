import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/checkin', label: 'Check in', icon: 'checkCircle' },
  { to: '/caches', label: 'Caches', icon: 'box' },
  { to: '/loved', label: 'Loved ones', icon: 'heart' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      <ul>
        {TABS.map((t) => (
          <li key={t.to}>
            <NavLink to={t.to} end={t.to === '/'}>
              <Icon name={t.icon} />
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
