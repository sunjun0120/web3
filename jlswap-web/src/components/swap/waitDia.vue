<template>
    <div>
        <el-dialog
            title=""
            custom-class='confirmWait'
            top="15vh"
            :visible.sync="confirmWait"
        >
            <div class="waitContent">
                <div class="img" v-loading="loading"></div>
                <div class="waitTip">Waiting for confirmation</div>
                <div class="info">将{{msg1}}换成{{msg2}}</div>
                <div class="info">（Confirm the transaction in the wallet）</div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: '',
    data () {
        return {
            loading: true,
            confirmWait: false,
            msg1: '',
            msg2: ''
        }
    },
    methods: {
        show(message1, message2) {
            this.msg1 = message1
            this.msg2 = message2
            this.confirmWait = true
        },
        hide() {
            this.confirmWait = false
        }
    }
}
</script>
<style lang="less">
.confirmWait{
    border-radius: 10px;
    background: #F5F8FC;
    padding:2.08vw 1.04vw;
    width: 590px;
    .el-dialog__header{
        padding:0;
    }
    .el-dialog__body{
        padding:0;
    }
    .waitContent{
        padding-bottom: 40px;
        .img{
            width: 100px;
            height: 100px;
            background: #D8D8D8;
            border-radius: 50%;
            margin:0 auto;
            margin-top: 40px;
        }
        .waitTip{
            font-size: 28px;
            font-weight: 600;
            color: #000000;
            margin-top: 20px;
        }
        .info{
            font-size: 20px;
            font-weight: 400;
            color: #000000;
            margin-top: 30px;
        }
    }
    .el-loading-mask{
        background-color:#F5F8FC;
    }
}
</style>
