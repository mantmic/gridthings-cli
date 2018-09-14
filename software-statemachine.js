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


function getPackageHash(packageName, packageVersion, server){
  return new Promise(function(resolve, reject) {
    gtapi.software_list_packages(server, function(response){
      var find = '\u0000';
      var re = new RegExp(find, 'g');
      var hashId = null ;
      for (var s of response.body) {
        if(s.version == null || s.name == null){
          continue;
        } else {
          const version = s.version.replace(re, '').trim() ;
          const name = s.name.replace(re,'').trim();
          if(name == packageName && version == packageVersion){
            resolve(s._id);
            break;
          }
        }
      }
      resolve(hashId);
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
       activatedSlots:[],
       server:options.server,
       printJson:options.printJson,
       jsonOutput:[]
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
         setTimeout(this.finish.bind(this),0);
       } else {
         this.messageOutput("Deactivating")
         var hashPromise = null ;
         gtapi.software_get(this.endpoint, this.server, function(response){
           for (var instance_id = 0; instance_id < 4; instance_id++){
             var state = response[instance_id]
             //if the slot is activated, push it to the activated slots
             if(state[12]){
               //push as activated slot
               this.activatedSlots.push(instance_id);
               //deactivate the software on slot
               gtapi.software_deactivate(instance_id, this.endpoint, this.server, function(response){
                 this.messageOutput("Deactivated slot",instance_id) ;
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
               hashPromise = getPackageHash(state[0],state[1], this.server) ;
               /*Promise.resolve(getPackageHash(state[0],state[1], this.server))
               .then(function(hashId){
                 this.originalVersion = hashId
               }.bind(this)) ;*/
             }
           }
           //
           Promise.resolve(hashPromise)
           .then(function(hashId){
             this.originalVersion = hashId ;
               setTimeout(this.deactivate.bind(this),0) ;
           }.bind(this))
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
             this.messageOutput("Activated slot",s)
             this.messageOutput(response.code);
           });
         }.bind(this))
         setTimeout(this.reactivate.bind(this),0)
       } else {
         this.messageOutput("Uninstalling")
         setTimeout(this.uninstall.bind(this),0)
         /*
         gtapi.software_uninstall(this.targetSlot, this.endpoint, this.server, function(response){
          console.log(response.code);
          setTimeout(this.uninstall.bind(this),0)
        }.bind(this));
        */
       }
     },
     onUninstalled:function() {
       this.messageOutput('Uninstalled')
       //push target software version
       this.messageOutput("Pushing update")
       /*
       gtapi.software_push(this.targetSlot, this.targetVersion, this.endpoint, this.server, function(response){
         console.log(response.status);
         setTimeout(this.update.bind(this),0);
       }.bind(this));
       */
       setTimeout(this.update.bind(this),0);
     },
     onUpdating:function() {
       this.messageOutput('Updating')
       //set the data variables
       this.complete = true ;
       //check if successful
       this.checkUpdateStatus(function(success){
         if(success){
           setTimeout(this.completeupdate.bind(this),0);
         } else {
           //setTimeout(this.rollback.bind(this),0);
           setTimeout(this.pushOriginalSoftware,0,this.rollback.bind(this));
         }
       }.bind(this))
     },
     onRollingback:function() {
       this.messageOutput('Rolling back') ;
       //attempt a rollback
       this.checkUpdateStatus(function(rollbackSuccess){
         if(rollbackSuccess){
           setTimeout(this.completerollback.bind(this),0);
         } else {
           //sleep
           const sleepTime = 3600 ;
           //retry
           setTimeout(this.pushOriginalSoftware,sleepTime,this.rollbackretry.bind(this)) ;
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
         console.log(JSON.stringify(this.jsonOutput, null, 2));
       }
     },
     //normal function to push original version
     pushOriginalSoftware:function(callback){
       this.messageOutput("Pushing original version");
       callback();
       /*gtapi.software_push(this.targetSlot, this.originalVersion, this.endpoint, this.server, function(response){
         console.log(response.status);
         callback()
       }.bind(this));*/
     },
     checkUpdateStatus:function(callback = function(result){console.log(result)}){
       //function to check the status of a pushed update
       callback(true);
     },
     messageOutput(message){
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
     }
   }
 });
