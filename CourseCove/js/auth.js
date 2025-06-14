document.addEventListener('DOMContentLoaded', () => {
    const identity = window.netlifyIdentity;
  
    identity.on('init', user => {
      if (!user) {
        if (document.getElementById('signup-button')) {
          identity.open('signup');
        } else if (document.getElementById('login-button')) {
          identity.open('login');
        }
      }
    });
  
    identity.on('login', user => {
      console.log("Logged in", user);
      identity.close();
      window.location.href = "/"; // Redirect to homepage or dashboard
    });
  
    identity.on('signup', user => {
      console.log("Signed up", user);
      identity.close();
      window.location.href = "/"; // Redirect to homepage or dashboard
    });
  
    identity.on('logout', () => {
      console.log("Logged out");
      window.location.href = "/";
    });
  
    identity.init();
  });
  