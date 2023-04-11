<template>
    <div class="jlswap-farm">
        <!-- <div class='top'>
            <div class="left">
                <div class="tip">Farms TVL</div>
                <div class="num">$ 17,154,843</div>
            </div>
            <div class="right">
                <div class="tip">My Holdings</div>
                <div class="num">$ 0.00</div>
            </div>
        </div> -->
        <div class='middle'>
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="Farms List" name="All">
                    <farm-table  @showWait='showWait' @hideWait='hideWait' @showSuccess='showSuccess' @showFail='showFail'></farm-table>
                </el-tab-pane>
                <!-- <el-tab-pane label="Myfarms" name="Myfarms"><farm-table></farm-table></el-tab-pane> -->
            </el-tabs>
        </div>
        <confirm-wait ref="confirmWait"></confirm-wait>
        <confirm-success ref="confirmSuccess"></confirm-success>
        <confirm-fail ref="confirmFail"></confirm-fail>
    </div>
</template>
<script>
import FarmTable from '../components/farm/table.vue'
import ConfirmWait from '../components/swap/waitDia.vue'
import ConfirmSuccess from '../components/swap/success.vue'
import ConfirmFail from '../components/swap/fail.vue'
export default {
    name: '',
    components: {
        FarmTable, ConfirmWait, ConfirmSuccess, ConfirmFail
    },
    data () {
        return {
            activeName: 'All'
        }
    },
    methods: {
        handleClick() {},
        showWait(val) {
            this.$refs.confirmWait.show(val)
        },
        hideWait() {
            this.$refs.confirmWait.hide()
        },
        showSuccess(val) {
            this.$refs.confirmSuccess.show(val)
        },
        showFail(val) {
            this.$refs.confirmFail.show(val)
        }
    }
}
</script>
<style lang="less" scoped>
.jlswap-farm{
    .top{
        display: flex;
        margin-top: 40px;
        margin-bottom: 60px;
        .tip{
            font-size: 18px;
            font-weight: 500;
            color: rgba(0,0,0,0.85);
            font-weight: bold;
        }
        .num{
            font-weight: 500;
            color: #E02020;
            font-size: 24px;
            margin-top: 15px;
            font-weight: bold;
        }
        .left{
            flex:1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .right{
            flex:1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
<style lang='less'>
.jlswap-farm{
    .middle{
        .el-tabs{
            padding:0 10vw;
            .el-tabs__nav-wrap::after{
                height:0;
            }
            .el-tabs__nav{
                display: flex;
                align-items: center;
            }
            .el-tabs__item{
                height: 40px;
                padding:10px 20px;
                font-size: 18px;
                color: rgba(0,0,0,0.85);
                display: flex;
                align-items: center;
                border-radius: 20px;
                margin-right: 15px;
            }
            .el-tabs__item.is-active{
                background: #DAE7F9;
                font-weight: bold;
            }
            .el-tabs__active-bar{
                height: 0;
            }
        }
    }
}
</style>
