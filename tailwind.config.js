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
        
        // --- Theme-aware Status Colors ---
        'theme-success-bg': 'var(--theme-success-bg)',
        'theme-success-text': 'var(--theme-success-text)',
        'theme-success-border': 'var(--theme-success-border)',
        'theme-warning-bg': 'var(--theme-warning-bg)',
        'theme-warning-text': 'var(--theme-warning-text)',
        'theme-warning-border': 'var(--theme-warning-border)',
        'theme-error-bg': 'var(--theme-error-bg)',
        'theme-error-text': 'var(--theme-error-text)',
        'theme-error-border': 'var(--theme-error-border)',
        'theme-info-bg': 'var(--theme-info-bg)',
        'theme-info-text': 'var(--theme-info-text)',
        'theme-info-border': 'var(--theme-info-border)',
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