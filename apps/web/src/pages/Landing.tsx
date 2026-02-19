import { useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import { Button } from '../components/ui/Button'
import { useForceLightMode } from '../hooks/use-force-light-mode'

export default function Landing() {
  const navigate = useNavigate()
  useForceLightMode()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-surface font-mono">
      <div className="flex flex-col max-w-[600px] items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">
          Second Brain
        </h1>

        <div className="text-xl md:text-2xl text-text-secondary mb-10 h-14 md:h-7">
          <TypeAnimation
            sequence={[
              'Remember everything.',
              2000,
              'Retrieve anything.',
              2000,
              'Your external mind.',
              2000,
              'Knowledge, compounded.',
              2000,
            ]}
            wrapper="span"
            cursor={true}
            repeat={Infinity}
            speed={50}
            deletionSpeed={70}
          />
        </div>

        <p className="text-base text-text-secondary mb-12 px-4">
          Capture anything through Telegram. Retrieve it instantly with
          AI-powered semantic search, and synthesize your accumulated
          knowledge into new thinking.
        </p>

        <Button variant="cta" className="mb-24" onClick={() => navigate('/login')}>
          Get Started
        </Button>

        <p className="text-xs text-text-tertiary">
          Built by Jet Jadeja.
        </p>
      </div>
    </div>
  )
}
