/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    im = require('imagemagick'),
    goodsModel = require('../models/goods'),
    inventoryModel = require('../models/inventory'),
    goodsForm = require('../forms/goods').goodsForm,
    inventoryForm = require('../forms/goods').inventoryForm;

exports.goods = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    goodsModel.getGoods(page, pagesize, function(err, goods){
        fnNext( _t.ar.view({'goods': goods}) );
    });
};

exports.goods_add = function(fnNext){
    fnNext( this.ar.view() );
}

exports.goods_add_post = function(fnNext){
    var _t = this, r = {'success':false}, upImg = this.req.files && this.req.files.goodsImage;
    if(upImg){
        var goods = new goodsForm(_t.req.post);
        if(!goods.isValid()){
            r.error = goods.validErrors;
            return fnNext( this.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
        }
        var is = fs.createReadStream(upImg.path),
            sPath = upImg.path.split('/'),
            sName = upImg.name.split('.'),
            toName = sPath[sPath.length-1] + '.' + sName[sName.length-1],
            toPath = path.join(Settings.projectDir, 'static', 'images', 'goods', 'n', toName),
            os = fs.createWriteStream( toPath );
        
        util.pump(is, os, function(err) {
            if(err){
                r.error = err.message;
                fnNext( _t.ar.json(r) );
            }else{
                goods = goods.fieldDatas();
                goods.image_name = toName;
                goods.on_sale = true;
                goods.stocks = 0; //库存
                goods.price = 0; //进货价
                if(_t.req.post.recommend){
                    goods.recommend = true;
                }
                goods.created_at = goods.updated_at = new Date();
                goods.updated_historys = [{
                    type: 'add',
                    user_name: _t.req.user.name,
                    process_at: new Date()
                }];
                goodsModel.insert(goods, {safe:true},
                    function(err, _goods){
                        if(err || !_goods || !_goods.length){
                            r.error = '更新数据库失败';
                        }else{
                            r.success = true;
                            r.goods = _goods[0];
                        }
                        im.resize({
                          srcPath: toPath,
                          dstPath: path.join(Settings.projectDir, 'static', 'images', 'goods', 's', toName),
                          width:   200,
                          height:  200
                        }, function(){
                            fnNext( _t.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
                        });
                    }
                );
            }
            fs.unlink(upImg.path);
        });
        
    }else{
        r.error = '选择要上传的图片';
        fnNext( this.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
    }
};

exports.goods_edit = function(fnNext){
    var _t = this,
        goodsId = this.routeData.args.param;
        
    goodsModel.findById(goodsId, function(err, goods){
        var r = {isEdit:true, goods: goods}
        fnNext( _t.ar.view(r) );
    });
}

exports.goods_edit_post = function(fnNext){
    var _t = this, goods_id = this.req.post.goods_id,
        r = {'success':false}, upImg = this.req.files && this.req.files.goodsImage;
    if(!goods_id){
        r.error = '未指定要编辑的商品id';
        return fnNext( this.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
    }
    
    var goods = new goodsForm(_t.req.post);
    if(!goods.isValid()){
        r.error = goods.validErrors;
        return fnNext( this.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
    }
    
    function updateGoodsInfo(toImgName){
        goods = goods.fieldDatas();
        /*
        var last_stocks = _t.req.post.last_stocks;
        if(Number(last_stocks) === goods.stocks){
            delete goods.stocks;
        }
        */
        if(toImgName){
            goods.image_name = toName;
        }
        goods.recommend = _t.req.post.recommend ? true : false;
        goods.updated_at = new Date();
        var history = {type:'edit', user_name:_t.req.user.name, process_at: new Date()};
        goodsModel.updateById(goods_id, {'$set': goods, '$push':{updated_historys: history} }, {safe:true}, 
            function(err, _goods){
                if(err || !_goods){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                    r.goods = goods;
                }
                fnNext( _t.ar.raw(JSON.stringify(r), 'text/html;charset=UTF-8') );
            }
        );
    }
    
    if(upImg){
        var is = fs.createReadStream(upImg.path),
            sPath = upImg.path.split('/'),
            sName = upImg.name.split('.'),
            toName = sPath[sPath.length-1] + '.' + sName[sName.length-1],
            toPath = path.join(Settings.projectDir, 'static', 'images', 'goods', 'n', toName),
            os = fs.createWriteStream( toPath );
        
        util.pump(is, os, function(err) {
            if(err){
                r.error = err.message;
                fnNext( _t.ar.json(r) );
            }else{
                im.resize({
                  srcPath: toPath,
                  dstPath: path.join(Settings.projectDir, 'static', 'images', 'goods', 's', toName),
                  width:   200,
                  height:  200
                }, function(){
                    updateGoodsInfo(toName);
                });
            }
            fs.unlink(upImg.path);
        });
        
    }else{
        updateGoodsInfo();
    }
};

/*****
 * 下架商品
 * PS： 需求改了，暂时没用
 */
exports.goods_change_sale_status = function(fnNext){
    var _t = this, 
        goods_id = this.req.post.goods_id,
        sale_status = this.req.post.sale_status,
        r = {'success':false};
    if(!goods_id || !sale_status){
        r.error = '参数错误';
        return fnNext( this.ar.json(r) );
    }
    
    sale_status = sale_status === '1' ? true : false;
    goodsModel.updateById(goods_id, {'$set': {on_sale: sale_status} },  {safe:true},
        function(err, _goods){
            if(err || !_goods){
                r.error = '更新数据库失败';
            }else{
                r.success = true;
            }
            fnNext( _t.ar.json(r) );
        }
    );
};

/*****
 * 进货、损耗
 */
exports.goods_inventory_post = function(fnNext){
    var _t = this, r = {success:false}, inventory = new inventoryForm(_t.req.post);
    if(!inventory.isValid()){
        r.error = inventory.validErrors;
        return fnNext( this.ar.json(r) );
    }
    
    inventory = inventory.fieldDatas();
    goodsModel.findById(inventory.goods_id, function(err, goods){
        if(err || !goods){
            r.error = '商品不存在';
            return fnNext( _t.ar.json(r) );
        }
        if(inventory.type === 0 && goods.stocks < inventory.quantity){
            r.error = '商品库存比损耗值低，当前库存仅为：' + goods.stocks;
            return fnNext( _t.ar.json(r) );
        }
        inventory.goods_id = goods._id;
        inventory.goods_title = goods.title;
        inventory.user_name = _t.req.user.name;
        inventory.created_at = inventory.updated_at = new Date();
        inventoryModel.insert(inventory, {safe:true}, function(err, inv){
            if(!err && inv && inv.length){
                goodsModel.updateById(
                    inventory.goods_id.toString(), 
                    {
                        '$set':{'price': inventory.price}, 
                        '$inc':{'stocks': inventory.type === 0 ? -inventory.quantity : inventory.quantity}
                    },
                    {safe:true}, 
                    function(err, counts){
                        r.success = true;
                        r.inventory = inv[0];
                        return fnNext( _t.ar.json(r) );
                });
            }else{
                r.error = '更新数据库失败';
                return fnNext( _t.ar.json(r) );
            }
            
        });
    });
    
};

/******
 * 上传图片
 */
//exports.goods_image_upload_post = function(fnNext){
//    var r = {'success':false};
//    if(this.req.files && this.req.files.qqfile){
//        
//    }else{
//        r.error = '错误的参数';
//        fnNext( this.ar.json(r) );
//    }
//};