/**
 * Seed script — inserts 25+ varied support tickets into the database.
 * Run with: node backend/scripts/seed.js
 */
const { getDb } = require('../src/db/database');
const db = getDb();

const tickets = [
  { title: 'Cannot log in to my account', description: 'I have been trying to log in for the past hour but keep getting an "Invalid credentials" error even though I recently reset my password. Please help.', email: 'alice.johnson@example.com', priority: 'High', status: 'Open' },
  { title: 'Payment declined on checkout', description: 'My credit card was charged but the order shows as failed. Transaction ID: TXN-88201. Need a refund or order confirmation.', email: 'bob.smith@acme.corp', priority: 'High', status: 'In Progress' },
  { title: 'Feature request: dark mode', description: 'Would love a dark mode option for the dashboard. Spending long hours staring at a bright white screen is tiring.', email: 'charlie.davis@gmail.com', priority: 'Low', status: 'Open' },
  { title: 'CSV export not working', description: 'When I click "Export to CSV" nothing happens in Chrome 120. The button works fine in Firefox. No console errors visible.', email: 'diana.prince@example.org', priority: 'Medium', status: 'Open' },
  { title: 'Account locked after 3 failed attempts', description: 'My account is locked and the unlock email never arrived. Checked spam folder. Account: locked-user@test.com', email: 'edward.nygma@test.com', priority: 'High', status: 'Resolved' },
  { title: 'Dashboard loads very slowly', description: 'The main dashboard takes 15-20 seconds to load. Started happening after last Tuesday\'s update. Other pages are fine.', email: 'fiona.green@startup.io', priority: 'Medium', status: 'In Progress' },
  { title: 'Incorrect invoice amount', description: 'Invoice #INV-2024-441 shows $299 but our contract is for $199/month. Please correct and re-issue.', email: 'george.harris@bigco.com', priority: 'High', status: 'Open' },
  { title: 'Cannot upload profile picture', description: 'Trying to upload a 2MB JPEG but getting "File too large" error. The help docs say 5MB is allowed.', email: 'helen.troy@example.com', priority: 'Low', status: 'Resolved' },
  { title: 'Email notifications not being sent', description: 'I stopped receiving daily digest emails 3 days ago. My notification settings are all enabled. No changes were made on my end.', email: 'ivan.petrov@domain.ru', priority: 'Medium', status: 'In Progress' },
  { title: 'API rate limit too restrictive', description: 'Our integration hits the 100 req/min limit during peak hours. We need a higher tier or a burst allowance. Happy to pay for it.', email: 'julia.roberts@techfirm.co', priority: 'Medium', status: 'Open' },
  { title: 'Two-factor authentication not working', description: '2FA codes from my authenticator app are being rejected. Time is synced. The backup codes also do not work.', email: 'kevin.bacon@email.net', priority: 'High', status: 'Open' },
  { title: 'Report generation fails for large datasets', description: 'Generating a report for Q3 (50k rows) times out after 30 seconds. Smaller date ranges work fine.', email: 'laura.palm@enterprise.com', priority: 'Medium', status: 'In Progress' },
  { title: 'Wrong timezone on scheduled reports', description: 'All scheduled reports are 5 hours off. I have set my timezone to EST but reports show UTC timestamps.', email: 'michael.scott@dundermifflin.com', priority: 'Low', status: 'Open' },
  { title: 'Mobile app crashes on iOS 17', description: 'App immediately crashes when opening the "Analytics" tab on iPhone 15 running iOS 17.1. Other tabs work normally.', email: 'nancy.drew@mystery.org', priority: 'High', status: 'In Progress' },
  { title: 'Cannot delete archived projects', description: 'Archived projects from 2022 cannot be deleted — the delete button is grayed out. Need to clean up old data.', email: 'oscar.wilde@writer.uk', priority: 'Low', status: 'Open' },
  { title: 'SSO integration broken after AD migration', description: 'After our Active Directory migration last week, SSO login redirects to an error page. SAML metadata has been updated.', email: 'patricia.lane@corp.net', priority: 'High', status: 'Open' },
  { title: 'Billing cycle changed without notice', description: 'Our billing date changed from the 1st to the 15th without any notification. This caused cash-flow issues.', email: 'quentin.cole@finance.io', priority: 'Medium', status: 'Resolved' },
  { title: 'Search results are outdated', description: 'Search returns tickets and documents that were deleted weeks ago. Results seem cached and not updating.', email: 'rachel.green@friends.tv', priority: 'Medium', status: 'Open' },
  { title: 'Custom fields not saving', description: 'I created several custom fields for the ticket form but they disappear after I save the settings page.', email: 'steven.rogers@shield.gov', priority: 'Medium', status: 'In Progress' },
  { title: 'Webhook events stopped firing', description: 'Our Slack integration stopped receiving webhook events 2 days ago. The endpoint is healthy and logs show no incoming requests.', email: 'tina.turner@rockstar.com', priority: 'High', status: 'Open' },
  { title: 'Cannot invite team members', description: 'When I enter a colleague\'s email and click "Send Invite", I get a spinning loader that never resolves. No invitation email is sent.', email: 'ulysses.grant@history.edu', priority: 'Medium', status: 'Resolved' },
  { title: 'Data export missing columns', description: 'The exported CSV is missing the "Tags" and "Assignee" columns that are visible in the UI. This is breaking our BI pipeline.', email: 'victoria.stone@analytics.co', priority: 'High', status: 'Open' },
  { title: 'Duplicate tickets being created', description: 'Submitting a ticket sometimes creates two identical copies. Happens intermittently, seems related to slow connections.', email: 'walter.white@abq.nm', priority: 'Medium', status: 'In Progress' },
  { title: 'Language switcher not persisting', description: 'I switch the UI to French but after refreshing the page it reverts back to English. Browser cookies are enabled.', email: 'xavier.chen@intl.org', priority: 'Low', status: 'Resolved' },
  { title: 'Cannot access admin panel', description: 'My account is supposed to have admin privileges (confirmed with IT) but the Admin menu is not visible in the sidebar.', email: 'yvonne.strahovski@example.com', priority: 'High', status: 'Open' },
  { title: 'Bulk action for reassigning tickets', description: 'It would be very helpful to select multiple tickets and reassign them at once instead of one by one.', email: 'zachary.quinn@support.help', priority: 'Low', status: 'Open' },
  { title: 'Integration with Jira not syncing', description: 'Tickets created in our system are not appearing in Jira despite the integration being configured correctly. OAuth token is valid.', email: 'alice.johnson@example.com', priority: 'Medium', status: 'In Progress' },
  { title: 'Password reset link expires too quickly', description: 'Password reset links expire in 10 minutes which is too short. I often check email on my phone and it has expired by the time I click.', email: 'bob.smith@acme.corp', priority: 'Low', status: 'Open' },
];

const insert = db.prepare(
  `INSERT INTO tickets (title, description, email, priority, status)
   VALUES (@title, @description, @email, @priority, @status)`
);

const insertMany = db.transaction((items) => {
  // Clear existing seed data to allow re-running safely
  db.prepare('DELETE FROM tickets').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name='tickets'").run();
  for (const item of items) {
    insert.run(item);
  }
});

try {
  insertMany(tickets);
  console.log(`✅ Seeded ${tickets.length} tickets successfully.`);
} catch (err) {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
}
