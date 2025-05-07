/**
 * Test fixtures for full CSS files
 */

export const smallCssFile = `
.header {
  color: blue;
  margin: 10px;
  padding: 20px;
  width: 100%;
  height: 80px;
  display: flex;
  position: relative;
  background: #f5f5f5;
  font-size: 16px;
  z-index: 100;
}

.footer {
  background: #333;
  padding: 30px;
  color: white;
  margin-top: 20px;
  font-size: 14px;
  display: block;
  width: 100%;
}
`;

export const mediumCssFile = `
.container {
  position: relative;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 1200px;
  height: auto;
  margin: 0 auto;
  margin-top: 20px;
  padding: 15px;
  padding-bottom: 30px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
  background-color: #ffffff;
  color: #333;
  font-size: 16px;
  text-align: center;
}

.button {
  display: inline-block;
  padding: 10px 15px;
  margin: 8px;
  border-radius: 3px;
  background-color: #0078d4;
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar {
  width: 250px;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: #f0f0f0;
  padding: 20px;
  overflow-y: auto;
}
`;

export const largeCssFile = `
/* A large CSS file with multiple selectors and complex properties */
html {
  box-sizing: border-box;
  font-size: 16px;
}

*, *:before, *:after {
  box-sizing: inherit;
}

body {
  position: relative;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px;
  border-bottom: 1px solid #e1e1e1;
}

.main-navigation {
  display: flex;
  gap: 20px;
  margin-left: auto;
}

.main-navigation a {
  color: #0078d4;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 5px;
  border-bottom: 2px solid transparent;
}

.main-navigation a:hover {
  color: #005a9e;
  border-bottom-color: #0078d4;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button {
  display: inline-block;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #005a9e;
}

.button.secondary {
  background-color: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
}

.button.secondary:hover {
  background-color: rgba(0, 120, 212, 0.1);
}

.footer {
  background-color: #333;
  color: #fff;
  padding: 2rem;
  text-align: center;
  margin-top: auto;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 1rem;
  }
  
  .main-navigation {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
`;

export const scssFile = `
// A SCSS file with nested selectors and variables
$primary-color: #0078d4;
$secondary-color: #005a9e;
$spacing-unit: 8px;
$font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

body {
  font-family: $font-family;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  color: #333;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-unit * 3;
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-unit * 2;
      padding-bottom: $spacing-unit * 2;
      border-bottom: 1px solid #e1e1e1;
      
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: $primary-color;
      }
      
      .navigation {
        display: flex;
        gap: $spacing-unit * 2;
        
        a {
          color: $primary-color;
          text-decoration: none;
          transition: color 0.3s ease;
          
          &:hover {
            color: $secondary-color;
          }
        }
      }
    }
    
    .content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: $spacing-unit * 3;
      
      .card {
        background-color: white;
        padding: $spacing-unit * 2;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        
        h2 {
          margin-top: 0;
          color: $primary-color;
        }
        
        p {
          line-height: 1.6;
        }
        
        .button {
          display: inline-block;
          background-color: $primary-color;
          color: white;
          padding: $spacing-unit $spacing-unit * 2;
          border-radius: 4px;
          text-decoration: none;
          transition: background-color 0.3s;
          
          &:hover {
            background-color: $secondary-color;
          }
          
          &.secondary {
            background-color: transparent;
            color: $primary-color;
            border: 1px solid $primary-color;
            
            &:hover {
              background-color: rgba($primary-color, 0.1);
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  body .container {
    padding: $spacing-unit;
    
    .content {
      grid-template-columns: 1fr;
    }
  }
}
`;

export const getAllCssFiles = () => {
    return {
        small: smallCssFile,
        medium: mediumCssFile,
        large: largeCssFile,
        scss: scssFile
    };
};
