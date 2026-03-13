import './AppLogo.css';

import { Cpu } from 'lucide-react';

export interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const iconSizes: Record<NonNullable<AppLogoProps['size']>, number> = {
  sm: 22,
  md: 28,
  lg: 40,
};

export function AppLogo(props: AppLogoProps) {
  const size = props.size || 'md';
  const iconSize = iconSizes[size];
  const content = (
    <>
      <div className="app-logo__icon">
        <Cpu size={iconSize} />
      </div>
      <div className="app-logo__text">
        <span className="app-logo__title">Visual Wiring</span>
        <span className="app-logo__subtitle">Component Designer</span>
      </div>
    </>
  );

  if (props.onClick) {
    return (
      <button
        className={`app-logo app-logo--${size} app-logo--clickable`}
        onClick={props.onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <div className={`app-logo app-logo--${size}`}>{content}</div>;
}
