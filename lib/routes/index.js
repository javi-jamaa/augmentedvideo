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
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const videosDB = require('../services/videos-db-provider.js');
const logger = require('../logger');

let OPS = {
  VIDEO_API: 'video-api'
};

function setLogOperation(operation) {
  return function(req, res, next) {
    let domain = process.domain;
    if (domain && domain.tracking) {
      domain.tracking.op = operation;
    }
    return next();
  };
}

let routes = function routes() {
  let router = new express.Router();

  // Augmented Video API
  router.get('/apis/augmentedvideo/v1/videos/:videoId', (req, res) => {
    videosDB.find({}, 0, (err, docs) => {
      res.json(docs);
    });
  });

  router.post('/apis/augmentedvideo/v1/videos/:videoId/participant',
      setLogOperation(OPS.VIDEO_API),
      bodyParser.urlencoded({'limit': '1000000kb'}), (req, res) => {

    logger.info('Image size', req.body.img.length);
    // comunicamos el proceso de gonzalo y este por un fichero. por el api daba problemas
    let randomNumber = Math.floor(Math.random() * 1000000000);
    let tmpFile = '/tmp/' + req.params.videoId + '_' + Date.now() + '_' + randomNumber + '.png'

    fs.writeFile(tmpFile, req.body.img, 'base64', () => {
        logger.info('File written', tmpFile);

        let requestData = {
          img_path: tmpFile,
          // img: req.body.img,
          faceListID: 'test'
        };
        // llamamos al servicio de gonz
        request({
          url: 'http://localhost:8888/whois',
          method: 'POST',
          json: true,
          body: requestData
        }, (err, response, body) => {
          if (err) { // XXX check response.statusCode
            logger.error(err, 'Error servicio Gonzalo ' + res.statusCode + ' ' + body);
            return res.status(response.statusCode).json({err:'Error servicio Gonzalo'});
          }

          if (!body.email) {
            return res.status(404);
          }

          // con el email que devuelve Gonza, vamos y obtenemos el profile y se lo devolvemos al browser
          // TODO autenticar esta petición para que no de un 401
          request({
            url: 'https://druida-api-dsn.tid.es/mongorest/users',
            method: 'GET',
            auth: {
              user: '9b235eab-c959-406e-8419-be3ab4c4b8eb',
              pass: 'ee7941f2-2166-43a4-bf14-586966a3b0ec'
            },
            qs: {
              q: '{"email":"' + body.email+ '"}'
            },
            json: true,
          }, (err2, response2, body2) => {
            if (err2) { // XXX check response2.statusCode
              logger.error('Error servicio Mongorest');
              return res.status(404).json({err: 'Error servicio Mongorest'});
            }
            videosDB.addParticipant(req.params.videoId, body2[0]);
            console.log(body2[0]);
            res.json(body2[0]);
          });
        });
    });
  });

  return router;
};

/**
 * The exported API
 * @type {*}
 */
module.exports = routes;
