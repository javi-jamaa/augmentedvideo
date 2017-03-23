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

let Datastore = require('nedb');
let logger = require('../logger.js');
let config = require('./../../config.js');

let PAGE_SIZE = config.membersApiPageSize;
let COMPACTATION_INTERVAL = 10000;

let db = new Datastore({filename: config.userDatabase, autoload: true});
db.persistence.setAutocompactionInterval(COMPACTATION_INTERVAL);
db.ensureIndex({fieldName: 'username', unique: true}, (err) => {
  if (err) {
    logger.info('ERROR creating indexes in db');
  }
});

let findOne = function(videoId, cb) {
  db.findOne({id: videoId}, (err, doc) => {
    return cb(err, doc);
  });
};

let find = function(query, pageNum, cb) {
  db.find(query).skip(pageNum * PAGE_SIZE).limit(PAGE_SIZE).exec((err, docs) => {
    return cb(err, docs);
  });
};

let remove = function(query, cb) {
  // allow to remove multiple docs in case they fit the condition
  db.remove(query, {multi: true}, (err, numRemoved) => {
    return cb(err, numRemoved);
  });
};

let insert = function(doc, cb) {
  db.update(doc, doc, {upsert: true}, (err, numReplaced, upserted) => {
    return cb(err, upserted);
  });
};

let addParticipant = function(videoId, participant, cb) {
  console.log('empezamos');
  db.findOne({id: videoId}, (err, doc) => {
    console.log(doc);
    if(doc) {
      let exists = doc.participants.some((currentParticipant) => {
        return participant.id === currentParticipant.id;
      });
    }
    console.log(exists);
    if (!exists) {
      db.update({id: videoId}, {$push: {participants: participant}}, {upsert: true}, (error, numReplaced, upserted) => {
        return cb(error, upserted);
      });
    }
    return cb(err, null);
  });
};

module.exports = {
  findOne,
  find,
  remove,
  insert,
  addParticipant
};
