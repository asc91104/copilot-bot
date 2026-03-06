Task File Format
================

All task files must follow the pattern: `<taskName>.task.js`

Required Configuration:
- name: Unique task identifier
- schedule: Cron expression (see https://crontab.guru/)
- handler: Async function to execute

Optional Configuration:
- description: Human-readable description

Example Task Structure:
```javascript
export default {
  name: 'my-task',
  schedule: '0 * * * *',
  description: 'Runs every hour',
  handler: async () => {
    console.log('Task executed');
  }
};
```

Common Cron Patterns:
- Every 5 minutes: '*/5 * * * *'
- Every hour: '0 * * * *'
- Every day at midnight: '0 0 * * *'
- Every Monday at midnight: '0 0 * * 1'
- 9am-5pm on weekdays: '0 9-17 * * 1-5'

API Endpoints:
- GET /api/tasks - List all tasks
- GET /api/tasks/:taskName - Get task details
- POST /api/tasks/:taskName/start - Resume task
- POST /api/tasks/:taskName/stop - Pause task
