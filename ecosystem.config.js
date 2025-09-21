module.exports = {
  apps: [
    {
      name: 'oracle-ics-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004
      }
    }
  ]
}