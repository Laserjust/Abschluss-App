// Script to check localStorage for reports
const data = localStorage.getItem('mockFirestoreData');
if (data) {
  const parsed = JSON.parse(data);
  console.log('Full localStorage data:', parsed);
  
  if (parsed.years) {
    Object.keys(parsed.years).forEach(year => {
      console.log(`Year ${year}:`, Object.keys(parsed.years[year]));
      if (parsed.years[year].reports) {
        console.log(`Reports for year ${year}:`, parsed.years[year].reports);
      } else {
        console.log(`No reports found for year ${year}`);
      }
    });
  } else {
    console.log('No year-specific data structure found');
  }
} else {
  console.log('No mockFirestoreData found in localStorage');
}