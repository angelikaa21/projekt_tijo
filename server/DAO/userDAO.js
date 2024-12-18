import mongoose from 'mongoose';
import * as _ from 'lodash';
import Promise from 'bluebird';
import applicationException from '../service/applicationException';
import mongoConverter from '../service/mongoConverter';

const userRole = {
  admin: 'admin',
  user: 'user'
};

const userRoles = [userRole.admin, userRole.user];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: userRoles,
      default: userRole.admin,
      required: false
    },
    active: { type: Boolean, default: true, required: false },
    isAdmin: { type: Boolean, default: false, required: false },
    favorites: { type: [String], default: [] }, // Pole do przechowywania ulubionych filmów
    watchlist: { type: [String], default: [] },
    ratings: {
      type: Map,
      of: {
        type: Number,
        min: 0,
        max: 10
      },
      default: {}
    },
    comments: [
      {
        movieId: { type: String, required: true },
        text: { type: String, required: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    collection: 'user'
  }
);

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    next(new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be unique`));
  } else {
    next(error);
  }
});

const UserModel = mongoose.model('user', userSchema);

function createNewOrUpdate(user) {
  return Promise.resolve()
    .then(() => {
      if (!user.id) {
        // Przy tworzeniu nowego użytkownika
        return new UserModel(user).save().then((result) => {
          if (result) {
            return mongoConverter(result);
          }
        });
      } else {
        // Przy aktualizacji istniejącego
        return UserModel.findByIdAndUpdate(
          user.id,
          _.omit(user, 'id'),
          {
            new: true,  // Zwróć zaktualizowany dokument
            runValidators: true  // Uruchom walidatory schematu
          }
        ).then(result => {
          if (result) {
            console.log('User data before saving:', user);
            return mongoConverter(result);
          }
          throw applicationException.new(
            applicationException.NOT_FOUND,
            'User not found for update'
          );
        });
      }
    })
    .catch((error) => {
      console.error('Error in createNewOrUpdate:', error);
      if (error.name === 'ValidationError') {
        error = error.errors[Object.keys(error.errors)[0]];
        throw applicationException.new(
          applicationException.BAD_REQUEST,
          error.message
        );
      }
      throw error;
    });
}

async function getByEmailOrName(name) {
  console.log(`Searching for user with name/email: ${name}`);

  const result = await UserModel.findOne({
    $or: [{ email: name }, { name: name }]
  });

  if (result) {
    console.log(`User found: ${result._id}`);
    return mongoConverter(result);
  }

  console.warn(`No user found with name/email: ${name}`);
  throw applicationException.new(
    applicationException.NOT_FOUND,
    'User not found'
  );
}

async function get(id) {
  console.log(`Fetching user with id: ${id}`);

  // Sprawdź, czy ID jest poprawnym ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid user ID format: ${id}`);
    throw applicationException.new(
      applicationException.BAD_REQUEST,
      'Invalid user ID format'
    );
  }

  const result = await UserModel.findById(id);
  if (result) {
    console.log(`User found: ${result._id}`);
    return mongoConverter(result);
  }
  console.error(`User not found with id: ${id}`);
  throw applicationException.new(
    applicationException.NOT_FOUND,
    'User not found'
  );
}


async function addFavorite(userId, movieId) {
  console.log(`Adding favorite for userId=${userId}, movieId=${movieId}`);

  // Pobierz użytkownika z bazy
  let user = await UserModel.findById(userId);

  // Upewnij się, że użytkownik istnieje
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  // Logowanie do diagnostyki
  console.log('Is the user a Mongoose document?', user instanceof mongoose.Document);

  // Dodaj film do ulubionych, jeśli nie istnieje
  if (!user.favorites.includes(movieId)) {
    user.favorites.push(movieId);
    console.log(`Movie added to favorites: ${movieId}`);
  } else {
    console.log(`Movie already in favorites: ${movieId}`);
  }

  // Zapisz użytkownika
  await user.save();
  console.log(`User saved successfully`);

  return mongoConverter(user); // Zwróć zaktualizowane dane użytkownika
}

async function removeFavorite(userId, movieId) {
  console.log(`Removing favorite for userId=${userId}, movieId=${movieId}`);

  // Walidacja userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error(`Invalid userId format: ${userId}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID format');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  const initialLength = user.favorites.length;
  user.favorites = user.favorites.filter((id) => id !== movieId);

  if (user.favorites.length < initialLength) {
    console.log(`Movie removed from favorites: ${movieId}`);
  } else {
    console.log(`Movie not found in favorites: ${movieId}`);
  }

  await user.save();
  console.log('User saved successfully after removing favorite');
  return mongoConverter(user);
}

async function addToWatchlist(userId, movieId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  if (!user.watchlist.includes(movieId)) {
    user.watchlist.push(movieId);
    await user.save();
  }
  return mongoConverter(user);
}

async function removeFromWatchlist(userId, movieId) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  user.watchlist = user.watchlist.filter((id) => id !== movieId);
  await user.save();
  return mongoConverter(user);
}

async function rateMovie(userId, movieId, rating) {
  console.log(`Rating movie: userId=${userId}, movieId=${movieId}, rating=${rating}`);

  if (typeof rating !== 'number' || rating < 0 || rating > 10) {
    console.error(`Invalid rating value: ${rating}`);
    throw applicationException.new(applicationException.BAD_REQUEST, 'Rating must be between 0 and 10');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    console.error(`User with id=${userId} not found`);
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  // Zaktualizuj ocenę lub dodaj nową
  user.ratings.set(movieId, rating);
  console.log(`Updated ratings:`, user.ratings);

  await user.save();
  console.log('User saved successfully with updated ratings');

  return mongoConverter(user);
}

async function addComment(userId, movieId, commentText, parentId = null) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid user ID');
  }

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    throw applicationException.new(applicationException.BAD_REQUEST, 'Invalid movie ID');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw applicationException.new(applicationException.NOT_FOUND, 'User not found');
  }

  const comment = {
    movieId,
    text: commentText,
    parentId,
    createdAt: new Date()
  };

  // Sprawdź, czy to odpowiedź na istniejący komentarz
  if (parentId) {
    const parentComment = user.comments.id(parentId);
    if (!parentComment) {
      throw applicationException.new(applicationException.NOT_FOUND, 'Parent comment not found');
    }
    parentComment.replies.push({
      text: commentText,
      userId,
      createdAt: new Date()
    });
  } else {
    user.comments.push(comment);
  }

  await user.save();
  return mongoConverter(user);
}

// Pobieranie komentarzy dla filmu
async function getCommentsByMovie(movieId) {
  const users = await UserModel.find({ 'comments.movieId': movieId });

  const comments = users.flatMap((user) =>
    user.comments
      .filter((comment) => comment.movieId === movieId)
      .map((comment) => ({
        userId: user._id,
        userName: user.name, // Dodaj nazwę użytkownika
        text: comment.text,
        createdAt: comment.createdAt,
        parentId: comment.parentId,
        replies: comment.replies || []
      }))
  );

  return comments;
}

export default {
  createNewOrUpdate,
  getByEmailOrName,
  get,
  addFavorite,
  removeFavorite,
  addToWatchlist,
  removeFromWatchlist,
  rateMovie,
  addComment,
  getCommentsByMovie,
  userRole,
  model: UserModel
};