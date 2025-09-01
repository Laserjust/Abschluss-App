// Script to add a test report directly to localStorage
const addTestReport = () => {
  try {
    const currentYear = '27';
    const testReport = {
      id: 'test-report-' + Date.now(),
      type: 'comment',
      actionId: 'test-action-123',
      actionTitle: 'Test Action',
      commentId: 'test-comment-456',
      commentText: 'This is a test comment that was reported',
      commentAuthor: 'Test Author',
      reportedBy: 'test-user-uid',
      reportedByName: 'Test Reporter',
      reason: 'Spam',
      additionalInfo: 'This is a test report for debugging',
      status: 'pending',
      reportedAt: new Date(),
      createdAt: new Date().toISOString()
    };
    
    // Get existing data
    let storedData = JSON.parse(localStorage.getItem('mockFirestoreData') || '{}');
    
    // Initialize structure if needed
    if (!storedData.years) storedData.years = {};
    if (!storedData.years[currentYear]) storedData.years[currentYear] = {};
    if (!storedData.years[currentYear].reports) storedData.years[currentYear].reports = [];
    
    // Add the test report
    storedData.years[currentYear].reports.push(testReport);
    
    // Save back to localStorage
    localStorage.setItem('mockFirestoreData', JSON.stringify(storedData));
    
    console.log('✅ Test report added successfully:', testReport);
    console.log('📊 Total reports for year', currentYear + ':', storedData.years[currentYear].reports.length);
    
    return testReport;
  } catch (error) {
    console.error('❌ Error adding test report:', error);
    return null;
  }
};

// Run the function
addTestReport();

// Also check current localStorage state
const checkReports = () => {
  const data = localStorage.getItem('mockFirestoreData');
  if (data) {
    const parsed = JSON.parse(data);
    console.log('📋 Current localStorage structure:', Object.keys(parsed));
    if (parsed.years) {
      Object.keys(parsed.years).forEach(year => {
        console.log(`📅 Year ${year}:`, Object.keys(parsed.years[year]));
        if (parsed.years[year].reports) {
          console.log(`📝 Reports for year ${year}:`, parsed.years[year].reports.length);
          parsed.years[year].reports.forEach((report, index) => {
            console.log(`  ${index + 1}. ${report.reason} - ${report.status}`);
          });
        }
      });
    }
  } else {
    console.log('❌ No mockFirestoreData found');
  }
};

checkReports();