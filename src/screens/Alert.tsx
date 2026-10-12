import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useStepFocus } from '../components/useStepFocus';

export function Alert() {
  const heading = useStepFocus<HTMLHeadingElement>(
    'Emergency alert. Earthquake reported in your area.',
  );
  return (
    <div className="stack">
      <section className="card card--alert stack stack--sm" role="alert">
        <p className="label row" style={{ gap: 8 }}>
          <span style={{ width: 22, height: 22, display: 'inline-flex' }}>
            <Icon name="alert" />
          </span>
          Emergency alert
        </p>
        <h1 className="title" tabIndex={-1} ref={heading}>
          Earthquake reported in your area
        </h1>
        <p className="body">Check in so responders know if you need help — it works offline.</p>
      </section>
      <Link to="/checkin?new=1" className="btn btn--action">
        <Icon name="checkCircle" />
        Check in now
      </Link>
      <Link to="/" className="btn btn--ghost">
        Not now
      </Link>
    </div>
  );
}
