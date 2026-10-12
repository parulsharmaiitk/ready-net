import { Link } from 'react-router-dom';
import { APP_NAME } from '../config';
import { Logo } from './Icon';
import { OfflinePill } from './OfflinePill';

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <Logo />
          {APP_NAME}
        </Link>
        <OfflinePill />
      </div>
    </header>
  );
}
