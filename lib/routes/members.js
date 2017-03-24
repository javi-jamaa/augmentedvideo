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

let Promise = require('bluebird');
let logger = require('../logger.js');
let config = require('../../config.js');

let userDB = Promise.promisifyAll(require('../services/user-db-provider.js'));

function getMember(req, res) {
  // get one and only one as userId/username is unique key
  userDB.findOne(req.params.userId, (err, memberInfo) => {
    if (err) {
      res.statusCode = 500;
      logger.error('An error occurred while accessing member info: %s', err);
      return res.end('An error occurred while accessing member info: ' + err);
    }
    if (memberInfo === null) {
      res.statusCode = 404;
      return res.end();
    }
    logger.info('Member info', JSON.stringify(memberInfo));
    return res.end(JSON.stringify(memberInfo));
  });
}

function getMembers(req, res) {
  // mongo-like query can be specified in incoming request
  let q = {};
  if (req.query.query) {
    q = JSON.parse(req.query.query);
  }
  userDB.find(q, req.query.pageNum, (err, membersInfo) => {
    if (err) {
      res.statusCode = 500;
      logger.error('An error occurred while accessing members info: %s', err);
      return res.end('An error occurred while accessing members info: ' + err);
    }
    logger.info('Members info', JSON.stringify(membersInfo));
    return res.end(JSON.stringify(membersInfo));
  });
}

// This operation only adds user to the database, not to github, so this method should not be used for now.
function createMember(req, res) {
  userDB.insert(req.body, (err) => {
    if (err) {
      res.statusCode = 500;
      logger.error('An error occurred while creating member: %s', err);
      return res.end('An error occurred while creating member: ' + err);
    }
    logger.info('Create member');
    return res.end();
  });
}

module.exports = {
  getMember,
  getMembers,
  createMember
};
