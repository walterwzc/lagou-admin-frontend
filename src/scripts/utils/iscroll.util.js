var poslistTpl = require('../../templates/poslist.html')

module.exports = {
  scroll: function (options) {

    var opt = {
      tpl: poslistTpl,
      loadmoreSize: 5
    }

    opt = Object.assign({}, opt, options)

    // 页码计数器
    var pageCount = 1

    // 定义开始时候初始位置
    var topSize = 40

    // IScroll初始化
    var myScroll = new IScroll('#main-scroll', {
        probeType: 3,
        mouseWheel: true
    });

    // 将初始位置上移 topSize, 保证开始的时候loading隐藏
    myScroll.scrollBy(0, -topSize);

    // 获得头部Loading,尾部的loading是否是拉动以后的状态
    var head = $('.head img'),
        topImgHasClass = head.hasClass('up');
    var foot = $('.foot img'),
        bottomImgHasClass = head.hasClass('down');

    // 监听滚动事件
    myScroll.on('scroll', function () {
        var y = this.y,
            maxY = this.maxScrollY - y;

        // 判断下拉边界
        if (y >= 0) {
            !topImgHasClass && head.addClass('up');
            return '';
        }

        // 判断下拉边界
        if (maxY >= 0) {
            !bottomImgHasClass && foot.addClass('down');
            return '';
        }
    });

    // 监听滚动结束事件
    myScroll.on('scrollEnd', function () {
        // 为防止下拉高度不足 topSize, 去刷新页面
        if (this.y >= -topSize && this.y < 0) {
            myScroll.scrollTo(0, -topSize);
            head.removeClass('up');
        } else if (this.y >= 0) {
            head.attr('src', '/static/images/ajax-loader.gif');
            // ajax下拉刷新数据
            $.ajax({
              url: '/api/listmore.php',
              data: {
                pageNo: 2,
                pageSize: 2
              },
              success: function (res) {
                refreshPoslist = template.render(opt.tpl, JSON.parse(res).content.data.page)
                $('#main main ul li:eq(0)').after(refreshPoslist)

                // 复位
                myScroll.scrollTo(0, -topSize);
                head.removeClass('up');
                head.attr('src', '/static/images/arrow.png');
                myScroll.refresh();
              }
            })
        }

        // 为防止上拉高度不足 topSize, 去刷新页面
        var self = this;
        var maxY = this.maxScrollY - this.y;
        if (maxY > -topSize && maxY < 0) {
            myScroll.scrollTo(0, self.maxScrollY + topSize);
            foot.removeClass('down')
        } else if (maxY >= 0) {
            foot.attr('src', '/static/images/ajax-loader.gif');
            // ajax上拉加载数据
            $.ajax({
              url: '/api/listmore.php',
              data: {
                pageNo: ++pageCount,
                pageSize: opt.loadmoreSize
              },
              success: function (res) {
                loadmorePoslist = template.render(opt.tpl, JSON.parse(res).content.data.page)
                $('#main main ul li:last').before(loadmorePoslist)

                // 复位
                myScroll.refresh();
                myScroll.scrollTo(0, self.y + topSize);
                foot.removeClass('down');
                foot.attr('src', '/static/images/arrow.png');
              }
            })
        }
    })
  }
}
