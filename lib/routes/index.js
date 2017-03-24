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
    console.log(req.body.img);
    let requestData = {
      img: req.body.img,
      faceListID: 'equinox'
    };
    request({
        url: 'http://52.169.235.193:3000',
        method: 'POST',
        json: true,
        body: JSON.stringify(requestData)
    }, (err, response, body) => {
      console.log(body);
      let participant = {
        email: body.email,
        company: 'real madrid',
        name: 'Andres Iniesta',
        title: 'midfielder',
        country: 'spain',
        phone: '34666666666'
      };
      res.set('Content-Type', 'application/json');
      res.end(JSON.stringify(participant));
    });
/*    let participant = {
      id: 'andres.iniest',
      company: 'real madrid',
      name: req.params.name
    };
    console.log('about to insert');
    videosDB.addParticipant(req.params.videoId, participant, (err, upserted) => {
      console.log('upserted %s', upserted);
      res.end();
    });
  });*/
  });

  return router;
};

/**
 * The exported API
 * @type {*}
 */
module.exports = routes;
