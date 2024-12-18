import jwt from 'jsonwebtoken';
import config from '../config';

const auth = (req, res, next) => {
    // Wyciąganie nagłówka autoryzacji
    const authHeader = req.header('Authorization');
    
    // Walidacja obecności nagłówka autoryzacji
    if (!authHeader) {
        console.error('Authorization header is missing');
        return res.status(401).json({
            error: 'Access denied',
            message: 'No authorization header provided',
            solution: 'Include a valid Bearer token in the Authorization header'
        });
    }

    // Sprawdzanie, czy nagłówek zaczyna się od "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        console.error('Invalid authorization header format');
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Authorization header must start with "Bearer "',
            example: 'Authorization: Bearer your_token_here'
        });
    }

    // Wyciąganie tokenu, usunięcie prefiksu "Bearer "
    const token = authHeader.split(' ')[1];

    // Walidacja obecności tokenu
    if (!token) {
        console.error('Token is empty after Bearer prefix');
        return res.status(401).json({
            error: 'Access denied',
            message: 'Token is missing or invalid'
        });
    }

    try {
        // Weryfikacja tokenu za pomocą sekretnego klucza
        const decoded = jwt.verify(token, config.JwtSecret);
        if (!decoded.userId) {
            console.error('Decoded token is missing userId');
            throw new Error('Invalid token payload');
        }

        // Logowanie pomyślnej weryfikacji tokenu
        console.log(`Token successfully verified for user: ${decoded.userId}`);

        // Dołączanie informacji o użytkowniku do obiektu request
        req.user = { userId: decoded.userId, role: decoded.role };

        // Kontynuowanie przetwarzania
        next();
    } catch (error) {
        // Obsługa błędów weryfikacji JWT
        console.error(`Token verification error: ${error.message}`);

        switch (error.name) {
            case 'TokenExpiredError':
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Token has expired',
                    solution: 'Please login again to get a new token'
                });
            
            case 'JsonWebTokenError':
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid token',
                    solution: 'Ensure you are using a valid JWT token'
                });
            
            case 'NotBeforeError':
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Token not yet active',
                    solution: 'Check the token\'s activation time'
                });
            
            default:
                return res.status(400).json({
                    error: 'Authentication error',
                    message: 'Unable to authenticate the request',
                    solution: 'Contact support if the problem persists'
                });
        }
    }
};

export default auth;
