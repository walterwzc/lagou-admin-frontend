var poslist = require('./poslist.json')
var issignin = require('./issignin.json')
var signup = require('./signup.json')
var signin = require('./signin.json')
module.exports = function() {
  return {
    "issignin": issignin,
    "signup": signup,
    "signin": signin
  }
}
