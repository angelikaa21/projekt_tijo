import userEndpoint from './user.endpoint.js';
import auth from '../middleware/auth.js'; // Import middleware auth

const routes = (router) => {
  // Publiczna trasa
  router.get('/public', (req, res) => {
    res.json({ message: 'This is a public route' });
  });

  // Chroniona trasa - wymaga tokena
  router.get('/protected', auth, (req, res) => {
    res.json({
      message: 'Access granted to protected route',
      user: req.user, // Dane użytkownika z tokena
    });
  });

  // Obsługa użytkownika
  userEndpoint(router);
};

export default routes;