// The recovery-link snapshot must run before the Supabase client initialises,
// because the auth client strips recovery tokens from the URL on start-up.
import './lib/recoveryLink'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

createRoot(document.getElementById("root")!).render(<App />);
