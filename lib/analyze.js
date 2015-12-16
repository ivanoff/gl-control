/****
* Analyze data
* Dimitry Ivanov <2@ivanoff.org.ua> $ curl -A cv ivanoff.org.ua
*/

"use strict";

module.exports = function ( hourLimit, params ) {

  function matchTotalForPeriod ( data, callback ) {
    var re = /Total for the period: ((\d+):(\d{2}))/;
    callback( null, re.exec( data ) );
  }

// checking day worked hours
  function totalTime ( data, callback ) {
    matchTotalForPeriod ( data, function( e, match ) {
      callback( null, match? match[1] : match );
    });
  }

// checking expired
  function expiredAlert ( data, callback ) {
    matchTotalForPeriod ( data, function( e, match ) {
      if( !params.expiredAlertFlag && match[2] >= parseInt( hourLimit ) ) {
        callback( null, params.expiredAlertFlag = 1 )
      } else {
        callback();
      }
    });
  }

// checking in-out  
  function newMovements ( data, callback ) {
    var re = /td1.>(.*?)<\/div>(.|[\r\n])+?td2.>(.*?) - (.*?)<\/div>/g;
    var match, result = [];
    while( match = re.exec( data ) ){
      var keyStore = match[3] + '-' + match[1];
      if( match[3] && !params[keyStore] ) {
        params[keyStore] = 1;
        result.push( { sector : match[1], moveIn : match[3], moveOut : match[4] } );
      }
    }
    callback( null, result );
  }

  return {
    totalTime    : function ( data, callback ) { totalTime ( data, callback ) },
    expiredAlert : function ( data, callback ) { expiredAlert ( data, callback ) },
    newMovements : function ( data, callback ) { newMovements ( data, callback ) },
  }

};

