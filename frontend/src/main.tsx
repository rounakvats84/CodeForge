import { createRoot } from 'react-dom/client'
// @ts-ignore: CSS module import for bundler side-effect
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
