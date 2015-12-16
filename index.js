/****
 * Controls my entries and time at GL
 * Dimitry Ivanov <2@ivanoff.org.ua> $ curl -A cv ivanoff.org.ua
*/

"use strict";

var https  = require('https'),
    fs     = require("fs"),
    config = require('config'),
    moment = require('moment'),
    dialog = require('./lib/dialog');

var employeeId = process.env.CONTROL_EMPLOYEEID || config.get( 'employeeId' ), // Id to control
    interval   = process.env.CONTROL_INTERVAL   || config.get( 'interval' )   || 1000 * 60 * 2, // interval to check, ms
    hourLimit  = config.get( 'hourLimit' )  || 9,                 // max limit in hours per day
    homeNumber = config.get( 'homeNumber' ) || '3-R',             // home sector name
    storeFile  = config.get( 'storeFile' )  || "./control.json",  // file to store information
    officetimeHost = config.get( 'officetimeHost' ), // you should know it
    officetimePath = config.get( 'officetimePath' ); // you should know it

var headers = {
        'Authorization': config.get( 'authorization' ),
        'Cookie': config.get( 'cookie' ),
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
    };

function logTime() { return '[' + moment().format("YYYY-MM-DD HH:mm:ss") + '] ' };

// loading configs
var p = {};
try { p = require( storeFile ) } catch (e) { console.log( logTime() + "Can't load param file, using new one" ) }

setInterval(function() {

// using current date
  var dateYMD  = moment().format('YYYY-MM-DD');
  var date     = new Date( dateYMD );
  var dateNext = new Date( moment(dateYMD).add(1, 'day').format('YYYY-MM-DD') );

  process.stdout.write( logTime() + 'I\'m still alive... ' );

// checking if current date is using in params
  if( !p[dateYMD] ) p[dateYMD] = { };
  if( !p[dateYMD][employeeId] ) p[dateYMD][employeeId] = { expiredAlertFlag : 0 };

  var analyze = require('./lib/analyze')( hourLimit, p[dateYMD][employeeId] );

  var httpsOptions = {
    port: 443,
    host: officetimeHost,
    path: officetimePath + '/index_new.php?zone=KBP&employeeId='+employeeId+'&from='+date.getTime()+'&till='+dateNext.getTime(),
    headers : headers
  };

  var str = '';
  var req = https.request( httpsOptions, function(res) {
    res.on('data', function(d) { str += d.toString('utf8') });
    res.on('end', function(d) {
      var changed = 0;
// checking day worked hours
      analyze.totalTime( str, function( e, workingHours ) {
        console.log( workingHours + ' daily worked hours' );
      });

// checking expired
      analyze.expiredAlert( str, function( e, expiredShow ) {
        if( expiredShow ) dialog.info( 'ding-ding-ding!' );
      });

// checking in-out  
      analyze.newMovements( str, function( e, move ) {
        move.forEach(function(entry) {
          changed = 1;
          console.log( logTime() + entry.sector + ' => ' + entry.moveIn+'-'+entry.moveOut );
          entry.sector = ( entry.sector == homeNumber )? 'home!!!' : 'in ' + entry.sector;
          dialog.info( logTime() + 'Welcome '
                        + ( ( entry.sector == homeNumber )? 'home!!!' : 'in ' + entry.sector ) 
                        +' ('+entry.moveIn+'-'+entry.moveOut+')' );
        });
      });

// store config file
      if( changed ) {
        fs.writeFile( storeFile, JSON.stringify( p ), "utf8", 
          function( e ) { console.log( logTime() + ((e)? e : 'config was saved...') ) } );
      }

    });
  });
  req.end();

  req.on('error', function(e) { logTime() + console.error(e) });

}, interval);
