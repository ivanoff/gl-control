# gl-control
Entries and time control at GL

## Install
`git clone https://github.com/ivanoff/gl-control.git`

`cd gl-control`

`npm install`


## Configs
Configs are in `config/` folder. Default is `config/default.json`.


### How to get authorization and cookie?
It's so useful to use Chrome browser. Just open your officetime page, press F12 and reload page. Then right-click on `index....?zone...` and select `Copy as cURL`.
Authorization and cookie are in your clipboard.


## Run
`node ./index.js`


## Requirements
`zenity` linux tool