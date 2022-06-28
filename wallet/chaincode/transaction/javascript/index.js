/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const transaction = require('./lib/transaction');

module.exports.transaction = transaction;
module.exports.contracts = [ transaction ];
