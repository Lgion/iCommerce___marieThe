# Architecture SCSS et Système BEM

## Structure des Dossiers

```
assets/scss/
├── main.scss              # Point d'entrée principal
├── index.scss             # Index alternatif
├── style.scss             # Style legacy
├── code.snippet           # Snippet template BEM
├── base/                  # Styles de base
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _variables.scss
├── components/            # Composants BEM
│   ├── ADMIN/
│   ├── BOOKING/
│   ├── DASHBOARD/
│   ├── PAGES/
│   ├── POSTS/
│   ├── SERVICES/
│   ├── cart/
│   ├── productActions/
│   ├── productCard/
│   ├── productDetail/
│   ├── productFormModal/
│   ├── productsPage/
│   ├── servicesPage/
│   ├── buttons.scss
│   ├── cards.scss
│   └── lists.scss
├── layouts/               # Layouts globaux
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _sidebar.scss
│   ├── _grid.scss
│   └── _container.scss
├── pages/                 # Styles spécifiques pages
│   ├── _home.scss
│   ├── _onboarding.scss
│   ├── _dashboard.scss
│   └── _services.scss
├── themes/                # Variables thématiques
│   └── _colors.scss
└── utils/                 # Mixins et fonctions
    ├── _mixins.scss
    ├── _functions.scss
    ├── _breakpoints.scss
    └── _animations.scss
```

## Nomenclature BEM

### Convention Stricte
```scss
.block                     // Bloc principal
.block__element            // Élément du bloc
.block__element--modifier  // Modificateur d'élément
.block--modifier           // Modificateur de bloc
```

### Exemples
```scss
// ProductCard
.productCard                          // Bloc
.productCard__image                   // Élément
.productCard__title                   // Élément
.productCard__price                   // Élément
.productCard__button                  // Élément
.productCard__button--primary         // Modificateur
.productCard--featured                // Modificateur de bloc

// DashboardNav
.dashboardNav
.dashboardNav__list
.dashboardNav__item
.dashboardNav__item--active
.dashboardNav__link
.dashboardNav__icon
```

## Template BEM (code.snippet)

**Fichier** : `assets/scss/code.snippet`

### Structure du Snippet
```scss
// ===================================
// COMPOSANT : [NOM_COMPOSANT] BEM
// ===================================

// Variables locales du composant
$component-bg-color: var(--component-bg, #ffffff);
$component-text-color: var(--component-text, #333333);
$component-border-radius: 8px;
$component-padding: 16px;

// ===================================
// BLOC PRINCIPAL
// ===================================
.nomComposant {
  background-color: $component-bg-color;
  color: $component-text-color;
  border-radius: $component-border-radius;
  padding: $component-padding;
  
  // ===================================
  // ÉLÉMENTS
  // ===================================
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  
  &__content {
    padding: 16px;
  }
  
  // ===================================
  // MODIFICATEURS
  // ===================================
  
  &--primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  &--large {
    padding: 24px;
    
    .nomComposant__title {
      font-size: 32px;
    }
  }
  
  // ===================================
  // ÉTATS
  // ===================================
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:focus-within {
    outline: 2px solid var(--focus-color);
  }
  
  // ===================================
  // RESPONSIVE
  // ===================================
  
  @media (max-width: 768px) {
    padding: 12px;
    
    &__title {
      font-size: 18px;
    }
  }
}
```

## Variables Thématiques

### Couleurs (themes/_colors.scss)
```scss
:root {
  // Primary
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  
  // Secondary
  --secondary-color: #8b5cf6;
  --secondary-dark: #7c3aed;
  --secondary-light: #a78bfa;
  
  // Neutrals
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  // Semantic
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
  
  // Dashboard
  --dashboardBg: #f8fafc;
  --dashboardSidebarBg: #1e293b;
  --dashboardCardBg: #ffffff;
  --dashboardText: #0f172a;
  --dashboardTextSecondary: #64748b;
  --dashboardBorder: #e2e8f0;
  --dashboardHover: #f1f5f9;
  
  // Text
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  // Background
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  // Border
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  --border-dark: #d1d5db;
  
  // Shadow
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  // Transitions
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  // Border Radius
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  // Spacing
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### Typography (base/_typography.scss)
```scss
// Polices
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-heading: 'Poppins', 'Inter', sans-serif;
$font-family-mono: 'Fira Code', 'Courier New', monospace;

// Tailles
$font-size-xs: 0.75rem;    // 12px
$font-size-sm: 0.875rem;   // 14px
$font-size-base: 1rem;     // 16px
$font-size-lg: 1.125rem;   // 18px
$font-size-xl: 1.25rem;    // 20px
$font-size-2xl: 1.5rem;    // 24px
$font-size-3xl: 1.875rem;  // 30px
$font-size-4xl: 2.25rem;   // 36px

// Poids
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Line Height
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

## Composants SCSS

### DASHBOARD

#### dashboard-layout.scss
```scss
.dashboardLayout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background-color: var(--dashboardBg);
  
  &__sidebar {
    background-color: var(--dashboardSidebarBg);
    padding: 24px;
    border-right: 1px solid var(--dashboardBorder);
  }
  
  &__main {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    
    &__sidebar {
      display: none; // Mobile menu alternatif
    }
  }
}
```

#### dashboard-nav.scss
```scss
.dashboardNav {
  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  &__item {
    margin-bottom: 8px;
    
    &--active {
      .dashboardNav__link {
        background-color: var(--primary-color);
        color: white;
      }
    }
  }
  
  &__link {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    color: var(--gray-300);
    text-decoration: none;
    transition: var(--transition-fast);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  &__icon {
    margin-right: 12px;
    font-size: 20px;
  }
}
```

#### stat-card.scss
```scss
.statCard {
  background: var(--dashboardCardBg);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--dashboardBorder);
  
  &--primary { border-left: 4px solid var(--primary-color); }
  &--success { border-left: 4px solid var(--success-color); }
  &--warning { border-left: 4px solid var(--warning-color); }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: $font-size-sm;
    color: var(--dashboardTextSecondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  
  &__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background-color: var(--gray-100);
  }
  
  &__value {
    font-size: $font-size-3xl;
    font-weight: 700;
    color: var(--dashboardText);
    margin-bottom: 8px;
  }
  
  &__change {
    font-size: $font-size-sm;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    
    &--positive {
      color: var(--success-color);
      &::before { content: '↑'; }
    }
    
    &--negative {
      color: var(--error-color);
      &::before { content: '↓'; }
    }
  }
}
```

#### data-table.scss
```scss
.dataTable {
  background: var(--dashboardCardBg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--dashboardBorder);
  
  &__container {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  &__header {
    background-color: var(--gray-50);
    
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: $font-size-sm;
      font-weight: 600;
      color: var(--dashboardText);
      border-bottom: 2px solid var(--dashboardBorder);
    }
  }
  
  &__row {
    transition: var(--transition-fast);
    
    &:hover {
      background-color: var(--dashboardHover);
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--dashboardBorder);
    }
  }
  
  &__cell {
    padding: 16px;
    color: var(--dashboardText);
  }
  
  &__actions {
    display: flex;
    gap: 8px;
  }
  
  &__button {
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-size: $font-size-sm;
    transition: var(--transition-fast);
    
    &--edit {
      background-color: var(--info-color);
      color: white;
      
      &:hover {
        background-color: var(--primary-dark);
      }
    }
    
    &--delete {
      background-color: var(--error-color);
      color: white;
      
      &:hover {
        background-color: #dc2626;
      }
    }
  }
  
  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }
}
```

#### activity-log.scss
```scss
.activityLog {
  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  &__item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid var(--dashboardBorder);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  &__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    
    &--login {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--success-color);
    }
    
    &--logout {
      background-color: rgba(107, 114, 128, 0.1);
      color: var(--gray-600);
    }
    
    &--create {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--primary-color);
    }
    
    &--update {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
    }
    
    &--delete {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--error-color);
    }
  }
  
  &__content {
    flex: 1;
  }
  
  &__action {
    font-weight: 600;
    color: var(--dashboardText);
    margin-bottom: 4px;
  }
  
  &__description {
    font-size: $font-size-sm;
    color: var(--dashboardTextSecondary);
    margin-bottom: 4px;
  }
  
  &__time {
    font-size: $font-size-xs;
    color: var(--dashboardTextSecondary);
  }
  
  &__details {
    margin-top: 8px;
    padding: 8px;
    background-color: var(--gray-50);
    border-radius: var(--radius-sm);
    font-size: $font-size-xs;
    color: var(--gray-600);
  }
}
```

### BOOKING

#### weekly-booking-grid.scss
```scss
.weeklyBookingGrid {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  
  &__header {
    display: grid;
    grid-template-columns: 80px repeat(7, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);
  }
  
  &__dayHeader {
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  &__grid {
    display: grid;
    grid-template-columns: 80px repeat(7, 1fr);
    gap: 8px;
  }
  
  &__timeLabel {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 12px;
    font-size: $font-size-sm;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  &__dayColumn {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  &__timeSlot {
    height: 60px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border-light);
    cursor: pointer;
    transition: var(--transition-fast);
    position: relative;
    
    &--available {
      background-color: var(--bg-secondary);
      
      &:hover {
        background-color: var(--primary-light);
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }
    
    &--booked {
      background-color: var(--gray-200);
      color: var(--text-secondary);
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    &--selected {
      background-color: var(--primary-color);
      border-color: var(--primary-dark);
      color: white;
      font-weight: 600;
    }
  }
  
  &__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  &__navButton {
    padding: 8px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background: white;
    cursor: pointer;
    transition: var(--transition-fast);
    
    &:hover {
      background-color: var(--gray-50);
      border-color: var(--primary-color);
    }
  }
  
  &__weekLabel {
    font-weight: 600;
    font-size: $font-size-lg;
    color: var(--text-primary);
  }
  
  &__confirmModal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 32px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 1000;
    max-width: 500px;
    width: 90%;
  }
  
  &__modalOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}
```

### ADMIN

#### admin-panel.scss
```scss
.adminPanel {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
  
  &__header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--border-color);
    
    h2 {
      font-size: $font-size-2xl;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
  }
  
  &__section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__sectionTitle {
    font-size: $font-size-lg;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  &__formGroup {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  &__label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  &__input,
  &__select {
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    font-size: $font-size-base;
    transition: var(--transition-fast);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  &__patternGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  &__patternCard {
    padding: 16px;
    border-radius: var(--radius-md);
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: var(--transition-fast);
    
    &:hover {
      border-color: var(--primary-color);
      background-color: var(--bg-secondary);
    }
    
    &--selected {
      border-color: var(--primary-color);
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
  
  &__button {
    padding: 12px 24px;
    border-radius: var(--radius-md);
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    
    &--primary {
      background-color: var(--primary-color);
      color: white;
      
      &:hover {
        background-color: var(--primary-dark);
      }
    }
    
    &--danger {
      background-color: var(--error-color);
      color: white;
      
      &:hover {
        background-color: #dc2626;
      }
    }
  }
}
```

## Responsive Design

### Breakpoints (utils/_breakpoints.scss)
```scss
$breakpoint-xs: 480px;
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// Mixins
@mixin xs {
  @media (max-width: #{$breakpoint-xs}) { @content; }
}

@mixin sm {
  @media (max-width: #{$breakpoint-sm}) { @content; }
}

@mixin md {
  @media (max-width: #{$breakpoint-md}) { @content; }
}

@mixin lg {
  @media (max-width: #{$breakpoint-lg}) { @content; }
}

@mixin xl {
  @media (max-width: #{$breakpoint-xl}) { @content; }
}
```

### Utilisation
```scss
.myComponent {
  padding: 32px;
  
  @include lg {
    padding: 24px;
  }
  
  @include md {
    padding: 16px;
  }
  
  @include sm {
    padding: 12px;
  }
}
```

## Mixins Utilitaires

### Flexbox Center
```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Truncate Text
```scss
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Card Shadow
```scss
@mixin card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px;
}
```

## Build CSS

### Compilation
```bash
# Via Next.js (automatique)
npm run dev

# Build production
npm run build
```

### Output
- `assets/scss/style.css` (compilé)
- `assets/scss/style.css.map` (source map)

## Bonnes Pratiques

### 1. Variables CSS Over SCSS
```scss
// ✅ Bon
color: var(--primary-color);

// ❌ Éviter
color: $primary-color; // Moins flexible
```

### 2. BEM Strict
```scss
// ✅ Bon
.block__element--modifier

// ❌ Mauvais
.block .element.modifier
```

### 3. Imbrication Limitée
```scss
// ✅ Bon (max 2-3 niveaux)
.parent {
  &__child {
    &--modifier {}
  }
}

// ❌ Mauvais (trop imbriqué)
.a { .b { .c { .d { .e {} } } } }
```

### 4. Responsive Mobile-First
```scss
// ✅ Bon
.component {
  padding: 12px; // Mobile
  
  @media (min-width: 768px) {
    padding: 24px; // Desktop
  }
}
```

### 5. Performance
```scss
// ✅ Bon
will-change: transform;
transform: translateZ(0); // GPU acceleration

// ❌ Éviter animations lourdes
box-shadow: ... // À chaque frame
```
