import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';

describe('Middleware Auth', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no Authorization header is present', () => {
    req.header.mockReturnValue(null);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access denied',
      message: 'No authorization header provided',
      solution: 'Include a valid Bearer token in the Authorization header',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is invalid', () => {
    req.header.mockReturnValue('InvalidToken');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed',
      message: 'Authorization header must start with "Bearer "',
      example: 'Authorization: Bearer your_token_here',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if token is valid', () => {
    const mockToken = 'mock.jwt.token';
    const decoded = { id: 'user123' };

    req.header.mockReturnValue(`Bearer ${mockToken}`);
    jest.spyOn(jwt, 'verify').mockReturnValue(decoded); // Mockowanie `jwt.verify`

    auth(req, res, next);

    expect(req.user).toEqual(decoded); // Sprawdź, czy user został przypisany
    expect(next).toHaveBeenCalled(); // Upewnij się, że next() zostało wywołane
  });

  it('should return 401 if token is invalid', () => {
    const mockToken = 'mock.jwt.token';

    req.header.mockReturnValue(`Bearer ${mockToken}`);
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token');
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed',
      message: 'Invalid token',
      solution: 'Ensure you are using a valid JWT token',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
