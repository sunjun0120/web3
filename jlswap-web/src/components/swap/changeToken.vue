<template>
    <div class="changeToken">
        <el-dialog
            title="Choose Token"
            custom-class='tokenList'
            top="15vh"
            :visible.sync="tokenListShow"
        >
            <div class="listContent">
                <div :class="i.disable?'item disable':'item'" v-for="i,index in tableData" :key="index" @click="changeToken(i)">
                    <div class="left">
                        <div class="img"><img :src="i.icon" alt=""></div>
                        <div class="name">{{i.name}}</div>
                    </div>
                    <div class="right">{{getShowBalance(i.balance)}}</div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: '',
    data () {
        return {
            tokenListShow: false,
            tableData: [],
            switchToken: 1
        }
    },
    methods: {
        show1(token1, token2, val) {
            this.tableData = val
            for (const i in this.tableData) {
                if (this.tableData[i].name === token1 || this.tableData[i].name === token2) {
                    this.tableData[i].disable = true
                } else {
                    this.tableData[i].disable = false
                }
            }
            this.switchToken = 1
            this.tokenListShow = true
        },
        show2(token1, token2, val) {
            this.tableData = val
            for (const i in this.tableData) {
                if (this.tableData[i].name === token1 || this.tableData[i].name === token2) {
                    this.tableData[i].disable = true
                } else {
                    this.tableData[i].disable = false
                }
            }
            this.switchToken = 2
            this.tokenListShow = true
        },
        getShowBalance(val) {
            const balance = Math.round(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        changeToken(item) {
            if (!item.disable) {
                if (this.switchToken === 1) {
                    this.$emit('changeToken1', item)
                    this.tokenListShow = false
                } else {
                    this.$emit('changeToken2', item)
                    this.tokenListShow = false
                }
            }
        }
    }
}
</script>
<style lang="less">
.changeToken{
    .tokenList{
        border-radius: 10px;
        background: #F5F8FC;
        padding:2.08vw 1.04vw;
        width: 590px;
        .el-dialog__header{
            padding:0;
            padding-left: 10px;
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            text-align: left;
        }
        .el-dialog__headerbtn{
            top:2.28vw;
        }
        .el-dialog__body{
            padding:0;
        }
        .listContent{
            max-height: 460px;
            overflow-y: auto;
            margin-top: 40px;
        }
        .item{
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            border-radius: 16px;
            padding:10px 15px;
            padding-right: 30px;
            font-weight: 600;
            color: #000000;
            font-size: 26px;
            margin-top: 3px;
            .left{
                display:flex;
                align-items: center;
            }
            .img{
                width: 54px;
                height: 54px;
                // background: #C4C2C2;
                border-radius: 50%;
                margin-right: 30px;
                img{
                    width: 100%;
                    height: 100%;
                }
            }
        }
        .item:hover{
            background: #E9EEF4;
        }
        .disable{
            color: rgba(0,0,0,0.25);
        }
        .disable:hover{
            background:#F5F8FC;
            cursor:not-allowed;
        }
    }
}

</style>
