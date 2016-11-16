'use strict'
const util = require('util');
const net = require('net');
const log4js = require('log4js');

const logger = log4js.getLogger('info');
const PROXY_KEEP_TIME = 1000 * 3600 * 5;

const log = (msg) => logger.info(msg)
const debug = (msg) => logger.debug(msg)

class Proxy {
    constructor(sv, idx) {
        this.sv = sv
        this.cl = new net.Socket();
        this.connectedCl = false;
        this.connectedSv = false;
        this.buffers = [];
        this.idx = idx;
    }
    connect( host, port) {
        log(this.idx + ':proxy incomming');
        this.connectedSv = true;
        this.cl.connect(parseInt(port), host, () => {
            log(this.idx+':target connect');
            this.connectedCl = true;
            this.buffers.forEach( data => {
                debug(this.idx + ':target send : ' + data.length);
                this.cl.write(data);
            })
            this.buffers = [];
        });
        this.sv.on("error", e => {
            log(this.idx+':proxy error : ' + e.message);
            this.cl.end();
        });
        this.cl.on("error", e => {
            log(this.idx+':target error : ' + e.message);
            this.sv.end();
        });
        this.sv.on("data", data => {
            debug(this.idx + ':proxy data target send : ' + data.length);
            if (this.connectedCl) {
                this.cl.write(data);
            } else {
                this.buffers[this.buffers.length] = data;
            }
        });
        this.cl.on("data", data => {
            debug(this.idx+':target data proxy send: ' + data.length);
            if (this.connectedSv) {
                this.sv.write(data);
            } else {
                log(this.idx + ": shutdown sv drop data.");
            }
        });
        this.sv.on("close", e => {
            log(this.idx+':proxy close');
            this.connectedSv = false;
            if(this.connectedCl){
                log(this.idx+':target closing');
                this.cl.end();
                this.cl.destroy();
            }
        });
        this.cl.on("close", e => {
            log(this.idx+':target close');
            this.connectedCl = false;
            if(this.connectedSv){
                log(this.idx+':proxy closing');
                this.sv.end();
                this.sv.destroy();
            }
        });
        return this;
    }
    disconnect() {
        log(this.idx+':force disconnect proxy closing');
        this.sv.end();
    }
}

const createProxy = (host, port) => {
    let idx = 0;
    log(`start server : ${host}:${port}`);
    return net.createServer( sv => {
        const proxy = new Proxy(sv, idx++);
        proxy.connect(host, port);
        setTimeout( () => proxy.disconnect(), PROXY_KEEP_TIME);
    })
}

module.exports = createProxy;
