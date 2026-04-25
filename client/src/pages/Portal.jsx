import { useNavigate } from 'react-router-dom'
import './Portal.css'

const views = [
  {
    title: 'Customer',
    description: 'Browse our menu and place your order',
    path: '/customer',
    accent: 'var(--color-gold)',
    gradient: 'linear-gradient(135deg, #D4A847 0%, #F0D78C 100%)',
  },
  {
    title: 'Cashier',
    description: 'Employee cashier terminal',
    path: '/cashier',
    accent: 'var(--color-purple)',
    gradient: 'linear-gradient(135deg, #6B2D6B 0%, #9B59A6 100%)',
  },
  {
    title: 'Manager',
    description: 'Store management & analytics',
    path: '/manager',
    accent: 'var(--color-brown)',
    gradient: 'linear-gradient(135deg, #5C3D2E 0%, #8B6914 100%)',
  },
  {
    title: 'Menu Board',
    description: 'Auto-scrolling public menu',
    path: '/menuboard',
    accent: '#2a0845',
    gradient: 'linear-gradient(135deg, #2a0845 0%, #301742 100%)',
  },
]

export default function Portal() {
  const navigate = useNavigate()

  return (
    <div className="portal">
      <div className="portal__bg-orb portal__bg-orb--1" />
      <div className="portal__bg-orb portal__bg-orb--2" />
      <div className="portal__bg-orb portal__bg-orb--3" />

      <div className="portal__content">
        <div className="portal__header">
          <span className="portal__logo-icon">🐉</span>
          <h1 className="portal__title">Dragon Boba</h1>
        </div>

        <div className="portal__cards">
          {views.map((view, i) => (
            <button
              key={view.path}
              className="portal__card"
              style={{
                '--card-accent': view.accent,
                '--card-gradient': view.gradient,
                animationDelay: `${i * 0.12}s`,
              }}
              onClick={() => navigate(view.path)}
            >
              <div className="portal__card-icon">{view.icon}</div>
              <h2 className="portal__card-title">{view.title}</h2>
              <p className="portal__card-subtitle">{view.subtitle}</p>
              <p className="portal__card-desc">{view.description}</p>
              <div className="portal__card-arrow">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
