const homeView = require('../views/home.html')
const navView = require('../views/nav.html')

const render = () => {
    $('.content').html(homeView)
    let newNavHtml = template.render(navView, {
        title: '首页',
        subtitle: '欢迎信息',
        navLevel1: '首页',
        navLevel2: 'welcome',
        url: '#/'
    })
    $('#nav').html(newNavHtml)
}
module.exports = {
    render
}
