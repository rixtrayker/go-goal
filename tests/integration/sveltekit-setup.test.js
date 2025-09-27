/**
 * Integration tests for SvelteKit project setup and configuration
 * These tests verify that the SvelteKit project is properly initialized and configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('SvelteKit Project Setup Integration Tests', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const svelteProjectPath = path.join(projectRoot, 'web-svelte');

  describe('Project Structure', () => {
    test('SvelteKit project directory should exist', () => {
      expect(fs.existsSync(svelteProjectPath)).toBe(true);
    });

    test('should have package.json with SvelteKit dependencies', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check SvelteKit core dependencies
      expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('@sveltejs/kit');
      expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('svelte');
      expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies || packageJson.dependencies).toHaveProperty('vite');
    });

    test('should have TypeScript configuration', () => {
      const tsconfigPath = path.join(svelteProjectPath, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      expect(tsconfig.extends).toBe('./.svelte-kit/tsconfig.json');
    });

    test('should have SvelteKit configuration', () => {
      const svelteConfigPath = path.join(svelteProjectPath, 'svelte.config.js');
      expect(fs.existsSync(svelteConfigPath)).toBe(true);
    });

    test('should have Vite configuration', () => {
      const viteConfigPath = path.join(svelteProjectPath, 'vite.config.ts');
      expect(fs.existsSync(viteConfigPath)).toBe(true);
    });
  });

  describe('SvelteKit Configuration', () => {
    test('should configure adapter-static for static site generation', () => {
      const svelteConfigPath = path.join(svelteProjectPath, 'svelte.config.js');
      const configContent = fs.readFileSync(svelteConfigPath, 'utf8');
      
      expect(configContent).toContain('@sveltejs/adapter-static');
    });

    test('should configure build output to web directory', () => {
      const svelteConfigPath = path.join(svelteProjectPath, 'svelte.config.js');
      const configContent = fs.readFileSync(svelteConfigPath, 'utf8');
      
      // Should be configured to output to ../web directory
      expect(configContent).toContain('../web');
    });

    test('should have TypeScript language support enabled', () => {
      const svelteConfigPath = path.join(svelteProjectPath, 'svelte.config.js');
      const configContent = fs.readFileSync(svelteConfigPath, 'utf8');
      
      expect(configContent).toContain('typescript');
    });
  });

  describe('Development Environment', () => {
    test('should have development script configured', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts.dev).toContain('vite dev');
    });

    test('should have build script configured', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toContain('vite build');
    });

    test('should configure dev server for port 3000', () => {
      const viteConfigPath = path.join(svelteProjectPath, 'vite.config.ts');
      const configContent = fs.readFileSync(viteConfigPath, 'utf8');
      
      expect(configContent).toContain('3000');
    });

    test('should configure proxy to Go backend on port 8080', () => {
      const viteConfigPath = path.join(svelteProjectPath, 'vite.config.ts');
      const configContent = fs.readFileSync(viteConfigPath, 'utf8');
      
      expect(configContent).toContain('8080');
      expect(configContent).toContain('proxy');
    });
  });

  describe('Required Dependencies', () => {
    test('should have GraphQL client dependencies', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      expect(allDeps).toHaveProperty('graphql');
      expect(allDeps).toHaveProperty('graphql-request');
    });

    test('should have internationalization dependencies', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      expect(allDeps).toHaveProperty('svelte-i18n');
    });

    test('should have development tooling dependencies', () => {
      const packageJsonPath = path.join(svelteProjectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      expect(allDeps).toHaveProperty('@typescript-eslint/eslint-plugin');
      expect(allDeps).toHaveProperty('prettier');
      expect(allDeps).toHaveProperty('prettier-plugin-svelte');
    });
  });

  describe('Project Structure Files', () => {
    test('should have src/app.html layout file', () => {
      const appHtmlPath = path.join(svelteProjectPath, 'src/app.html');
      expect(fs.existsSync(appHtmlPath)).toBe(true);
    });

    test('should have src/routes directory', () => {
      const routesPath = path.join(svelteProjectPath, 'src/routes');
      expect(fs.existsSync(routesPath)).toBe(true);
    });

    test('should have src/lib directory for shared components', () => {
      const libPath = path.join(svelteProjectPath, 'src/lib');
      expect(fs.existsSync(libPath)).toBe(true);
    });

    test('should have static directory for assets', () => {
      const staticPath = path.join(svelteProjectPath, 'static');
      expect(fs.existsSync(staticPath)).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    test('should have environment variables configured', () => {
      const envPath = path.join(svelteProjectPath, '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        expect(envContent).toContain('VITE_API_URL');
      }
    });

    test('should configure TypeScript type definitions', () => {
      const appDtsPath = path.join(svelteProjectPath, 'src/app.d.ts');
      expect(fs.existsSync(appDtsPath)).toBe(true);
      
      const appDtsContent = fs.readFileSync(appDtsPath, 'utf8');
      expect(appDtsContent).toContain('declare global');
    });
  });

  describe('Integration with Go Backend', () => {
    test('should preserve existing Go server static file serving', () => {
      const webPath = path.join(projectRoot, 'web');
      expect(fs.existsSync(webPath)).toBe(true);
    });

    test('should not interfere with existing Go backend files', () => {
      const goModPath = path.join(projectRoot, 'go.mod');
      const mainGoPath = path.join(projectRoot, 'cmd/server/main.go');
      
      expect(fs.existsSync(goModPath)).toBe(true);
      expect(fs.existsSync(mainGoPath)).toBe(true);
    });
  });

  describe('Build Output Configuration', () => {
    test('should be configured to build static files to web directory', () => {
      const svelteConfigPath = path.join(svelteProjectPath, 'svelte.config.js');
      const configContent = fs.readFileSync(svelteConfigPath, 'utf8');
      
      // Check that the adapter is configured to output to the web directory
      expect(configContent).toMatch(/pages.*\.\.\/web/);
    });
  });
});