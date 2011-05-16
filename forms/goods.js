/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var forms = n2Mvc.forms;

exports.goodsForm = forms.newForm({
    title:{
        required: true,
        required_msg: '商品名称必填'
    }
  , value:{
        required: true,
        required_msg: '商品售价必填',
        number: true,
        number_msg: '商品售价必须为数字'
    }
    /*
  , price:{
        required: true,
        required_msg: '商品进货价必填',
        number: true,
        number_msg: '商品进货价必须为数字'
    }
  , stocks:{
        required: true,
        required_msg: '商品库存数量必填',
        number: true,
        number_msg: '商品库存必须为数字'
    }
    */
  , des:{
        required: false
    }
});

exports.inventoryForm = forms.newForm({
    price:{
        required: true,
        required_msg: '商品进货价必填',
        number: true,
        number_msg: '商品进货价必须为数字'
    }
  , quantity:{
        required: true,
        required_msg: '商品数量必填',
        number: true,
        number_msg: '商品数量必须为数字'
    }
  , goods_id:{
        required: true,
        required_msg: '商品id必须'
    }
  , type:{
        required: true,
        required_msg: '进货或者损耗必须标识',
        range: [0, 1],
        number_msg: '进货或者损耗标识必须为1或者0'
    }
});

