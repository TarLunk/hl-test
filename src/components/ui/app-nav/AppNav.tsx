import { NavLink } from 'react-router-dom'

import './AppNav.scss'

export function AppNav() {
  return (
    <nav className="app-nav" aria-label="Навигация по вариантам игры">
      <div className="app-nav__inner">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `app-nav__link${isActive ? ' app-nav__link--active' : ' app-nav__link--not-active'}`
          }
          end
        >
          Нативный DnD
        </NavLink>
        <NavLink
          to="/dnd-kit"
          className={({ isActive }) =>
            `app-nav__link${isActive ? ' app-nav__link--active' : ' app-nav__link--not-active'}`
          }
        >
          dnd-kit
        </NavLink>
      </div>
    </nav>
  )
}
