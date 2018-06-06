const UserController = require('./controllers/UserController')
const PositionController = require('./controllers/PositionController')
const LayoutController = require('./controllers/LayoutController')
const Router = require('./utils/router.util')

UserController.render()
LayoutController.render()

const router = new Router()
router.route('/', LayoutController.render)
router.route('/position', PositionController.render)
router.route('/add', PositionController.add)
router.route('/edit', PositionController.edit)
router.init()

// activeClass： 使leftmenu 在刷新页面的时候自动高亮
$('#leftMenu li').on('click', function () {
    $(this)
        .addClass('active')
        .siblings()
        .removeClass('active')
})

const hash = location.hash

$('#leftMenu li')
    .find("a[href='" + hash + "']")
    .parent()
    .addClass('active')
    .siblings()
    .removeClass('active')