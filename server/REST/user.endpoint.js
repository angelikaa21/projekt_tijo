import mongoose from 'mongoose';
import business from '../business/business.container';
import applicationException from '../service/applicationException';
import auth from '../middleware/auth';
import userDAO from '../DAO/userDAO';
import express from 'express';

const router = express.Router();

const userEndpoint = (router) => {
  // Logowanie użytkownika
  router.post('/api/user/auth', async (request, response) => {
    try {
      console.log('Authentication request body:', request.body);

      if (!request.body.login || !request.body.password) {
        return response.status(400).send('Login and password are required');
      }

      const result = await business.getUserManager(request).authenticate(
        request.body.login,
        request.body.password
      );

      console.log('Authentication successful, token:', result.token);
      response.status(200).json({ token: result.token });
    } catch (error) {
      console.error('Authentication error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  // Rejestracja/aktualizacja użytkownika
  router.post('/api/user/create', async (request, response) => {
    try {
      console.log('User creation request body:', request.body);

      const { email, name, password } = request.body;
      if (!email || !name || !password) {
        return response.status(400).send('Email, name, and password are required');
      }

      const result = await business.getUserManager(request).createNewOrUpdate(request.body);
      console.log('User created or updated successfully:', result);
      response.status(200).json(result);
    } catch (error) {
      console.error('User creation error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  // Wylogowanie użytkownika
  router.delete('/api/user/logout/:userId', auth, async (request, response) => {
    try {
      // Użyj parametru z URL zamiast body
      const userId = request.params.userId;

      if (userId !== request.user.id) {
        return response.status(403).send('Unauthorized to logout this user');
      }

      const result = await business.getUserManager(request).removeHashSession(userId);
      response.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      applicationException.errorHandler(error, response);
    }
  });

  // Dodawanie filmu do ulubionych
  router.post('/api/user/favorites/add', auth, async (req, res) => {
    try {
      const { movieId } = req.body;

      // Sprawdzenie, czy movieId jest obecne
      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      // Przypisanie userId z tokenu
      const userId = req.user.userId;  // Używamy userId z tokenu, nie req.user.id
      console.log(`User ID from token: ${userId}`);

      // Sprawdzanie, czy userId jest poprawne
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      // Wywołanie metody dodania filmu do ulubionych
      const updatedUser = await business.getUserManager(req).addFavorite(userId, movieId);

      // Zwrócenie zaktualizowanej listy ulubionych
      res.status(200).json(updatedUser.favorites);
    } catch (error) {
      console.error('Add favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/favorites/remove', auth, async (req, res) => {
    try {
      const { movieId } = req.body;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      // Użyj userId z tokenu
      const userId = req.user.userId; // Dopasowane do addFavorite
      console.log(`User ID from token: ${userId}`);

      // Sprawdzanie, czy userId jest poprawne
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      // Wywołanie metody usuwania filmu z ulubionych
      const updatedUser = await business.getUserManager(req).removeFavorite(userId, movieId);

      res.status(200).json(updatedUser.favorites);
    } catch (error) {
      console.error('Remove favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  // Sprawdzanie, czy film jest ulubiony
  router.get('/api/user/favorites/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query; // Pobierz movieId z parametrów zapytania

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }

      const isFavorite = user.favorites.includes(movieId);
      res.status(200).json({ isFavorite });
    } catch (error) {
      console.error('Check favorite error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  // Pobieranie liczby ulubionych filmów
  router.get('/api/user/favorites/count', auth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userDAO.get(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      const favoriteCount = user.favorites.length;
      res.status(200).json({ count: favoriteCount });
    } catch (error) {
      console.error('Error fetching favorite count:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/watchlist/add', auth, async (req, res) => {
    try {
      const { movieId } = req.body;
      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;
      const updatedUser = await business.getUserManager(req).addToWatchlist(userId, movieId);

      res.status(200).json(updatedUser.watchlist);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/watchlist/remove', auth, async (req, res) => {
    try {
      const { movieId } = req.body;
      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;
      const updatedUser = await business.getUserManager(req).removeFromWatchlist(userId, movieId);

      res.status(200).json(updatedUser.watchlist);
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.get('/api/user/watchlist/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query;
      if (!movieId) return res.status(400).send('Movie ID is required');

      const userId = req.user.userId;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        return res.status(400).send('Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) return res.status(404).send('User not found');

      const isToWatch = user.watchlist.includes(movieId);
      res.status(200).json({ isToWatch });
    } catch (error) {
      console.error('Check watchlist error:', error);
      res.status(500).send('Internal server error');
    }
  });

  router.get('/api/user/watchlist/count', auth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await userDAO.get(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      const watchlistCount = user.watchlist.length;
      res.status(200).json({ count: watchlistCount });
    } catch (error) {
      console.error('Error fetching watchlist count:', error);
      applicationException.errorHandler(error, res);
    }
  });

  router.post('/api/user/ratings', auth, async (req, res) => {
    try {
      const { movieId, rating } = req.body;
      const userId = req.user.userId;

      if (!movieId || typeof rating !== 'number') {
        return res.status(400).send('Movie ID and a valid numeric rating are required');
      }

      console.log('Request body:', req.body);
      const updatedRatings = await business.getUserManager(req).rateMovie(userId, movieId, rating);
      res.status(200).json(updatedRatings);
    } catch (error) {
      console.error('Rate movie error:', error);
      applicationException.errorHandler(error, res);
    }
  });

  // Endpoint dla sprawdzania oceny użytkownika dla danego filmu
  router.get('/api/user/ratings/check', auth, async (req, res) => {
    try {
      const { movieId } = req.query;

      if (!movieId) {
        return res.status(400).send('Movie ID is required');
      }

      const userId = req.user.userId;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid or undefined user ID:', userId);
        return res.status(400).send('Invalid user ID');
      }

      const user = await userDAO.get(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }

      // Pobranie oceny użytkownika dla danego filmu
      const userRating = user.ratings.get(movieId);

      // Jeśli ocena istnieje, zwracamy ją; w przeciwnym razie null
      res.status(200).json({ rated: !!userRating, rating: userRating || null });
    } catch (error) {
      console.error('Check rating error:', error);
      res.status(500).send('Internal server error');
    }
  });


  return router;
};



export default userEndpoint;
