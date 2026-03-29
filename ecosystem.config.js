module.exports = {
    apps: [
        {
            name: "lumen-backend",
            script: "npm",
            args: "start",
            cwd: "./backend",
            env: {
                NODE_ENV: "production",
                PORT: 3001
            }
        },
        {
            name: "lumen-website",
            script: "npm",
            args: "start",
            cwd: "./website",
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
};
