import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import scheduler from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_DIR = path.join(__dirname, 'tasks');

class TaskManager {
  async loadTasks() {
    if (!fs.existsSync(TASKS_DIR)) {
      console.log('📁 Tasks directory does not exist yet, creating...');
      fs.mkdirSync(TASKS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.task.js'));

    if (files.length === 0) {
      console.log('⚠ No task files found in tasks directory');
      return;
    }

    console.log(`📂 Loading ${files.length} task(s)...`);

    for (const file of files) {
      try {
        const taskPath = path.join(TASKS_DIR, file);
        const absolutePath = path.resolve(taskPath);
        const fileUrl = new URL(`file:///${absolutePath.replace(/\\/g, '/')}`).href;
        const { default: taskConfig } = await import(fileUrl);

        scheduler.register(taskConfig);
      } catch (error) {
        console.error(`✗ Failed to load task "${file}":`, error.message);
      }
    }
  }

  registerTask(taskConfig) {
    scheduler.register(taskConfig);
  }

  unregisterTask(taskName) {
    return scheduler.unregister(taskName);
  }

  stopTask(taskName) {
    return scheduler.stop(taskName);
  }

  startTask(taskName) {
    return scheduler.start(taskName);
  }

  listTasks() {
    return scheduler.getAll();
  }

  getTask(taskName) {
    return scheduler.getTask(taskName);
  }
}

export default new TaskManager();
