/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-text': 'var(--sidebar-text)',
        'sidebar-highlight-bg': 'var(--sidebar-highlight-bg)',
        'sidebar-highlight-text': 'var(--sidebar-highlight-text)',
        'emtech-gold': 'var(--emtech-gold)',

        // --- NEW: Dark Theme for Content Area ---
        'theme-bg': 'var(--theme-bg)',
        'theme-bg-secondary': 'var(--theme-bg-secondary)',
        'theme-text-primary': 'var(--theme-text-primary)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-border': 'var(--theme-border)',
        'theme-accent': 'var(--theme-accent)',
      },
      width: {
        '64': '16rem',
      },
      spacing: {
        '64': '16rem',
      }
    },
  },
  plugins: [],
}