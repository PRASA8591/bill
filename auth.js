// js/auth.js

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
  
    try {
      // Fetch user from Firestore based on username
      const userRef = db.collection('users');
      const snapshot = await userRef.where('username', '==', username).get();
  
      if (snapshot.empty) {
        errorMsg.textContent = 'Username not found.';
        return;
      }
  
      let matched = false;
      snapshot.forEach(doc => {
        const user = doc.data();
        if (user.password === password) { // In production, use hashed passwords!
          matched = true;
          // Store user info in session
          sessionStorage.setItem('username', user.username);
          sessionStorage.setItem('role', user.role);
          window.location.href = "dashboard.html";
        }
      });
  
      if (!matched) {
        errorMsg.textContent = 'Incorrect password.';
      }
  
    } catch (error) {
      console.error('Login error:', error);
      errorMsg.textContent = 'Something went wrong. Try again.';
    }
  });
  