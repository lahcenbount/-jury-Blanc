import { NavLink } from 'react-router-dom'

const Navigation = () => {
  return (
    <nav className="navbar">
      <h1>Gestion de Projets</h1>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end>
            Tableau de bord
          </NavLink>
        </li>
        <li>
          <NavLink to="/projects">
            Projets
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks">
            Tâches
          </NavLink>
        </li>
        <li>
          <NavLink to="/resources">
            Ressources
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation