document.addEventListener('DOMContentLoaded', () => {
  const identity = window.netlifyIdentity;

  identity.on('init', user => {
    if (!user) {
      const signupBtn = document.getElementById('signup-button');
      const loginBtn = document.getElementById('login-button');

      if (signupBtn) {
        signupBtn.addEventListener('click', () => identity.open('signup'));
      }

      if (loginBtn) {
        loginBtn.addEventListener('click', () => identity.open('login'));
      }
    }
  });

  identity.on('login', user => {
    console.log("Logged in", user);
    identity.close();
    window.location.href = "/";
  });

  identity.on('signup', user => {
    console.log("Signed up", user);
    identity.close();
    window.location.href = "/";
  });

  identity.on('logout', () => {
    console.log("Logged out");
    window.location.href = "/";
  });

  identity.init();
});
