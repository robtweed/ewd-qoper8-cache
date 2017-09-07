/*

 ----------------------------------------------------------------------------
 | ewd-qoper8-cache: Integrates InterSystems Cache databaae with            |
 |                    ewd-qpoper8 worker modules                            |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

*/

module.exports = function(worker, params) {

  // establish the connection to Cache database

  var DocumentStore = require('ewd-document-store');

  // save current working directory
  var cwd = process.cwd();

  var iface = require('cache');
  worker.db = new iface.Cache();

  params = params || {};
  if (!params.path) params.path = '/opt/cache/mgr';
  if (!params.username) params.username = '_SYSTEM';
  if (!params.password) params.password = 'SYS';
  if (!params.namespace) params.namespace = 'USER';
  if (!params.charset) params.charset = 'UTF-8';
  if (!params.lock) params.lock = 0;

  var status = worker.db.open(params);

  // reset working directory
  process.chdir(cwd);

  worker.on('stop', function() {
    this.db.close();
    worker.emit('dbClosed');
  });

  worker.on('unexpectedError', function() {
    if (worker.db) {
      try {
        worker.db.close();
      }
      catch(err) {
        // ignore - process will shut down anyway
      }
    }
  });

  worker.emit('dbOpened', status);
  worker.documentStore = new DocumentStore(worker.db);
  worker.emit('DocumentStoreStarted');
};

