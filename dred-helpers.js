var SimpleSchema = require('simpl-schema').default;

SimpleSchema.setDefaultMessages({
  messages: {
    en: {
      'mustBeInTheFuture': '{{label}} must be in the future',
    },
  },
});

module.exports = {
  buildPayloadResources(values) {
    var resourceNameToId = {
      mode: 0,
      schedule: 1,
      startTime: 2,
      startWindow: 3,
      minDuration: 4,
      maxDuration: 5,
      enabled: 8,
      context: 0,
      dredClass: 1,
      utcOffset: 6
    };

    var resources = [];

    for (var resource in values) {
      var resourceId = resourceNameToId[resource];

      //Just for dev
      //TODO: remove once this code is prod ready
      if (typeof resourceId != 'number') {
        throw new Error('ressource ' + resource + ' is not configured');
      }

      resources.push({
        id: resourceId,
        value: values[resource]
      });
    }

    //Just for dev
    //TODO: remove once this code is prod ready
    if (resources.length == 0) {
      throw new Error('Provided values are invalid ' + JSON.stringify(values, null, 4));
    }

    return resources;
  },

  checkDredArguments(inputs) {
    new SimpleSchema({
      dredClass: {
        optional: true,
        type: Number,
        min: 0,
        max: 12
      },
      utcOffset: {
        optional: true,
        type: Number,
        //TODO: custom validation
      },
      context: {
        type: String,
        optional: true
      },
      enabled: {
        optional: true,
        type: Boolean
      },
      instance: {
        optional: true,
        type: Number,
        min: 0,
        max: 3
      },
      mode: {
        optional: true,
        type: Number,
        min: 0,
        max: 8
      },
      startTime: {
        type: Number,
        optional: true,
        min: 0,
        custom() {
          var schedule = this.field('schedule');

          if (schedule.isSet) {
            if (schedule.value == 1) {
              //start time must be a unix timestamp
              if (!this.isSet) {
                return 'required';
              } else if (+new Date() / 1000 > this.value) {
                return 'mustBeInTheFuture';
              }
            } else if (schedule.value == 2) {
              //start time is daily time in sec
              if (!this.isSet) {
                return 'required';
              } else if (86400 <= this.value) {
                return 'invalid';
              }
            }
          }

          if (this.isSet && (!schedule.isSet || schedule.value == 0)) {
            return 'keyNotInSchema';
          }
        }
      },
      schedule: {
        optional: true,
        type: Number,
        min: 0,
        max: 2
      },
      startWindow: {
        optional: true,
        type: Number,
        min: 0
      },
      minDuration: {
        optional: true,
        type: Number,
        min: 0,
        custom() {
          if (this.isSet) {
            var maxDuration = this.field('maxDuration');

            if (maxDuration.value < this.value) {
              return 'invalid';
            }
          }
        }
      },
      maxDuration: {
        optional: true,
        type: Number,
        min: 0,
        custom() {
          if (this.isSet) {
            var minDuration = this.field('minDuration');

            if (minDuration.value > this.value) {
              return 'invalid';
            }
          }
        }
      },
      urn: {
        optional: false,
        type: String
      },
      server: {
        optional: true,
        type: String
      }
    }).validate(inputs);
  },

  convertArgumentsToUsedValues(inputs) {
    var values = {};
    for (var input in inputs) {
      switch (input) {
        case 'mode': {
          values.mode = ['None', 'OI1', 'OI2', 'OI3', 'OI4', 'OI5', 'OI6', 'OI7', 'OI8'].indexOf(inputs[input]);
          break;
        }

        case 'server':
        case 'context':
        case 'urn': {
          values[input] = inputs[input];
          break;
        }

        default: {
          values[input] = parseInt(inputs[input], 10);
        }
      }
    }

    return values;
  },

  displayError(error) 
  {
    console.error('error ' + context + "\n" + error.status + " " + error.response.text);
  }
};