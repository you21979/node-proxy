#!/usr/bin/env node
'use strict'
const log4js = require('log4js');
const createProxy = require('../lib/proxy')

const logger = log4js.getLogger('info');

const initialize = (basedir) => {

    log4js.configure(basedir + '/../config' + '/log.json');
    logger.setLevel('INFO');
    
    process.on("uncaughtException", e => {
        logger.fatal('FATAL ERROR');
        logger.fatal(e);
        process.exit(-1);
    });
}

const main = (prgname, argv) => {

    initialize(__dirname);

    if (argv.length != 3) {
        console.log(`${prgname} [proxyport] [targethost] [targetport]`);
        process.exit();
    }
     
    const proxyPort = process.argv[2];
    const targetHost = process.argv[3];
    const targetPort = process.argv[4];
     
    return createProxy(targetHost, targetPort).listen(proxyPort);
}

main(process.argv[1], process.argv.slice(2))
