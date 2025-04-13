module.exports = {
    apps: [
      {
        name: "inventory-app",
        script: "./index.js",    
        instances: "max",          
        exec_mode: "cluster",    
        watch: false,
        interpreter: "node",  
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };

  // run project using : pm2 start ecosystem.config.cjs
  