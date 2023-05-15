import winston from 'winston';

const colors = {
    fatal: 'magenta',
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
    http: 'green',
    debug: 'blue'
};

const levelPriority = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
};

winston.addColors(colors);

let transports;

if (process.env.NODE_ENV === 'production') {
    // Configuración para entorno de producción
    transports = [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            options: { flags: 'w' } // Para sobrescribir el archivo en cada ejecución
        })
    ];
} else {
    // Configuración para entorno de desarrollo
    transports = [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            options: { flags: 'w' } // Para sobrescribir el archivo en cada ejecución
        })
    ];
}

const logger = winston.createLogger({
    levels: levelPriority,
    transports
});

export default logger;
