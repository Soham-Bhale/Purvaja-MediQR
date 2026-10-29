import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { Hero } from './components/sections/Hero';

export function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#fafafa] font-sans antialiased dark:bg-[#09090b]">
        <Analytics />
        <main>
          <Hero />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
