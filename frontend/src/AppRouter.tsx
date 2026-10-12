import { lazy, Suspense } from 'react'
import App from './App'

const Page = import.meta.env.DEV && window.location.pathname.replace(/\/$/, '') === '/admin'
  ? lazy(() => import('./QuestionAdmin'))
  : App

export default function AppRouter() {
  return <Suspense fallback={<p>Loading question editor...</p>}><Page /></Suspense>
}
