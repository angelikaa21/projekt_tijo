import PasswordDAO from '../DAO/passwordDAO';
import TokenDAO from '../DAO/tokenDAO';
import UserDAO from '../DAO/userDAO';
import applicationException from '../service/applicationException';
import crypto from 'crypto';
import mongoose from 'mongoose';


function create(context) {

  function hashString(password) {
    return crypto.createHash('sha1').update(password).digest('hex');
  }

  async function authenticate(name, password) {
    // Fetch the user by name or email
    const user = await UserDAO.getByEmailOrName(name);
    
    if (!user) {
      throw applicationException.new(applicationException.UNAUTHORIZED, 'User with that email does not exist');
    }
  
    // Verify the provided password matches the stored hash
    await PasswordDAO.authorize(user.id, hashString(password));
  
    // Prepare user data for token creation
    const userData = {
      id: user.id || user._id, // Obsługuje oba przypadki
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin
  };
  
    // Create a token with the user data
    const token = await TokenDAO.create(userData);
  
    return getToken(token);
  }

  function getToken(token) {
    return { token: token.value };
  }

  async function createNewOrUpdate(userData) {
    // Ensure userData contains 'id' if updating an existing user
    if (userData.id) {
      console.log(`Updating user with id: ${userData.id}`); // Log for update operation
    } else {
      console.log(`Creating new user`); // Log for creation operation
    }

    const user = await UserDAO.createNewOrUpdate(userData);
    
    if (userData.password) {
      return await PasswordDAO.createOrUpdate({
        userId: user.id, // Ensure userId is passed correctly
        password: hashString(userData.password)
      });
    } else {
      return user;
    }
  }

  async function removeHashSession(userId) {
    console.log(`Removing session for userId: ${userId}`); // Log for session removal
    return await TokenDAO.remove(userId);
  }

 async function addFavorite(userId, movieId) {
  console.log(`Adding favorite for userId=${userId}, movieId=${movieId}`); // Loguj operację

  // Pobierz użytkownika przez UserDAO
  const user = await UserDAO.get(userId);

  if (!user) {
    console.error(`User with id=${userId} not found`); // Loguj błąd, jeśli użytkownik nie istnieje
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  // Dodaj film do ulubionych
  if (!user.favorites.includes(movieId)) {
    user.favorites.push(movieId);
    console.log(`Movie added to favorites: ${movieId}`);
  } else {
    console.log(`Movie already in favorites: ${movieId}`);
  }

  // Zapisz użytkownika (poprzez DAO)
  await UserDAO.createNewOrUpdate(user); // Tu zapisujesz użytkownika w bazie
  console.log('User updated successfully');
  return user;
}

async function removeFavorite(userId, movieId) {
  console.log(`Removing favorite for userId=${userId}, movieId=${movieId}`);

  // Walidacja userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`Invalid userId format: ${userId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
  }

  const user = await UserDAO.get(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  if (user.favorites.includes(movieId)) {
    user.favorites = user.favorites.filter((id) => id !== movieId);
    console.log(`Movie removed from favorites: ${movieId}`);
  } else {
    console.log(`Movie not found in favorites: ${movieId}`);
  }

  await UserDAO.createNewOrUpdate(user);
  console.log('User updated successfully after removing favorite');
  return user;
}

async function addToWatchlist(userId, movieId) {
  console.log(`Adding to watchlist for userId=${userId}, movieId=${movieId}`);

  const user = await UserDAO.get(userId);

  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  if (!user.watchlist.includes(movieId)) {
    user.watchlist.push(movieId);
    console.log(`Movie added to watchlist: ${movieId}`);
  } else {
    console.log(`Movie already in watchlist: ${movieId}`);
  }

  await UserDAO.createNewOrUpdate(user);
  console.log('User updated successfully');
  return user;
}

async function removeFromWatchlist(userId, movieId) {
  console.log(`Removing from watchlist for userId=${userId}, movieId=${movieId}`);

  const user = await UserDAO.get(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  user.watchlist = user.watchlist.filter((id) => id !== movieId);
  console.log(`Movie removed from watchlist: ${movieId}`);

  await UserDAO.createNewOrUpdate(user);
  console.log('User updated successfully');
  return user;
}

async function rateMovie(userId, movieId, rating) {
  console.log(`Rating movie for userId=${userId}, movieId=${movieId}, rating=${rating}`);

  // Walidacja userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`Invalid userId format: ${userId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
  }

  // Walidacja rating
  if (typeof rating !== 'number' || rating < 0 || rating > 10) {
    console.error(`Invalid rating value: ${rating}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Rating must be between 0 and 10');
  }

  // MovieId nie wymaga walidacji jako ObjectId
  if (!movieId || typeof movieId !== 'string') {
    console.error(`Invalid movieId format: ${movieId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid movie ID format');
  }

  // Pobierz użytkownika
  const user = await UserDAO.get(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  // Zaktualizuj ocenę lub dodaj nową
  user.ratings.set(movieId, rating);
  console.log(`Updated/added rating for movieId=${movieId}: ${rating}`);

  // Zapisz użytkownika poprzez UserDAO
  await UserDAO.createNewOrUpdate(user);
  console.log('User updated successfully with new ratings');

  return user.ratings;
}

async function addComment(userId, movieId, commentText) {
  console.log(`Adding comment for userId=${userId}, movieId=${movieId}, commentText=${commentText}`);

  // Walidacja danych wejściowych
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`Invalid userId format: ${userId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
  }

  if (!movieId || typeof movieId !== 'string') {
    console.error(`Invalid movieId format: ${movieId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid movie ID format');
  }

  if (!commentText || typeof commentText !== 'string') {
    console.error(`Invalid commentText format: ${commentText}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Comment text is required and must be a string');
  }

  // Sprawdzenie, czy użytkownik istnieje
  const user = await UserDAO.get(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  // Dodanie komentarza przez UserDAO
  const comment = await UserDAO.addComment(userId, movieId, commentText);
  console.log('Comment added successfully', comment);

  return comment;
}

async function getCommentsByMovie(movieId) {
  console.log(`Fetching comments for movieId=${movieId}`);

  // Walidacja movieId
  if (!movieId || typeof movieId !== 'string') {
    console.error(`Invalid movieId format: ${movieId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Movie ID is required and must be a string');
  }

  // Pobranie komentarzy z UserDAO
  const comments = await UserDAO.getCommentsByMovie(movieId);
  console.log(`Fetched ${comments.length} comments for movieId=${movieId}`);

  return comments;
}


  return {
    authenticate: authenticate,
    createNewOrUpdate: createNewOrUpdate,
    removeHashSession: removeHashSession,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    addToWatchlist: addToWatchlist,
    removeFromWatchlist: removeFromWatchlist,
    rateMovie: rateMovie,
    addComment: addComment,
    getCommentsByMovie: getCommentsByMovie,
  };
}

export default {
  create: create
};