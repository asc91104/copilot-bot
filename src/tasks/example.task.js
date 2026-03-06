export default {
  name: 'example-hourly-task',
  schedule: '0 * * * *',
  description: 'Example task that runs every hour',
  handler: async () => {
    console.log(`[Task] example-hourly-task executed at ${new Date().toISOString()}`);
  }
};
