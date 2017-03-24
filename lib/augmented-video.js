/**
 * @license
 * Copyright 2015 Telefónica Investigación y Desarrollo, S.A.U
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const expressDomain = require('express-domaining');
const expressTracking = require('express-tracking');
const expressLogging = require('express-logging');

const routes = require('./routes');
const logger = require('./logger');
const config = require('../config');

let app = express();
let OP = 'incoming-req';

app.use(bodyParser.json());
app.use(expressDomain(logger));
app.use(expressTracking({op: OP}));
app.use(expressLogging(logger));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(routes());

if (fs.existsSync('/etc/letsencrypt/keys/0001_key-certbot.pem')) {
  logger.info('SSL: key found. Enable SSL');
  var privateKey  = fs.readFileSync('/etc/letsencrypt/keys/0001_key-certbot.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/equinox-server.ml/fullchain.pem', 'utf8');

  var credentials = {key: privateKey, cert: certificate};
  var httpsServer = https.createServer(credentials, app);

  https.createServer(sslOptions, app).listen(config.secure_port || 8443, () => {
    logger.info('Express server listening on secure port %d', config.secure_port || 8443);
  });
} else {
  logger.info('SSL: key not found. SSL is NOT enabled');
}

http.createServer(app).listen(config.port, () => {
  logger.info('Express server listening on port %d', config.port);
});
