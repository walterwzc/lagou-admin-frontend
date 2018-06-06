function Router() {
  this.currentUrl = ''
  this.routes = {}
}

Router.prototype.route = function (hash, cb) {
  this.routes[hash] = cb || function() {}
}

Router.prototype.refresh = function(e) {
  let hash = this.parsehash(location.hash.slice(1))
  this.currentUrl = '/' + (hash.route || '')
  this.routes[this.currentUrl](hash.param)
}

Router.prototype.init = function () {
  this.refresh()
  window.addEventListener('hashchange', this.refresh.bind(this), false)
}

Router.prototype.parsehash = function (hash) {
  const hashinfo = hash.split('/')
  return {
    route: hashinfo[1],
    param: hashinfo[2] || ''
  }
}

module.exports = Router
