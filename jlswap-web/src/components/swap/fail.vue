<template>
    <div>
        <el-dialog
            title=""
            custom-class='confirmFail'
            top="20vh"
            :visible.sync="confirmWait"
        >
            <div class="waitContent">
                <div class="img"></div>
                <div class="waitTip">Transaction rejected</div>
                <div class="info">{{ message }}</div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: '',
    data () {
        return {
            confirmWait: false,
            message: 'Dismiss'
        }
    },
    methods: {
        show(val) {
            this.confirmWait = true
            this.message = val || 'Dismiss'
        }
    }
}
</script>
<style lang="less">
.confirmFail{
    border-radius: 10px;
    background: #F5F8FC;
    padding:2.08vw 1.04vw;
    width: 480px;
    .el-dialog__header{
        padding:0;
    }
    .el-dialog__body{
        padding:0;
    }
    .waitContent{
        padding-bottom:10px;
        .img{
            width: 72px;
            height: 72px;
            background: url('../../assets/fail.png') no-repeat;
            background-size: 100% 100%;
            // border-radius: 50%;
            margin:0 auto;
            margin-top: 20px;
        }
        .waitTip{
            font-size: 20px;
            font-weight: 600;
            color: #000000;
            margin-top: 20px;
        }
        .info{
            font-size: 16px;
            font-weight: 400;
            color: #000000;
            margin-top: 30px;
            max-height: 350px;
            overflow-y: auto;
        }
        .see{
            color: #E02020;
            cursor: pointer;
        }
    }
}
</style>
