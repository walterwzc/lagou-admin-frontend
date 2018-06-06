const listView = require('../views/position-list.html')
const paginationView = require('../views/position-pagination.html')
const addView = require('../views/position-add.html')
const editView = require('../views/position-edit.html')
const navView = require('../views/nav.html')

const userController = require('./UserController')

const render = pageno => {
    let newNavHtml = template.render(navView, {
        title: '职位管理',
        subtitle: '职位列表',
        navLevel1: '职位管理',
        navLevel2: '列表',
        url: '#/position'
    })
    $('#nav').html(newNavHtml)

    renderPositionList(pageno)
}

async function renderPositionList(pageno) {
    const issignin = JSON.parse(await userController.auth())
    if (!issignin.data.issignin) {
        location.hash = '/'
        return
    }
    pageno = parseInt(pageno || 0, 10)
    $.ajax({
        url: '/api/position/list/' + pageno,
        success: result => {
            if (result.ret) {
                const { pagesize, total } = result.data
                const pagecount = Math.ceil(total / pagesize)
                if (pageno < pagecount && pageno >= 0) {
                    const html = template.render(listView, {
                        data: result.data.result,
                        pageno,
                        hasResult: true
                    })
                    $('.content').html(html)

                    renderPositionPagination({
                        pageno,
                        pagecount,
                        pagesize
                    })

                    $('.btn-danger').on('click', async function() {
                        if (confirm('真的要删除吗')) {
                            let id = $(this).attr('id')
                            let result = await removePosition(id)
                            if (result) {
                                renderPositionList(pageno)
                            } else {
                                alert('数据删除失败~')
                            }
                        }
                    })

                    search()
                } else {
                    location.hash = '/position/' + (pageno - 1)
                }
            }
        }
    })
}

function renderPositionPagination({ pageno, pagecount, pagesize }) {
    $('#pagination').html(
        template.render(paginationView, {
            pageno,
            pagecount,
            pagesize
        })
    )
}

function removePosition(id) {
    return $.ajax({
        url: `/api/position/remove/${id}`
    }).then(result => {
        return result.data
    })
}

function search() {
    $('#searchSubmit').on('click', function() {
        doSearch()
    })
    $('body').on('keyup', function(e) {
        if (e.keyCode == 13) {
            doSearch()
        }
    })
}

function doSearch() {
    let keywords = $('#search').val()
    $.ajax({
        url: '/api/position/search',
        type: 'POST',
        data: {
            keywords
        },
        success: result => {
            let data = result.data
            let hasResult = data.length > 0 ? true : false
            let html = template.render(listView, {
                data: result.data,
                hasResult
            })
            $('.content').html(html)
        }
    })
}

const add = () => {
    $('.content').html(addView)
    let newNavHtml = template.render(navView, {
        title: '职位管理',
        subtitle: '职位添加',
        navLevel1: '职位管理',
        navLevel2: '添加',
        url: '#/position'
    })
    $('#nav').html(newNavHtml)

    $('#addSubmit')
        .off('click')
        .on('click', function() {
            let options = {
                success: handleSuccess,
                resetForm: true,
                dataType: 'json'
            }
            $('#addForm').ajaxSubmit(options)

            function handleSuccess(data, status) {
                if (data.ret) {
                    alert(data.data.message)
                }
            }
        })
}

const edit = id => {
    const params = id.split('|')
    let newNavHtml = template.render(navView, {
        title: '职位管理',
        subtitle: '职位编辑',
        navLevel1: '职位管理',
        navLevel2: '编辑',
        url: '#/position'
    })
    $('#nav').html(newNavHtml)

    $.ajax({
        url: `/api/position/item/${params[0]}`,
        success: result => {
            if (result.ret) {
                const html = template.render(editView, result.data)
                $('.content').html(html)

                bindEditSubmit(params[1])
            }
        }
    })
}

function bindEditSubmit(pageno) {
    $('#editSubmit')
        .off('click')
        .on('click', function(e) {
            let options = {
                success: handleSuccess,
                resetForm: true,
                dataType: 'json'
            }
            $('#editForm').ajaxSubmit(options)

            function handleSuccess(data, status) {
                if (data.ret) {
                    // 不刷新页面，读取缓存里的内容
                    // history.back()

                    // 刷新页面
                    location.hash = '/position/' + pageno
                }
            }
        })
}

module.exports = {
    render,
    add,
    edit
}
