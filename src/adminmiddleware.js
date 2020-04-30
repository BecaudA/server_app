import {SocketConfig, logger, ErrorMessage} from './conf/config.js'
import {DataBaseManager} from "./database/DatabaseManager.js";

/**
 * Class implementing a Middleware function with a fixed password
 */
export class AdminMiddleware {
    /**
     * This function checks the password send by the socket and
     * chains to the next middleware
     * @param socket socket attempting a connection
     * @param next middleware function
     * @returns {*} the result returned by the next middleware
     */
    async middlewareFunction(socket, next) {
        logger.debug('New connection to the admin namespace');

        const password = socket.handshake.query.password;
        const username = socket.handshake.query.username;
        socket.handshake.query.password = null;

        const db = new DataBaseManager();
        db.start();
        if (password === await db.getAdminPassword(username)) {
            logger.info('Successful connection to the admin namespace');
            db.end();
            return next();
        }
        db.end();

        logger.debug(ErrorMessage.ADMIN_PASSWORD_INVALID);
        return next(new Error(ErrorMessage.ADMIN_PASSWORD_INVALID));
    }
}