// zenity dialog box functions
// Adam R. Nelson
// August 2013

var spawn  = require('child_process').spawn;

function appendSettings(args, settings) {
    if (settings) {
        if (settings.ok) {
            args.push('--ok-label');
            args.push(settings.ok);
        }
        if (settings.cancel) {
            args.push('--cancel-label');
            args.push(settings.cancel);
        }
        if (settings.title) {
            args.push('--title');
            args.push(settings.title);
        }
    }
}

// Displays a Zenity error dialog, with the text `message`. If `settings` is
// provided, it should be an object which may contain these keys:
// - title: The title of the dialog box.
// - ok:    The caption of the OK button.
// If `callback` is provided, it will be called after the user clicks OK.
exports.error = function(message, settings, callback) {
    var args = ['--error', '--text', message];
    appendSettings(args, settings);
    var child = spawn('zenity', args);
    child.on('exit', function() {if (callback) callback();});
};

// Displays a Zenity question dialog, with the text `message`. If `settings` is
// provided, it should be an object which may contain these keys:
// - title:  The title of the dialog box.
// - ok:     The caption of the OK button.
// - cancel: The caption of the Cancel button.
// If `callback` is provided, it will be called after the user clicks a button.
// It will be passed a single argument, a boolean, which will be true if the
// user clicked OK and false if the user clicked Cancel.
exports.question = function(message, settings, callback) {
    var args = ['--question', '--text', message];
    appendSettings(args, settings);
    var child = spawn('zenity', args);
    child.on('exit', function(code) {
        if (callback) callback(code === 0);
    });
};

// Displays a Zenity information dialog, with the text `message`. If `settings`
// is provided, it should be an object which may contain these keys:
// - title: The title of the dialog box.
// - ok:    The caption of the OK button.
// If `callback` is provided, it will be called after the user clicks OK.
exports.info = function(message, settings, callback) {
    var args = ['--info', '--text', message];
    appendSettings(args, settings);
    var child = spawn('zenity', args);
    child.on('exit', function() {if (callback) callback();});
};
