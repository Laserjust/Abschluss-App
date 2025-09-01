// Script to add a test report directly to the mock Firestore database
// This will help test the AdminPanel moderation section

const addTestReportToDatabase = () => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    console.log('Current year:', currentYear);
    
    // Get existing data from localStorage
    const existingData = localStorage.getItem('mockFirestoreData');
    let mockData;
    
    if (existingData) {
      mockData = JSON.parse(existingData);
    } else {
      mockData = { years: {} };
    }
    
    // Ensure year structure exists
    if (!mockData.years) {
      mockData.years = {};
    }
    
    if (!mockData.years[currentYear]) {
      mockData.years[currentYear] = {
        committees: [],
        projects: [],
        users: [],
        conversations: [],
        reports: [],
        'vorabi-subjects': [],
        transactions: []
      };
    }
    
    // Create test report
    const testReport = {
      id: 'test-report-' + Date.now(),
      commentText: 'Das ist eine unangemessene Nachricht, die gemeldet werden sollte.',
      reason: 'Unangemessener Inhalt',
      reportedBy: 'test-user-123',
      reportedByName: 'Max Mustermann',
      authorId: 'author-456',
      authorName: 'Anna Schmidt',
      reportedAt: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
        toDate: function() { return new Date(this.seconds * 1000); }
      },
      conversationId: 'test-conversation-789',
      commentId: 'test-comment-101112'
    };
    
    // Add test report to the reports array
    mockData.years[currentYear].reports.push(testReport);
    
    // Save back to localStorage
    localStorage.setItem('mockFirestoreData', JSON.stringify(mockData));
    
    console.log('✅ Test report added successfully!');
    console.log('📊 Report data:', testReport);
    console.log('📁 Total reports in database:', mockData.years[currentYear].reports.length);
    
    // Display current state
    console.log('🗄️ Current localStorage state:');
    console.log('Years available:', Object.keys(mockData.years));
    console.log(`Reports for ${currentYear}:`, mockData.years[currentYear].reports);
    
    return testReport;
    
  } catch (error) {
    console.error('❌ Error adding test report:', error);
    return null;
  }
};

// Function to check current reports
const checkCurrentReports = () => {
  try {
    const currentYear = new Date().getFullYear();
    const existingData = localStorage.getItem('mockFirestoreData');
    
    if (!existingData) {
      console.log('❌ No data found in localStorage');
      return [];
    }
    
    const mockData = JSON.parse(existingData);
    const reports = mockData.years?.[currentYear]?.reports || [];
    
    console.log(`📊 Found ${reports.length} reports for year ${currentYear}:`);
    reports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.commentText} (by ${report.reportedByName})`);
    });
    
    return reports;
    
  } catch (error) {
    console.error('❌ Error checking reports:', error);
    return [];
  }
};

// Run the functions
console.log('🚀 Adding test report to AdminPanel...');
const report = addTestReportToDatabase();

if (report) {
  console.log('\n🔍 Checking all reports:');
  checkCurrentReports();
  
  console.log('\n✅ Test report added! Now go to /admin-panel and check the Moderation section.');
  console.log('🔗 Navigate to: http://localhost:3000/admin-panel');
} else {
  console.log('❌ Failed to add test report');
}