// formats to log into console/response


function addLog( data ){
    // logFormat: date timestamp - [callerName]: <data>
    console.log( `${new Date()} -  [${addLog.caller?.name}]: ${data}` );
};

module.exports.addLog = addLog;