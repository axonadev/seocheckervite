module.exports = {
  apps: [
    {
      name: "scheduler",
      script: "schedule.mjs",
    },
    {
      name: "mRunUpdate",
      script: "runUpdate.mjs",
      autorestart: false,
      watch: false,
    },
    {
      name: "mRunUpdatePosizione",
      script: "runUpdatePosizione.mjs",
      autorestart: false,
      watch: false,
    },
  ],
};
// This is a PM2 ecosystem configuration file for managing the scheduler and manual run scripts.
// It defines two applications: one for the scheduled task and another for manual execution.
//
// The scheduler runs the `schedule.js` script, which is set to execute a task daily at 04:10.
