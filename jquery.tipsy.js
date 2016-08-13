// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx, tip) {
        return (typeof thing == 'function') ? (thing.call(ctx, tip)) : thing;
    };
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0], $tip);
               
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
                this.$tip.data('tipsy-pointee', this.$element[0]);
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        // 因为我们使用jquery 1.11+版本, live已经不使用了, 所以切换成 on
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'on' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            if(binder === 'on'){
                $(document.body)
                    .on(eventIn, this.selector, enter)
                    .on(eventOut, this.selector, leave);
            }else{
                this[binder](eventIn, enter)[binder](eventOut, leave);
            }
        
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };

    $(function(){
        // mlp project auto tooltip based on jquery.tipsy.js above
        /**
         * usage: 
         *      html: <a data-mlpTip='tooltipMsg'>消息</a>
         *      js: var tooltipMsg = 'mlp project auto tooltip';
         */
        $('[data-mlpTip]').tipsy({
            live: true,
            html: true,
            title: function() {
                var content = null;
                try{
                    content = eval(this.getAttribute('data-mlpTip'));
                    return (typeof content == 'function') ? (content.call(this)) : content;
                }catch(e){
                    return "无效的值 <b style='color:red'>" + this.getAttribute('data-mlpTip') + "</b>";
                }
            },
            /**
             * yields a closure of the supplied parameters, producing a function that takes
             * no arguments and is suitable for use as an autogravity function like so:
             *
             * @param margin (int) - distance from the viewable region edge that an
             *        element should be before setting its tooltip's gravity to be away
             *        from that edge.
             * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
             *        if there are no viewable region edges effecting the tooltip's
             *        gravity. It will try to vary from this minimally, for example,
             *        if 'sw' is preferred and an element is near the right viewable 
             *        region edge, but not the top edge, it will set the gravity for
             *        that element's tooltip to be 'se', preserving the southern
             *        component.
             */
            gravity: function($tip) {
                var margin = this.getAttribute('data-mlpTip-margin') ? Number(this.getAttribute('data-mlpTip-margin')) : 5;
                var prefer = this.getAttribute('data-mlpTip-pos') ? this.getAttribute('data-mlpTip-pos') : 'n';
                var dir = {
                        ns: prefer[0],
                        ew: (prefer.length > 1 ? prefer[1] : false)
                    },
                    $this = $(this);
                // 当前只考虑了 prefer = 'n' 时候的情况, 其他方向自行脑补判断
                // 元素靠近下边， 考虑tip的内容高度 + margin 是否足够显示在屏幕中,否则选择 将 tip方向放于 下方(n);
                if( ($(window).height() + $(document).scrollTop() - $this.offset().top) < ( margin + $tip.height() + 5) ) dir.ns = 's';
                // 元素靠近右边， 考虑tip的内容长度的一半 是否足够显示在屏幕中,否则选择 将 tip方向放于 左侧(e);
                if( ($(window).width() + $(document).scrollLeft() - $this.offset().left) < ( 5 + 0.5* $tip.width())) dir.ns = 'e';
                // 元素靠近左边， 考虑tip的内容长度的一半 是否足够显示在屏幕中,否则选择 将 tip方向放于 右侧(w);
                if( $this.offset().left < ( 5 + 0.5* $tip.width()) ) dir.ns = 'w';
                return dir.ns;
            }
        });    
    })
})(jQuery);