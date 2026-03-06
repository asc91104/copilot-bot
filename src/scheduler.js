import cron from 'node-cron';

class CronScheduler {
  constructor() {
    this.jobs = new Map();
  }

  register(taskConfig) {
    if (!taskConfig.name || !taskConfig.schedule || !taskConfig.handler) {
      throw new Error('Task must have name, schedule, and handler properties');
    }

    if (this.jobs.has(taskConfig.name)) {
      console.warn(`Task "${taskConfig.name}" already registered, skipping`);
      return;
    }

    try {
      const task = cron.schedule(taskConfig.schedule, taskConfig.handler, {
        runOnInit: false
      });

      this.jobs.set(taskConfig.name, {
        config: taskConfig,
        task
      });

      console.log(`✓ Scheduled task "${taskConfig.name}" with cron: ${taskConfig.schedule}`);
    } catch (error) {
      console.error(`✗ Failed to schedule task "${taskConfig.name}":`, error.message);
    }
  }

  unregister(taskName) {
    const job = this.jobs.get(taskName);
    if (!job) return false;

    job.task.stop();
    this.jobs.delete(taskName);
    console.log(`✓ Stopped task "${taskName}"`);
    return true;
  }

  stop(taskName) {
    const job = this.jobs.get(taskName);
    if (!job) return false;

    job.task.stop();
    console.log(`⏸ Paused task "${taskName}"`);
    return true;
  }

  start(taskName) {
    const job = this.jobs.get(taskName);
    if (!job) return false;

    job.task.start();
    console.log(`▶ Resumed task "${taskName}"`);
    return true;
  }

  getAll() {
    return Array.from(this.jobs.values()).map(job => ({
      name: job.config.name,
      schedule: job.config.schedule,
      description: job.config.description || ''
    }));
  }

  getTask(taskName) {
    const job = this.jobs.get(taskName);
    return job ? {
      name: job.config.name,
      schedule: job.config.schedule,
      description: job.config.description || ''
    } : null;
  }
}

export default new CronScheduler();
