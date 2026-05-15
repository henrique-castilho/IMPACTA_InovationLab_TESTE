import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToggleTema } from '../componentes/ToggleTema'
import { obterToken } from '../services/api'
import './TelaLanding.css'

export function TelaLanding() {
  const navigate = useNavigate()
  const tourRef = useRef(null)
  const [slideAtual, setSlideAtual] = useState(0)

  const slides = [
    {
      titulo: 'Dashboard Geral',
      desc: 'Visualize todo o seu semestre em uma única tela com gráficos dinâmicos.',
      imagem: 'tela_dashboard01.png'
    },
    {
      titulo: 'Status e Progresso',
      desc: 'Acompanhe detalhadamente o andamento de cada matéria e o status das suas entregas.',
      imagem: 'tela_dashboard02.png'
    },
    {
      titulo: 'Insights com IA',
      desc: 'Receba feedbacks inteligentes e sugestões baseadas no seu desempenho real.',
      imagem: 'tela_insights.png'
    },
    {
      titulo: 'Gestão de Disciplinas',
      desc: 'Organize suas matérias e acompanhe seu progresso individual em cada uma.',
      imagem: 'tela_disciplina.png'
    },
    {
      titulo: 'Priorização de Tarefas',
      desc: 'Foque no que é urgente. Nosso sistema ordena suas tarefas por prazo automaticamente.',
      imagem: 'tela_tarefas.png'
    },
    {
      titulo: 'Perfil e Preferências',
      desc: 'Personalize sua conta, gerencie seu tema preferido e mantenha seus dados atualizados.',
      imagem: 'tela_perfil.png'
    }
  ]

  const [scrolled, setScrolled] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const token = obterToken()
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ativo')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elementos = document.querySelectorAll('.revelar')
    elementos.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  function rolarParaTour() {
    tourRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function proximoSlide() {
    setSlideAtual((prev) => (prev + 1) % slides.length)
  }

  function slideAnterior() {
    setSlideAtual((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="landing-container">
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''} ${menuAberto ? 'menu-aberto' : ''}`}>
        <div className="landing-logo">
          <span className="logo-icon">🎓</span>
          <span>EduTrack AI</span>
        </div>

        <button 
          className="hamburger-landing" 
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Menu"
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>

        <div className={`landing-nav-actions ${menuAberto ? 'aberto' : ''}`}>
          <ToggleTema />
          <Link to="/login" className="btn-login-ghost" onClick={() => setMenuAberto(false)}>Entrar</Link>
          <Link to="/cadastro" className="btn-signup-glow" onClick={() => setMenuAberto(false)}>Começar Agora</Link>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <span className="badge-ai">Powered by AI ✨</span>
            <h1>Transforme sua jornada acadêmica com <span className="text-gradient">Inteligência</span></h1>
            <p>O EduTrack AI organiza suas disciplinas, rastreia suas tarefas e gera insights inteligentes para você focar no que realmente importa: aprender.</p>
            <div className="hero-btns">
              <Link to="/cadastro" className="btn-hero-primary">Criar Conta Gratuita</Link>
              <button onClick={rolarParaTour} className="btn-hero-secondary">Ver Demonstração</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-card mockup-dash">
              <div className="mockup-header">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-chart">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                  <div className="bar" style={{height: '90%'}}></div>
                </div>
                <div className="mockup-list">
                  <div className="mockup-item"></div>
                  <div className="mockup-item"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={tourRef} className="tour-section revelar" id="demo-tour">
          <div className="tour-header">
            <h2>Conheça cada detalhe do sistema</h2>
            <p>Uma interface pensada para sua produtividade.</p>
          </div>

          <div className="carrossel-container">
            <button className="btn-navegacao anterior" onClick={slideAnterior}>❮</button>
            
            <div className="carrossel-display">
              <div className="carrossel-slide">
                <div className="slide-imagem-area">
                  <img src={slides[slideAtual].imagem} alt={slides[slideAtual].titulo} />
                </div>
                <div className="slide-texto">
                  <span className="contador-slide">{slideAtual + 1} / {slides.length}</span>
                  <h3>{slides[slideAtual].titulo}</h3>
                  <p>{slides[slideAtual].desc}</p>
                </div>
              </div>
            </div>

            <button className="btn-navegacao proximo" onClick={proximoSlide}>❯</button>
          </div>

          <div className="indicadores-carrossel">
            {slides.map((_, i) => (
              <span 
                key={i} 
                className={`indicador ${i === slideAtual ? 'ativo' : ''}`}
                onClick={() => setSlideAtual(i)}
              ></span>
            ))}
          </div>
        </section>

        <section className="features-section">
          <h2 className="revelar">Tudo o que você precisa em um só lugar</h2>
          <div className="features-grid grid-cascata">
            <div className="feature-card revelar">
              <div className="feature-icon">📚</div>
              <h3>Gestão de Disciplinas</h3>
              <p>Organize suas matérias, professores e carga horária de forma intuitiva.</p>
            </div>
            <div className="feature-card revelar">
              <div className="feature-icon">✅</div>
              <h3>Rastreio de Tarefas</h3>
              <p>Nunca mais perca um prazo. Sistema de priorização inteligente por data.</p>
            </div>
            <div className="feature-card revelar">
              <div className="feature-icon">📊</div>
              <h3>Insights com IA</h3>
              <p>Receba análises detalhadas do seu progresso e sugestões de estudo personalizadas.</p>
            </div>
            <div className="feature-card revelar">
              <div className="feature-icon">🌙</div>
              <h3>Modo Escuro Native</h3>
              <p>Estude com conforto em qualquer horário com nossa interface adaptável.</p>
            </div>
          </div>
        </section>

        <section className="cta-section revelar">
          <div className="cta-card">
            <h2>Pronto para elevar seu desempenho?</h2>
            <p>Junte-se a centenas de estudantes que já estão otimizando seu tempo com o EduTrack AI.</p>
            <Link to="/cadastro" className="btn-hero-primary">Criar minha conta agora</Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2026 EduTrack AI. Todos os direitos reservados.</p>
        <div className="footer-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    </div>
  )
}
