<template>
    <div>
        <el-dialog
            title=""
            custom-class='confirmSuccess'
            top="15vh"
            :visible.sync="confirmWait"
        >
            <div class="waitContent">
                <div class="img"></div>
                <div class="waitTip">Transaction submitted</div>
                <div class="info see" @click="goUrl">View in browser</div>
                <!-- <div class="info">将USDC加入MateMask</div> -->
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { explorerHost } from '../../constants/common'
export default {
    name: '',
    data () {
        return {
            confirmWait: false,
            url: ''
        }
    },
    methods: {
        show(val) {
            this.url = val
            this.confirmWait = true
        },
        goUrl() {
            window.open(explorerHost + '/tx/' + this.url)
        }
    }
}
</script>
<style lang="less">
.confirmSuccess{
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
        padding-bottom: 10px;
        .img{
            width: 72px;
            height: 72px;
            background: url('../../assets/success.png') no-repeat;
            background-size: 100% 100%;
            // border-radius: 50%;
            margin:0 auto;
            margin-top: 40px;
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
        }
        .see{
            color: #E02020;
            cursor: pointer;
        }
    }
}
</style>
