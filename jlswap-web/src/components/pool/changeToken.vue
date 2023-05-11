<template>
    <div class="changeToken">
        <el-dialog
            title="Choose Token"
            custom-class='tokenList'
            top="15vh"
            :visible.sync="tokenListShow"
        >
            <div class="listContent" v-loading="loading">
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
// import Web3 from 'web3'
// import { ERC20 } from '../../constants/abi/ERC20'
import { nativeToken, nativeToErc20Token, farmToken, erc20Token1, erc20Token2 } from '../../constants/common'
import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../../store/index'
export default {
    name: '',
    data () {
        return {
            tokenListShow: false,
            tableData: [],
            switchToken: 1,
            loading: true
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['allToken'])
    },
    methods: {
        ...mapActions(baseInfoStore, ['aggregateBalance']),
        async show1(token1, token2) {
            this.tableData = this.allToken
            for (const i in this.tableData) {
                // if (this.tableData[i].name === token1 || this.tableData[i].name === token2) {
                //     this.tableData[i].disable = true
                // } else {
                //     this.tableData[i].disable = false
                // }
                // if ((token2 === nativeToErc20Token || token2 === nativeToken) && this.tableData[i].name === nativeToErc20Token) {
                //     this.tableData[i].disable = true
                // }
                // if ((token2 === nativeToErc20Token || token2 === nativeToken) && this.tableData[i].name === nativeToken) {
                //     this.tableData[i].disable = true
                // }
                if (token2 === erc20Token2) {
                    if (this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (token2 === farmToken) {
                    if (this.tableData[i].name === erc20Token1 || this.tableData[i].name === nativeToken || this.tableData[i].name === nativeToErc20Token) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (token2 === erc20Token1) {
                    if (this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = true
                    } else {
                        this.tableData[i].disable = false
                    }
                }
                if (token2 === nativeToErc20Token || token2 === nativeToken) {
                    if (this.tableData[i].name === farmToken || this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (!token2) {
                    this.tableData[i].disable = false
                }
            }
            this.switchToken = 1
            this.loading = true
            this.tokenListShow = true
            await this.aggregateBalance()
            this.loading = false
        },
        async show2(token1, token2) {
            this.tableData = this.allToken
            for (const i in this.tableData) {
                // if (this.tableData[i].name === token1 || this.tableData[i].name === token2) {
                //     this.tableData[i].disable = true
                // } else {
                //     this.tableData[i].disable = false
                // }
                // if ((token1 === nativeToErc20Token || token1 === nativeToken) && this.tableData[i].name === nativeToErc20Token) {
                //     this.tableData[i].disable = true
                // }
                // if ((token1 === nativeToErc20Token || token1 === nativeToken) && this.tableData[i].name === nativeToken) {
                //     this.tableData[i].disable = true
                // }
                if (token1 === erc20Token2) {
                    if (this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (token1 === farmToken) {
                    if (this.tableData[i].name === erc20Token1 || this.tableData[i].name === nativeToken || this.tableData[i].name === nativeToErc20Token) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (token1 === erc20Token1) {
                    if (this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = true
                    } else {
                        this.tableData[i].disable = false
                    }
                }
                if (token1 === nativeToErc20Token || token1 === nativeToken) {
                    if (this.tableData[i].name === farmToken || this.tableData[i].name === erc20Token1) {
                        this.tableData[i].disable = false
                    } else {
                        this.tableData[i].disable = true
                    }
                }
                if (!token1) {
                    this.tableData[i].disable = false
                }
            }
            this.switchToken = 2
            this.loading = true
            this.tokenListShow = true
            await this.aggregateBalance()
            this.loading = false
        },
        getShowBalance(val) {
            const balance = Math.floor(val * Math.pow(10, 5)) / Math.pow(10, 5)
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
        // 获取所有代币余额
        // async getAllBalance() {
        //     if (window.ethereum) {
        //         const web3 = new Web3(window.ethereum)
        //         for (const i of this.allToken) {
        //             if (i.name === nativeToken) { // 原生币通过钱包获取余额
        //                 web3.eth.getBalance(this.fromAddress, (err, res) => {
        //                     if (!err) {
        //                         const balance = res / Math.pow(10, 18)
        //                         i.balance = balance
        //                     }
        //                 })
        //             } else {
        //                 i.balance = await this.getTokenBalance(i.address, i.decimals)
        //             }
        //         }
        //     }
        // },
        // // 获取代币余额
        // async getTokenBalance(address, decimals) {
        //     const web3 = new Web3(window.ethereum)
        //     const contractAddress = address
        //     const ethContract = new web3.eth.Contract(ERC20, contractAddress)
        //     const balance = await ethContract.methods.balanceOf(this.fromAddress).call()
        //     const balanceVal = balance / Math.pow(10, decimals)
        //     return balanceVal
        // }
    }
}
</script>
<style lang="less">
.changeToken{
    .tokenList{
        border-radius: 10px;
        background: #F5F8FC;
        padding:2.08vw 1.04vw;
        width: 400px;
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
            margin-top: 20px;
        }
        .item{
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            border-radius: 15px;
            padding:10px 15px;
            padding-right: 30px;
            font-weight: 600;
            color: #000000;
            font-size: 18px;
            margin-top: 3px;
            .left{
                display:flex;
                align-items: center;
            }
            .img{
                width: 40px;
                height: 40px;
                // background: #C4C2C2;
                border-radius: 50%;
                margin-right: 10px;
                background: #fff;
                img{
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
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
