const userView = require('../views/users.html')

const wsCache = new WebStorageCache()

const auth = () => {
    // 用户权限认证
    return $.ajax({
        dataType: 'json',
        url: '/api/users/issignin', // RESTful API

        // 携带token(在localstorage里)
        headers: {
            'X-Access-Token': wsCache.get('token')
        },
        success: result => {
            return result
        }
    })
}

// 渲染用户信息
const render = async () => {
    // const ret = JSON.parse(await auth())
    const ret = await auth()
    console.log(ret)

    // 应用art-template模板渲染
    let tpl = template.render(userView, {
        issignin: ret.data.issignin,
        username: ret.data.username
    })
    $('.user-menu').html(tpl)
    $('#user-submit').text('注销')
    setBtnInfo()
    signup()
}

// 设置提交按钮的类型信息
const setBtnInfo = () => {
    $('#user-status').on('click', e => {
        $('#username').val('')
        $('#password').val('')
        switch (e.target.innerText) {
            case '注册':
                $('#user-submit').text('注册')
                break
            case '登录':
                $('#user-submit').text('登录')
                break
        }
    })
}

// 根据按钮的信息做（登录，注册）处理
const signup = () => {
    $('#user-submit').on('click', () => {
        switch ($('#user-submit').text()) {
            case '登录':
                doSignin()
                break
            case '注册':
                doSignup()
                break
            case '注销':
                doSignout()
                break
        }
    })
}

// 注册
const doSignup = () => {
    const username = $('#username').val()
    const password = $('#password').val()

    $.ajax({
        url: '/api/users/signup',
        method: 'POST',
        data: {
            username,
            password
        },
        success: res => {
            // TODO
        }
    })
}

// 登录
const doSignin = () => {
    const username = $('#username').val()
    const password = $('#password').val()

    $.ajax({
        url: '/api/users/signin',
        method: 'POST',
        data: {
            username,
            password
        },
        success: res => {
            const d = JSON.parse(res).data
            if (d.success) {
                // 将username, token 保存在localstorage里
                wsCache.set('username', d.username, {
                    exp: 3600 * 24
                })
                wsCache.set('token', d.token, {
                    exp: 3600 * 24
                })

                // 刷新页面，重新认证
                location.reload()
            } else {
                console.log('登录失败。')
            }
        }
    })
}

const doSignout = () => {
    wsCache.delete('username')
    wsCache.delete('token')
    location.reload()
}

module.exports = {
    render,
    auth
}