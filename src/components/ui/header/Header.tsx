import logoUrl from '@/assets/happy-logo.svg'
import './Header.scss'

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <img
          className="header__logo"
          src={logoUrl}
          alt="Happy Numbers"
          width={203}
          height={40}
        />
      </div>
    </header>
  )
}
