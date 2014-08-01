START_DATA = [
    {
        num: 1,
        score: 1,
        fruitImage: res.star_b
    },
    {
        num: 2,
        score: 2,
        fruitImage: res.star_g
    },
    {
        num: 3,
        score: 2,
        fruitImage: res.star_p
    },
    {
        num: 4,
        score: 3,
        fruitImage: res.star_r
    },
    {
        num: 5,
        score: 5,
        fruitImage: res.star_y
    }
];




var HelloWorldLayer = cc.Layer.extend({

    sprite:null,
    numX:0,
    numY:0,
    starTable:null,
    sameColors:null,
    colxStars:null,
    colyStars:null,
    aroundStars:null,
    AroundSame:null,



    ctor:function () {

        this._super();
        this.numX = 10;
        this.numY = 10;
        this.starSize = 72;
        this.sameColors = [];
        this.initTable();
        this.checkAll();


        if( 'touches' in cc.sys.capabilities ){
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                onTouchEnded: function(touches, event){
                    var l = touches.length, target = event.getCurrentTarget();
                    for( var i=0; i < l; i++) {
                        target.addSprite( touches[i].getLocation() );
                    }
                }
            }, this);
        } else if( 'mouse' in cc.sys.capabilities ){
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseMove:this.TouchBegan
            }, this);}

    },

    random:function(len){
        return  Math.floor(Math.random()*(len-1))
    },
    TouchBegan:function(event){

        var target = event.getCurrentTarget();
        var loc = event.getLocation();

        for (var i = 0; i < target.starTable.length; i++) {
            var sprites = target.starTable[i];
            for (var j = 0; j < sprites.length; j++) {
                var pSprite0 = sprites[j];
                if (pSprite0) {
                    var ccRect = pSprite0.getBoundingBox();
                    if (cc.rectContainsPoint(ccRect, loc)) {
                        this.pSelectedSprite = pSprite0;
                        var scaleAction = cc.Sequence.create(
                            cc.ScaleTo.create(0.2, 1.2), cc.DelayTime.create(0.25), cc.ScaleTo.create(0.2, 1))
                        this.pSelectedSprite.runAction(scaleAction);
                        break;
                    }
                }
            }
        }
    },
    createStart:function(colx,coly){

        var randomStar = START_DATA[this.random(START_DATA.length)];
        var starSprite = cc.Sprite.create(randomStar.fruitImage);
        starSprite.setAnchorPoint(cc.p(0.5, 0.5));
        starSprite.setPosition(cc.p(36 + colx * this.starSize,1300));
        starSprite.colx = colx;
        starSprite.coly = coly;
        starSprite.num = randomStar.num
        starSprite.setLocalZOrder(100);

        var flowTime = coly / 10;
        var fallAction = cc.MoveTo.create(flowTime, cc.p(36 + colx * this.starSize,
            36 + coly * this.starSize));
        starSprite.runAction(fallAction);
        return starSprite;

    },

    initTable:function(){


        this.starTable = new Array(this.numX);
        for (var i = 0; i < this.numX; i++) {
            var sprites = new Array(this.numY);
            for (var j = 0; j < this.numY; j++) {
                var pSprite0 = this.createStart(i, j);
                if (pSprite0 != null) {
                    this.addChild(pSprite0);
                }

                sprites[j] = pSprite0;
            }
            this.starTable[i] = sprites;
        }

    },
    checkAll:function(){

        for (var i = 0;i < this.starTable.length;i++){
            var stars =  this.starTable[i];
            for (var j = 0;j < stars.length;j++){
                var star = stars[j];
                this.checkAround(star);
                this.checckSame(star);

            }
        }

        for (var i = 0;i< this.sameColors.length;i++ ){

            var star = this.sameColors[i];
            this.starTable[star.colx][star.coly] = null;

            var action = cc.Sequence.create(
                cc.DelayTime.create(2),
                cc.ScaleTo.create(0.2, 1.2),
                cc.ScaleTo.create(0.2, 1),
                cc.DelayTime.create(0.2),
                cc.RemoveSelf.create()
            );
            star.runAction(action);

        }

        this.scheduleOnce(this.fall,5)
    },
    fall:function(){

        for (var i = 0; i < this.starTable.length; i++) {
            var sprites = this.starTable[i];
            for (var j = 0; j < sprites.length; j++) {
                var pSprite0 = sprites[j];
                if (pSprite0 == null) {
                    var k = j + 1
                    while (k <= this.numY) {
                        var upSprite = sprites[k];
                        if (upSprite != null) {
                            upSprite.colx = i;
                            upSprite.coly = j;
                            this.starTable[i][j] = upSprite;
                            this.starTable[i][k] = null;
                            var fallAction = cc.MoveTo.create(upSprite.coly / 10, cc.p(36 + i * this.starSize,
                                36 + j* this.starSize));
                            upSprite.runAction(fallAction);
                            break;
                        }
                        k++;
                    }
                }

            }
        }
        this.scheduleOnce(this.full,2)
    },
    full:function(){

        for (var i = 0; i < this.starTable.length; i++) {
            var sprites = this.starTable[i];
            for (var j = 0; j < sprites.length; j++) {
                var pSprite0 = sprites[j];
                if (pSprite0 == null) {

                    var pSprite0 = this.createStart(i, j)
                    if (pSprite0 != null) {
                        this.addChild(pSprite0);
                    };
                    this.starTable[i][j] = pSprite0;
                }
            }
        }
    },
    checkAround:function(star){
        this.aroundStars = [0,0,0,0]
        this.AroundSame = [0,0,0,0]
        var Num = star.num;
        var colx = star.colx;
        var coly = star.coly;

        if (colx > 0){
            var LeftStar = this.starTable[colx-1][coly];
            if(LeftStar.num == Num){

                this.AroundSame[0] = 1;

            }
            this.aroundStars[0] = LeftStar;
        }
        if(colx < 9){
            var RightStar = this.starTable[colx+1][coly];
            if(RightStar.num == Num){

                this.AroundSame[1] = 1;

            }
            this.aroundStars[1] = RightStar;
        }
        if(coly > 0){
            var DownStar = this.starTable[colx][coly-1];
            if(DownStar.num == Num){

                this.AroundSame[2] = 1;

            }
            this.aroundStars[2] = DownStar;
        }
        if(coly < 9){
            var Uptar = this.starTable[colx][coly+1];
            if(Uptar.num == Num){

                this.AroundSame[3] = 1;

            }
            this.aroundStars[3] = Uptar;
        }


    },
    checkAroundSame:function(around,star){

        var num = star.num;
        var aroundStars = around;
        var AroundSame = [0,0,0,0];

        for (var i = 0;i < aroundStars.length;i++){
            var aroundStar = aroundStars[i]
            if(aroundStar != 0 && aroundStar.num == num  )
            {
                AroundSame[i] = 1
            }
        }
        return  AroundSame

    },
    checckSame:function(star){

        var baseNum = star.num;
        var colx = star.colx;
        var coly = star.coly;
        this.colxStars = [];
        this.colyStars = [];

        if(this.aroundStars[0] != 0 && this.aroundStars[0].num == baseNum ){

            this.colxStars.push(this.aroundStars[0]);
            var left = this.aroundStars[0].colx - 1;

            while (left >= 0  ) {
                if(this.starTable[left][coly].num == baseNum ){

                    this.colxStars.push(this.starTable[left][coly]);
                    left -= 1

                }else{
                    break
                }

            }
        }
        if(this.aroundStars[1] != 0 && this.aroundStars[1].num == baseNum ){

            this.colxStars.push(this.aroundStars[1]);
            var right = this.aroundStars[1].colx + 1;

            while (right <= 9  ) {
                if(this.starTable[right][coly].num == baseNum ){

                    this.colxStars.push(this.starTable[right][coly]);
                    right += 1

                }else{
                    break
                }

            }
        }

        if (this.colxStars.length > 1){

            for (var i = 0; i < this.colxStars.length;i++  ){

                var roundStart =  this.colxStars[i];

                if(this.sameColors.indexOf(roundStart) < 0 ){

                    this.sameColors.push(roundStart);

                }
            }
        }
        if(this.aroundStars[2] != 0 && this.aroundStars[2].num == baseNum ){

            this.colyStars.push(this.aroundStars[2]);
            var Dwon = this.aroundStars[2].coly - 1;

            while (Dwon >= 0  ) {
                if(this.starTable[colx][Dwon].num == baseNum ){

                    this.colyStars.push(this.starTable[colx][Dwon]);
                    Dwon -= 1

                }else{
                    break
                }

            }
        }
        if(this.aroundStars[3] != 0 && this.aroundStars[3].num == baseNum ){

            this.colyStars.push(this.aroundStars[3]);
            var up = this.aroundStars[3].coly + 1;

            while (up <= 9  ) {
                if(this.starTable[colx][up].num == baseNum ){

                    this.colyStars.push(this.starTable[colx][up]);
                    up += 1

                }else{
                    break
                }

            }
        }

        if (this.colyStars.length > 1){

            for (var i = 0; i < this.colyStars.length;i++  ){
                var roundStart =  this.colyStars[i];
                if(this.sameColors.indexOf(roundStart) < 0 ){

                    this.sameColors.push(roundStart);

                }
            }
        }

    }



});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

