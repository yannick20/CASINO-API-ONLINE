module.exports = {
    apps : [{
      name: 'CASINO-SUPERMARKET',
      script: 'app.js',
      instances: 4,
      watch: '.',
      ignore_watch: ['node_modules', 'public'],
    }, {
      script: './service-worker/',
      watch: ['./service-worker']
    }],
    deploy : {
      production : {
        user : 'root',
        host : '194.163.180.27',
        ref  : 'origin/main',
        repo : 'https://github.com/NYOTA-PROJECTS/CASINO-API-ONLINE.git',
        path : '/root/api-casino',
        'pre-deploy-local': '',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup': ''
      }
    }
  };
  