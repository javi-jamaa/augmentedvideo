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

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
let videosDB = require('../services/videos-db-provider.js');

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

  });
  router.post('/apis/augmentedvideo/v1/videos/:videoId/participant', setLogOperation(OPS.VIDEO_API), bodyParser.urlencoded({'limit': '100000kb'}), (req, res) => {
    let requestData = {
      img: req.body.img,
      faceListID: 'equinox'
    };
    // llamamos al servicio de gonz
    request({
      url: 'http://localhost:8080',
      method: 'POST',
      json: true,
      body: JSON.stringify(requestData)
    }, (err, response, body) => {
      // con el email que devuelve Gonza, vamos y obtenemos el profile y se lo devolvemos al browser
      request({
        url: 'https://druida-api-dsn.tid.es/mongorest/users',
        method: 'GET',
        qs: {
          q: '{%22email%22:%22'+ body.email + '%22}'
        },
        json: true,
      }, (err2, response2, body2) => {
        res.end(JSON.stringify(body2));
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
