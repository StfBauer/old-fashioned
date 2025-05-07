/**
 * Realistic CSS/SCSS samples for benchmarking
 */

/**
 * Small flat CSS sample
 */
export const smallCssFlat = `
.button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #005a9e;
}
`;

/**
 * Medium flat CSS sample
 */
export const mediumCssFlat = `
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header .nav {
  display: flex;
  gap: 15px;
}

.header .nav a {
  color: #0078d4;
  text-decoration: none;
  font-weight: 500;
}

.content {
  flex: 1;
}

.footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #666;
  font-size: 14px;
}
`;

/**
 * Large flat CSS sample
 */
export const largeCssFlat = `
/* Layout */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 20px;
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 15px 0;
}

.logo {
  grid-column: 1 / 3;
  display: flex;
  align-items: center;
}

.logo img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo span {
  font-weight: 600;
  font-size: 20px;
  color: #0078d4;
}

.main-navigation {
  grid-column: 3 / 13;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: #444;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #0078d4;
}

.nav-link.active {
  color: #0078d4;
}

.nav-link.active:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #0078d4;
}

/* Hero section */
.hero {
  padding: 80px 0;
  text-align: center;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  margin-bottom: 60px;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  color: #222;
}

.hero p {
  font-size: 20px;
  color: #666;
  max-width: 700px;
  margin: 0 auto 30px;
}

.cta-button {
  display: inline-block;
  padding: 15px 30px;
  background-color: #0078d4;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #005a9e;
}

/* Features */
.features {
  padding: 40px 0 80px;
}

.features h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 40px;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  margin-top: 0;
  color: #0078d4;
}

.feature-card p {
  margin-bottom: 0;
  color: #555;
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 20px;
  color: #0078d4;
}

/* Footer */
.site-footer {
  background-color: #222;
  color: #eee;
  padding: 60px 0 30px;
  margin-top: 80px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
}

.footer-column h4 {
  color: white;
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

.footer-column ul {
  list-style-type: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 8px;
}

.footer-column ul li a {
  color: #bbb;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-column ul li a:hover {
  color: white;
}

.footer-bottom {
  margin-top: 40px;
  text-align: center;
  color: #888;
  font-size: 14px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

/* Media queries */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .logo, .main-navigation {
    grid-column: 1;
  }
  
  .main-navigation {
    margin-top: 20px;
    justify-content: center;
  }
  
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 36px;
  }
  
  .hero p {
    font-size: 18px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
`;

/**
 * Small nested SCSS sample
 */
export const smallScssNested = `
.button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #005a9e;
  }
  
  &--secondary {
    background-color: transparent;
    border: 1px solid #0078d4;
    color: #0078d4;
    
    &:hover {
      background-color: rgba(0, 120, 212, 0.1);
    }
  }
}
`;

/**
 * Medium nested SCSS sample
 */
export const mediumScssNested = `
$primary-color: #0078d4;
$secondary-color: #005a9e;
$text-color: #333;
$border-color: #eee;

.container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid $border-color;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: $text-color;
    }
    
    .nav {
      display: flex;
      gap: 15px;
      
      a {
        color: $primary-color;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          color: $secondary-color;
        }
        
        &.active {
          position: relative;
          
          &:after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: $primary-color;
          }
        }
      }
    }
  }
  
  .content {
    flex: 1;
  }
  
  .footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid $border-color;
    text-align: center;
    color: #666;
    font-size: 14px;
  }
}
`;

/**
 * Large nested SCSS sample
 */
export const largeScssNested = `
// Variables
$primary-color: #0078d4;
$secondary-color: #005a9e;
$text-color: #333;
$light-bg: #f5f5f5;
$border-color: #eee;
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
$shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 5px 15px rgba(0, 0, 0, 0.15);
$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
$transition-standard: all 0.2s ease;

// Mixins
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-lg;
  }
}

// Base styles
html, body {
  margin: 0;
  padding: 0;
  font-family: $font-family;
  line-height: 1.6;
  font-size: 16px;
  color: $text-color;
  background-color: $light-bg;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Component styles
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  border-bottom: 1px solid $border-color;
  box-shadow: $shadow-sm;
  padding: 15px 0;
  
  .logo {
    grid-column: 1 / 3;
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
      grid-column: 1;
    }
    
    img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
    
    span {
      font-weight: 600;
      font-size: 20px;
      color: $primary-color;
    }
  }
  
  .main-navigation {
    grid-column: 3 / 13;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 30px;
    
    @media (max-width: 768px) {
      grid-column: 1;
      margin-top: 20px;
      justify-content: center;
    }
    
    .nav-link {
      color: #444;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
      position: relative;
      
      &:hover {
        color: $primary-color;
      }
      
      &.active {
        color: $primary-color;
        
        &:after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: $primary-color;
        }
      }
    }
  }
}

.hero {
  padding: 80px 0;
  text-align: center;
  background-color: #f9f9f9;
  border-bottom: 1px solid $border-color;
  margin-bottom: 60px;
  
  h1 {
    font-size: 48px;
    margin-bottom: 20px;
    color: #222;
    
    @media (max-width: 480px) {
      font-size: 36px;
    }
  }
  
  p {
    font-size: 20px;
    color: #666;
    max-width: 700px;
    margin: 0 auto 30px;
    
    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
  
  .cta-button {
    display: inline-block;
    padding: 15px 30px;
    background-color: $primary-color;
    color: white;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: $secondary-color;
    }
  }
}

.features {
  padding: 40px 0 80px;
  
  h2 {
    text-align: center;
    font-size: 36px;
    margin-bottom: 40px;
  }
  
  .feature-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: $shadow-md;
    padding: 30px;
    @include hover-lift;
    
    h3 {
      margin-top: 0;
      color: $primary-color;
    }
    
    p {
      margin-bottom: 0;
      color: #555;
    }
    
    .feature-icon {
      font-size: 32px;
      margin-bottom: 20px;
      color: $primary-color;
    }
  }
}

.site-footer {
  background-color: #222;
  color: #eee;
  padding: 60px 0 30px;
  margin-top: 80px;
  
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 30px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
  
  .footer-column {
    h4 {
      color: white;
      margin-top: 0;
      border-bottom: 1px solid #444;
      padding-bottom: 10px;
    }
    
    ul {
      list-style-type: none;
      padding: 0;
      
      li {
        margin-bottom: 8px;
        
        a {
          color: #bbb;
          text-decoration: none;
          transition: color 0.2s;
          
          &:hover {
            color: white;
          }
        }
      }
    }
  }
  
  .footer-bottom {
    margin-top: 40px;
    text-align: center;
    color: #888;
    font-size: 14px;
    padding-top: 20px;
    border-top: 1px solid #444;
  }
}
`;

/**
 * Get all CSS/SCSS samples
 */
export function getAllCssSamples() {
    return {
        smallCssFlat,
        mediumCssFlat,
        largeCssFlat,
        smallScssNested,
        mediumScssNested,
        largeScssNested
    };
}
