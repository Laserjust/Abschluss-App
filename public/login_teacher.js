// Auto-login script for teacher
(function() {
    console.log('Auto-login script started');
    
    // Wait for the page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loginAsTeacher);
    } else {
        loginAsTeacher();
    }
    
    function loginAsTeacher() {
        console.log('Attempting to login as teacher');
        
        const currentYear = new Date().getFullYear();
        const teacherUser = {
            uid: 'teacher-test-uid',
            email: `lehrer@rse-abschluss${currentYear}.de`,
            displayName: 'Herr Schmidt',
            role: 'teacher',
            firstName: 'Thomas',
            lastName: 'Schmidt',
            committees: ['Abi-Komitee'],
            committeeRoles: { 'Abi-Komitee': 'advisor' },
            yearGroup: currentYear.toString()
        };
        
        // Store in localStorage
        localStorage.setItem('testUser', JSON.stringify(teacherUser));
        console.log('Teacher user stored in localStorage:', teacherUser);
        
        // Trigger a page reload to apply the login
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
})();