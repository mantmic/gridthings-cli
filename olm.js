#!/usr/bin/env node

var program = require('commander');

program
  .command('show',      'Show the camera settings for the specified OLM')
  .command('colour',    'Set the camera colour settings for the specified OLM')
  .command('crop',      'Set the cop settings for the specified OLM')
  .command('flash',     'Set the flash settings for the specified OLM')
  .command('quality',   'Set the quality settings for the specified OLM')
  .command('latest',    'Show the latest image from the specified OLM')
  .parse(process.argv);