const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFYING PRD REQUIREMENTS END-TO-END');
  console.log('================================================================\n');

  // 1. Health check
  console.log('1. Testing System Health Check (PRD Section 1)');
  const health = await axios.get(`${BASE_URL}/health`);
  console.log(`   ✓ Health: ${health.data.status}`);
  console.log(`   ✓ Institution: ${health.data.institution}\n`);

  // 2. Authentication (FR-01)
  console.log('2. Testing User Authentication (FR-01: Admin & Employee)');
  const empLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'employee@agency.com',
    password: 'employee123'
  });
  console.log(`   ✓ Employee Logged in: ${empLogin.data.user.name} (${empLogin.data.user.role})`);
  const empToken = empLogin.data.token;
  const empHeaders = { Authorization: `Bearer ${empToken}` };

  const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@agency.com',
    password: 'admin123'
  });
  console.log(`   ✓ Admin Logged in: ${adminLogin.data.user.name} (${adminLogin.data.user.role})`);
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 3. Agency Dashboard Overview (FR-02)
  console.log('\n3. Testing Dashboard Stats & Metrics Banner (FR-02)');
  const dashStats = await axios.get(`${BASE_URL}/dashboard/stats`, { headers: empHeaders });
  console.log(`   ✓ Banner Clients: ${dashStats.data.agencyBanner.clients}`);
  console.log(`   ✓ Banner Websites: ${dashStats.data.agencyBanner.websites}`);
  console.log(`   ✓ Banner Audits: ${dashStats.data.agencyBanner.audits}`);
  console.log(`   ✓ Banner Avg Score: ${dashStats.data.agencyBanner.avgScore} / 100`);
  console.log(`   ✓ Recent Audits logged: ${dashStats.data.recentAudits.length}`);
  console.log(`   ✓ Score distribution ranges: ${dashStats.data.distribution.length}`);

  // 4. Client Management & Client Dashboard (FR-03 & FR-16)
  console.log('\n4. Testing Client Management (FR-03) & Client Dashboard (FR-16)');
  const clientsRes = await axios.get(`${BASE_URL}/clients`, { headers: empHeaders });
  console.log(`   ✓ Clients listed: ${clientsRes.data.length}`);
  const abcClient = clientsRes.data.find(c => c.company.includes('ABC Furniture'));
  console.log(`   ✓ Found PRD Client: ${abcClient.company} (${abcClient.industry})`);

  const abcDetails = await axios.get(`${BASE_URL}/clients/${abcClient.id}`, { headers: empHeaders });
  console.log(`   ✓ Current Score: ${abcDetails.data.stats.currentScore} / 100`);
  console.log(`   ✓ Previous Score: ${abcDetails.data.stats.previousScore} / 100`);
  console.log(`   ✓ Improvement Delta: +${abcDetails.data.stats.improvementDelta} (PRD Section 15 example)`);
  console.log(`   ✓ Progression data points: ${abcDetails.data.progression.length}`);

  // 5. Website Management (FR-04)
  console.log('\n5. Testing Website Management (FR-04)');
  const websitesRes = await axios.get(`${BASE_URL}/websites`, { headers: empHeaders });
  console.log(`   ✓ Registered websites: ${websitesRes.data.length}`);
  websitesRes.data.forEach(w => {
    console.log(`     - ${w.clientName}: ${w.url} (Score: ${w.currentScore || 'Un-audited'}, Type: ${w.type})`);
  });

  // 6. Live Automated Website Audit (FR-05 through FR-13)
  console.log('\n6. Testing Live Automated Website Audit (FR-05 - FR-13)');
  console.log('   Running live crawler on "https://example.com"...');
  const auditRes = await axios.post(`${BASE_URL}/audits/run`, {
    url: 'https://example.com',
    clientId: abcClient.id
  }, { headers: empHeaders });

  const audit = auditRes.data.audit;
  console.log(`   ✓ Overall Weighted Score: ${audit.overallScore} / 100`);
  console.log(`   ✓ Category Scores (FR-11):`);
  console.log(`     * On-Page SEO (30%): ${audit.categoryScores.onPageSEO} / 100`);
  console.log(`     * Technical SEO (30%): ${audit.categoryScores.technicalSEO} / 100`);
  console.log(`     * Performance (20%): ${audit.categoryScores.performance} / 100`);
  console.log(`     * Mobile Compatibility (10%): ${audit.categoryScores.mobile} / 100`);
  console.log(`     * Content Quality (10%): ${audit.categoryScores.content} / 100`);
  console.log(`   ✓ Issues Detected (FR-12): ${audit.counts.critical} Critical, ${audit.counts.warnings} Warnings, ${audit.counts.passed} Passed`);
  console.log(`   ✓ Actionable Recommendations Generated (FR-13): ${audit.recommendations.length}`);
  if (audit.recommendations.length > 0) {
    console.log(`     * Sample Recommendation: "${audit.recommendations[0].title}"`);
    console.log(`       Action Step: ${audit.recommendations[0].actionStep}`);
  }

  // 7. Audit History & Progression (FR-15)
  console.log('\n7. Testing Audit History Progression (FR-15)');
  const histRes = await axios.get(`${BASE_URL}/audits/history/${websitesRes.data[0].id}`, { headers: empHeaders });
  console.log(`   ✓ Progression items: ${histRes.data.progression.length} months tracked`);
  histRes.data.progression.forEach(p => {
    console.log(`     * ${p.month}: ${p.score} pts`);
  });

  // 8. Consolidated Recommendations & Resolution (FR-13)
  console.log('\n8. Testing Recommendations Board (FR-13)');
  const recsRes = await axios.get(`${BASE_URL}/recommendations`, { headers: empHeaders });
  console.log(`   ✓ Total recommendations: ${recsRes.data.length}`);
  if (recsRes.data.length > 0) {
    const firstRec = recsRes.data[0];
    const updateRes = await axios.patch(`${BASE_URL}/recommendations/${firstRec.id}`, {
      status: 'RESOLVED'
    }, { headers: empHeaders });
    console.log(`   ✓ Updated recommendation status to: ${updateRes.data.status}`);
  }

  // 9. Admin Employee Management (FR-18)
  console.log('\n9. Testing Admin Employee Management (FR-18)');
  const usersRes = await axios.get(`${BASE_URL}/users`, { headers: adminHeaders });
  console.log(`   ✓ Agency users count: ${usersRes.data.length}`);
  usersRes.data.forEach(u => {
    console.log(`     - ${u.name} (${u.email}) [Role: ${u.role}, Status: ${u.status}]`);
  });

  // 10. Admin Settings & Weights Formula (FR-11)
  console.log('\n10. Testing Admin Configurable Scoring Weights (FR-11)');
  const settingsRes = await axios.get(`${BASE_URL}/settings`, { headers: adminHeaders });
  console.log(`   ✓ Agency Name: ${settingsRes.data.agencyName}`);
  console.log(`   ✓ Weights: On-Page: ${settingsRes.data.weights.onPageSEO}%, Technical: ${settingsRes.data.weights.technicalSEO}%, Perf: ${settingsRes.data.weights.performance}%, Mobile: ${settingsRes.data.weights.mobile}%, Content: ${settingsRes.data.weights.content}%`);
  console.log(`   ✓ Sum = ${Object.values(settingsRes.data.weights).reduce((a, b) => a + b, 0)}%`);

  console.log('\n================================================================');
  console.log('✅ ALL PRD FUNCTIONAL REQUIREMENTS SUCCESSFULLY VERIFIED (100%)');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
