import './Header.scss'

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <img
          className="header__logo"
          src="/happy-logo.svg"
          alt="Happy Numbers"
          width={203}
          height={40}
        />
      </div>
    </header>
  )
}
