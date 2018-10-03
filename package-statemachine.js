#!/usr/bin/env node

var gtapi = require('./gt-api.js');
var StateMachine = require('javascript-state-machine');
var moment = require('moment');

/*
  States
      Start
      Ready
      Deactivated
      Uninstalled
      SoftwareUpdating
      Rollback

*/


function getPackageByName(packageName, packageVersion, server){
  return new Promise(function(resolve, reject) {
    gtapi.software_list_packages(server, function(response){
      var find = '\u0000';
      var re = new RegExp(find, 'g');
      var p = {} ;
      for (var s of response.body) {
        if(s.version == null || s.name == null){
          continue;
        } else {
          const version = s.version.replace(re, '').trim() ;
          const name = s.name.replace(re,'').trim();
          if(name == packageName && version == packageVersion){
            resolve(s);
            break;
          }
        }
      }
      resolve(p);
    })
  })
}
;

function getPackageByHashId(hashId, server){
  return new Promise(function(resolve, reject) {
    gtapi.software_list_packages(server, function(response){
      var find = '\u0000';
      var re = new RegExp(find, 'g');
      var p = {} ;
      for (var s of response.body) {
        if(s._id == hashId){
          resolve(s);
          break;
        }
      }
      resolve(p);
    })
  })
}
;

exports.SoftwareUpdate = StateMachine.factory({
   init: 'start',
   //constructor
   data : function(options){
     //check current software version for endpoint
     //get currently active slots
     return({
       endpoint:options.endpoint,
       complete: false,
       originalVersion:null,
       slotUsed: true,
       targetVersion:options.targetVersion,
       targetSlot:options.targetSlot,
       targetSize:0,
       activatedSlots:[],
       server:options.server,
       printJson:options.printJson,
       jsonOutput:[],
       messageCallback:options.messageCallback,
       finishCallback:options.callback == null ? function(data){console.log(JSON.stringify(data, null, 2));} : options.callback,
       sleepTime: options.sleepTime == null ? 60000 : options.sleepTime,
       stepTime:2000
     })
   },
   transitions: [
     //forward movement
     { name: 'begin',     from: 'start',  to: 'ready' },
     { name: 'deactivate',   from: 'ready', to: 'deactivated'  },
     { name: 'uninstall', from: 'deactivated', to: 'uninstalled'    },
     { name: 'update', from: 'uninstalled',    to: 'updating' },
     { name: 'rollback', from: 'updating',    to: 'rollingback' },
     { name: 'rollbackretry', from: 'rollingback',    to: 'rollingback' },
     { name: 'completerollback', from: 'rollingback',    to: 'deactivated' },
     { name: 'completeupdate', from: 'updating',    to: 'deactivated' },
     //backward movement
     { name: 'finish', from: 'ready',    to: 'start' },
     { name: 'reactivate', from: 'deactivated',    to: 'ready' }
   ],
   methods: {
     //methods on entering state
     onReady:function() {
       this.messageOutput('Ready') ;
       //console.log(this);
       //next step
       if(this.complete){
         this.messageOutput("Finish")
         setTimeout(this.finish.bind(this),this.stepTime);
       } else {
         //check if target software exists
         var target = getPackageByHashId(this.targetVersion, this.server);
         Promise.resolve(target)
         .then(function(target){
           if(target._id == null){
             this.messageOutput("Target software does not exist")
             setTimeout(this.finish.bind(this),this.stepTime) ;
           } else {
             this.targetSize = target.payload_length;
             var hashPromise = null ;
             gtapi.software_get(this.endpoint, false,this.server, function(response){
              this.messageOutput("Deactivating slots")
               for (var instance_id = 0; instance_id < 4; instance_id++){
                 var state = response[instance_id]
                 //if the slot is activated, push it to the activated slots
                 if(state[12]){
                   //push as activated slot
                   this.activatedSlots.push(instance_id);
                   //deactivate the software on slot
                   gtapi.software_deactivate(instance_id, this.endpoint, this.server, function(response){
                     this.messageOutput("Deactivated slot " + instance_id) ;
                     this.messageOutput(response.code);
                   });
                 }
                 //if this is the target slot, store the software version
                 if(instance_id == this.targetSlot){
                   //console.log(state) ;
                   //if the slot is empty mark the slotUsed false
                   if(state[0] == ''){
                     this.slotUsed = false;
                   }
                   hashPromise = getPackageByName(state[0],state[1], this.server) ;
                   /*Promise.resolve(getPackageHash(state[0],state[1], this.server))
                   .then(function(hashId){
                     this.originalVersion = hashId
                   }.bind(this)) ;*/
                 }
               }
               //
               Promise.resolve(hashPromise)
               .then(function(p){
                 if(p._id != null){
                   this.originalVersion = p._id ;
                 }
                 setTimeout(this.deactivate.bind(this),this.stepTime) ;
               }.bind(this))
             }.bind(this))
           }
         }.bind(this))
       }
       ;
     },
     onDeactivated:function() {
       this.messageOutput('Deactivated')
       //set the data variables
       if(this.slotUsed && this.originalVersion == null){
         this.messageOutput("Original version not found");
         this.complete = true;
       }
       if(this.complete){
         this.messageOutput("Reactivating")
         this.activatedSlots.map(function(s){
           gtapi.software_activate(s, this.endpoint, this.server, function(response){
             this.messageOutput("Activated slot " + s)
             this.messageOutput(response.code);
           });
         }.bind(this))
         setTimeout(this.reactivate.bind(this),this.stepTime)
       } else {
         this.messageOutput("Uninstalling")
         if(this.slotUsed){
           gtapi.software_uninstall(this.targetSlot, this.endpoint, this.server, function(response){
            this.messageOutput("Software uninstalled " + response.code);
            setTimeout(this.uninstall.bind(this),this.stepTime)
          }.bind(this));
        } else {
            setTimeout(this.uninstall.bind(this),this.stepTime)
        }
       }
     },
     onUninstalled:function() {
       this.messageOutput('Uninstalled')
       //push target software version
       this.messageOutput("Pushing update")
       gtapi.software_push(this.targetSlot, this.targetVersion, this.endpoint, this.server, function(response){
         this.messageOutput(response.text);
         setTimeout(this.update.bind(this),this.sleepTime);
       }.bind(this));
       //setTimeout(this.update.bind(this),0);
     },
     onUpdating:function() {
       this.messageOutput('Updating')
       //set the data variables
       this.complete = true ;
       //check if successful
       this.checkUpdateStatus(function(success){
         if(success){
           setTimeout(this.completeupdate.bind(this),this.stepTime);
         } else {
           //setTimeout(this.rollback.bind(this),0);
           setTimeout(this.pushOriginalSoftware.bind(this),this.stepTime,this.rollback.bind(this));
         }
       }.bind(this))
     },
     onRollingback:function() {
       this.messageOutput('Rolling back') ;
       //attempt a rollback
       if(this.slotUsed){
         this.checkUpdateStatus(function(rollbackSuccess){
           if(rollbackSuccess){
             setTimeout(this.completerollback.bind(this),this.stepTime);
           } else {
             //sleep
             //retry
             setTimeout(this.pushOriginalSoftware.bind(this),this.sleepTime,this.rollbackretry.bind(this)) ;
           }
         }.bind(this))
       } else {
         setTimeout(this.completerollback.bind(this),this.stepTime);
       }
     },
     /*
     onBegin:function(){
       //set the data variables
       //get current software on slot, available slots
       gtapi.software_get(this.endpoint, this.server, function(response){
         for (var instance_id = 0; instance_id < 4; instance_id++){
           var state = response[instance_id]
           //if the slot is activated, push it to the activated slots
           if(state[12]){
             this.activatedSlots.push(instance_id);
           }
           //if this is the target slot, store the software version
           if(instance_id == this.targetSlot){
             this.originalVersion = state[1] == "" ? null : state[1]
           }
         }
       }.bind(this))
     },*/
     //methods on transitioning
     onFinish:function(){
       if(this.printJson){
         this.finishCallback(this.jsonOutput);
       }
     },
     //normal function to push original version
     pushOriginalSoftware:function(callback){
       if(this.slotUsed){
         this.messageOutput("Pushing original version " + this.originalVersion);
         //callback();
         gtapi.software_push(this.targetSlot, this.originalVersion, this.endpoint, this.server, function(response){
           this.messageOutput(response.status) ;
           callback()
         }.bind(this));
       } else {
         callback()
       }
     },
     checkUpdateStatus:function(callback = function(result){console.log(result)}){
       this.messageOutput("Checking update status") ;
       //function to check the status of a pushed update
       gtapi.software_get(this.endpoint, true,this.server, function(response){
         var state = response[this.targetSlot]
         this.messageOutput(state);
         if(state[7] == 1){
           //log the progress
           this.messageOutput('Downloading update ' + state[30005] + '/' + this.targetSize ) ;
           //check the status again after sleeping
           setTimeout(this.checkUpdateStatus.bind(this),this.sleepTime,callback);
         } else if (state[0] == ""){
           running = false ;
           callback(false)
         } else {
           running = false ;
           callback(true)
         }
       }.bind(this),
       function(error){
         this.messageOutput(error);
         setTimeout(this.checkUpdateStatus.bind(this),this.sleepTime,callback);
       }.bind(this));
     },
     messageOutput(message){
       //if there's no message callback, do things on console
       if(this.messageCallback == null){
         if(this.printJson){
           this.jsonOutput.push({
             timestamp:moment(),
             message:message,
             endpoint:this.endpoint,
             targetVersion:this.targetVersion,
             targetSlot:this.targetSlot,
             originalVersion:this.originalVersion
           })
         } else {
           console.log(message)
         }
       } else {
         this.messageCallback({
           timestamp:moment(),
           message:message,
           endpoint:this.endpoint,
           targetVersion:this.targetVersion,
           targetSlot:this.targetSlot,
           originalVersion:this.originalVersion
         })
       }
     }
   }
 });


 exports.FirmwareUpdate = StateMachine.factory({
  init: 'start',
  //constructor
  data : function(options){
    //check current software version for endpoint
    //get currently active slots
    return({
      endpoint:options.endpoint,
      complete: false,
      originalVersion:null,
      slotUsed: true,
      targetVersion:options.targetVersion,
      targetSize:0,
      server:options.server,
      printJson:options.printJson,
      messageCallback:options.messageCallback,
      jsonOutput:[],
      finishCallback:options.callback == null ? function(data){console.log(JSON.stringify(data, null, 2));} : options.callback,
      sleepTime: options.sleepTime == null ? 60000 : options.sleepTime,
      stepTime:2000
    })
  },
  transitions: [
    //forward movement
    { name: 'begin',     from: 'start',  to: 'ready' },
    { name: 'update', from: 'ready',    to: 'updating' },
    { name: 'rollback', from: 'updating',    to: 'rollingback' },
    { name: 'rollbackretry', from: 'rollingback',    to: 'rollingback' },
    { name: 'completerollback', from: 'rollingback',    to: 'deactivated' },
    { name: 'completeupdate', from: 'updating',    to: 'ready' },
    //backward movement
    { name: 'finish', from: 'ready',    to: 'start' }
  ],
  methods: {
    //methods on entering state
    onReady:function() {
      this.messageOutput('Ready') ;
      //console.log(this);
      //next step
      if(this.complete){
        this.messageOutput("Finish")
        setTimeout(this.finish.bind(this),this.stepTime);
      } else {
        //check if target software exists
        this.messageOutput("Checking if target software exists");
        var target = getPackageByHashId(this.targetVersion, this.server);
        Promise.resolve(target)
        .then(function(target){
          if(target._id == null){
            this.messageOutput("Target software does not exist")
            setTimeout(this.finish.bind(this),this.stepTime) ;
          } else {
            this.targetSize = target.payload_length;
            this.messageOutput("Updating")
            gtapi.firmware_get(this.endpoint, false, this.server, function(response){
              var state = response[0]
              if(state[0] == ''){
                this.slotUsed = false;
              }
              var hashPromise = getPackageByName(state[0],state[1], this.server) ;
              //
              Promise.resolve(hashPromise)
              .then(function(p){
                this.originalVersion = p._id ;
                gtapi.firmware_push(this.targetVersion, this.endpoint, this.server, function(response){
                  this.messageOutput(response.status) ;
                  setTimeout(this.update.bind(this),this.stepTime) ;
                }.bind(this));
              }.bind(this))
            }.bind(this));
          }
        }.bind(this))
      }
      ;
    },
    onUpdating:function() {
      this.messageOutput('Updating')
      //set the data variables
      this.complete = true ;
      //check if successful
      this.checkUpdateStatus(function(success){
        if(success){
          gtapi.firmware_update(this.endpoint, this.server, function(response){
            this.messageOutput(response.status) ;
            setTimeout(this.completeupdate.bind(this),this.stepTime);
          }.bind(this));
        } else {
          //setTimeout(this.rollback.bind(this),0);
          setTimeout(this.pushOriginalSoftware,this.stepTime,this.rollback.bind(this));
        }
      }.bind(this))
    },
    onRollingback:function() {
      this.messageOutput('Rolling back') ;
      //attempt a rollback
      this.checkUpdateStatus(function(rollbackSuccess){
        if(rollbackSuccess){
          setTimeout(this.completerollback.bind(this),this.stepTime);
        } else {
          //sleep
          //retry
          setTimeout(this.pushOriginalSoftware,this.sleepTime,this.rollbackretry.bind(this)) ;
        }
      }.bind(this))
    },
    /*
    onBegin:function(){
      //set the data variables
      //get current software on slot, available slots
      gtapi.software_get(this.endpoint, this.server, function(response){
        for (var instance_id = 0; instance_id < 4; instance_id++){
          var state = response[instance_id]
          //if the slot is activated, push it to the activated slots
          if(state[12]){
            this.activatedSlots.push(instance_id);
          }
          //if this is the target slot, store the software version
          if(instance_id == this.targetSlot){
            this.originalVersion = state[1] == "" ? null : state[1]
          }
        }
      }.bind(this))
    },*/
    //methods on transitioning
    onFinish:function(){
      if(this.printJson){
        this.finishCallback(this.jsonOutput);
      }
    },
    //normal function to push original version
    pushOriginalSoftware:function(callback){
      this.messageOutput("Pushing original version");
      //callback();
      gtapi.firmware_push(this.originalVersion, this.endpoint, this.server, function(response){
        this.messageOutput(response.status) ;
        callback()
      }.bind(this));
    },
    checkUpdateStatus:function(callback = function(result){console.log(result)}){
      //function to check the status of a pushed update
      gtapi.firmware_get(this.endpoint, true, this.server, function(response){
        var state = response[0] ;
        if(state[7] == "none"){
          //log the progress
          this.messageOutput('Downloading update ' + state[30005] + '/' + this.targetSize ) ;
          //check the status again after sleeping
          setTimeout(this.checkUpdateStatus.bind(this),this.sleepTime,callback);
        } else if (state[0] == ""){
          running = false ;
          callback(false)
        } else {
          running = false ;
          callback(true)
        }
      }.bind(this));
    },
    messageOutput(message){
      //if there's no message callback, do things on console
      if(this.messageCallback == null){
        if(this.printJson){
          this.jsonOutput.push({
            timestamp:moment(),
            message:message,
            endpoint:this.endpoint,
            targetVersion:this.targetVersion,
            originalVersion:this.originalVersion
          })
        } else {
          console.log(message)
        }
      } else {
        this.messageCallback({
          timestamp:moment(),
          message:message,
          endpoint:this.endpoint,
          targetVersion:this.targetVersion,
          originalVersion:this.originalVersion
        })
      }
    }
  }
});
