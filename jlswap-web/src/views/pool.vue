<template>
    <div class="jlswap-pool">
        <div class='poolList-container' v-show="showAdd===0">
            <div class="title">
                <div class="tip">Standard AMM </div>
                <el-tooltip popper-class='standardTip' :visible-arrow='false' effect="dark" content="Standard AMM：Liquidity providers earn 0.25% fee whenever a trade is made on JmlSwap proportional to their share of the pool. Fees are added to the pool and can be claimed anytime by withdrawing your liquidity" placement="right">
                    <div class="setting el-icon-warning-outline"></div>
                </el-tooltip>
            </div>
            <div class='userState' v-if='fromAddress'>
                <div  v-if='network'>
                    <div class='poolList' v-loading="loading">
                        <div v-for='i,index in allLp' :key='index'>
                            <div class='poolItem' v-if="i.show">
                                <div class='top'>
                                    <div class='left'>
                                        <div class='img'><img :src="getImg(i.from)" alt=""></div>
                                        <div class='img'><img :src="getImg(i.to)" alt=""></div>
                                        <div class='tokens'>{{i.from}} / {{i.to}}</div>
                                    </div>
                                    <div :class="i.close?'right':'right arrowUp'" @click='openOrClose(index,i.address)'>manage</div>
                                </div>
                                <div class='infoDiv' v-show='!i.close' v-loading='lpLoading'>
                                    <div class='info'>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Pooled {{i.from}}：</div>
                                            <div class='infoRight'>{{ getShowBalance(i.token0Balance) }}</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Pooled {{i.to}}： </div>
                                            <div class='infoRight'>{{ getShowBalance(i.token1Balance) }}</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Your proportion in the Liquidity Pool： </div>
                                            <div class='infoRight'>{{getProportion(i.proportion)}}</div>
                                        </div>
                                    </div>
                                    <div class='options'>
                                        <div class='optBtn add' @click="showAddDia(i.from,i.to)">Add to</div>
                                        <div class='optBtn remove' @click='showRemove(i.from,i.to,i.token0Balance,i.token1Balance,i.address)'>Remove</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class='addDiv'>
                        <div class='add' @click="addPool">Add</div>
                    </div>
                </div>
                <div class='connectWallet' v-else>Network Error</div>
            </div>
            <div class='loginState' v-else>
                <div class='connectWallet'  @click='connect'>Connect Wallet</div>
            </div>

        </div>
        <pool-add v-show="showAdd===1" ref='poolAdd' @goback="goback" @showWait='showWait' @hideWait='hideWait' @showSuccess='showSuccess' @showFail='showFail'></pool-add>
        <pool-remove v-show="showAdd===2" ref='poolRemove' @goback="goback" @showWait='showWait' @hideWait='hideWait' @showSuccess='showSuccess' @showFail='showFail'></pool-remove>
        <confirm-wait ref="confirmWait"></confirm-wait>
        <confirm-success ref="confirmSuccess"></confirm-success>
        <confirm-fail ref="confirmFail"></confirm-fail>
    </div>
</template>
<script>
import Web3 from 'web3'
import { chainId } from '../constants/common'
import { pairAbi } from '../constants/abi/pairAbi'
import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../store/index'
import C from '../constants/contractAddress'
import { multicallAbi } from '../constants/abi/multicall'
import PoolAdd from '../components/pool/poolAdd.vue'
import PoolRemove from '../components/pool/poolRemove.vue'
import ConfirmWait from '../components/swap/waitDia.vue'
import ConfirmSuccess from '../components/swap/success.vue'
import ConfirmFail from '../components/swap/fail.vue'
export default {
    name: '',
    components: {
        PoolAdd, PoolRemove, ConfirmWait, ConfirmSuccess, ConfirmFail
    },
    data () {
        return {
            showAdd: 0,
            loading: true,
            lpLoading: false,
            chainId: chainId
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'network', 'allToken', 'allLp', 'provider'])
    },
    methods: {
        ...mapActions(baseInfoStore, ['changeFromAddress', 'changeNetwork', 'connect']),
        goback() {
            this.showAdd = 0
            this.init()
        },
        addPool() {
            this.$refs.poolAdd.show('', '')
            this.showAdd = 1
        },
        showAddDia(token0, token1) {
            this.$refs.poolAdd.show(token0, token1)
            this.showAdd = 1
        },
        showRemove(token0, token1, token0Balance, token1Balance, address) {
            this.$refs.poolRemove.show(token0, token1, token0Balance, token1Balance, address, this.allToken)
            this.showAdd = 2
        },
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
        },
        getImg(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].icon
                }
            }
        },
        // 保留5位小数
        getShowBalance(val) {
            const balance = Math.floor(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        getTokenDecimals(val) {
            for (const i of this.allToken) {
                if (val === i.name) {
                    return i.decimals
                }
            }
        },
        getProportion(val) {
            const percent = (val * 100).toFixed(2)
            if (percent < 0.01) {
                return '<0.01%'
            } else {
                return percent + '%'
            }
        },
        getTokenName(val) {
            const web3 = new Web3(this.provider)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].name
                }
            }
        },
        async openOrClose(index, address) {
            for (const i in this.allLp) {
                if (Number(i) === index) {
                    this.allLp[i].close = !this.allLp[i].close
                    if (!this.allLp[i].close) {
                        // 获取池子里token额度和兑换比例
                        this.lpLoading = true
                        const web3 = new Web3(this.provider)
                        const pool = new web3.eth.Contract(pairAbi, address)
                        const calls = [
                            {
                                target: this.allLp[i].address,
                                callData: pool.methods.balanceOf(this.fromAddress).encodeABI()
                            },
                            {
                                target: this.allLp[i].address,
                                callData: pool.methods.totalSupply().encodeABI()
                            },
                            {
                                target: this.allLp[i].address,
                                callData: pool.methods.getReserves().encodeABI()
                            }
                        ]
                        const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
                        const { returnData } = await multicallContract.methods.aggregate(calls).call()
                        const lpBalance = web3.eth.abi.decodeParameter('uint256', returnData[0])
                        const totalSupply = web3.eth.abi.decodeParameter('uint256', returnData[1])
                        const reserves = web3.eth.abi.decodeParameters(['uint112', 'uint112', 'uint32'], returnData[2])
                        this.$set(this.allLp[i], 'proportion', lpBalance / totalSupply)
                        const token0 = this.allLp[i].from
                        const token1 = this.allLp[i].to
                        const decimals0 = this.getTokenDecimals(token0)
                        const decimals1 = this.getTokenDecimals(token1)
                        const token0Balance = reserves[0] * this.allLp[i].proportion / Math.pow(10, decimals0)
                        const token1Balance = reserves[1] * this.allLp[i].proportion / Math.pow(10, decimals1)
                        this.$set(this.allLp[i], 'token0Balance', token0Balance)
                        this.$set(this.allLp[i], 'token1Balance', token1Balance)
                        this.lpLoading = false

                        // pool.methods.balanceOf(this.fromAddress).call().then(res => {
                        //     const lpBalance = res
                        //     pool.methods.totalSupply().call().then(res1 => {
                        //         const totalSupply = res1
                        //         // this.allLp[i].proportion = lpBalance / totalSupply
                        //         pool.methods.getReserves().call().then(res => {
                        //             this.$set(this.allLp[i], 'proportion', lpBalance / totalSupply)
                        //             const reserves = res
                        //             const token0 = this.allLp[i].from
                        //             const token1 = this.allLp[i].to
                        //             const decimals0 = this.getTokenDecimals(token0)
                        //             const decimals1 = this.getTokenDecimals(token1)
                        //             const token0Balance = reserves._reserve0 * this.allLp[i].proportion / Math.pow(10, decimals0)
                        //             const token1Balance = reserves._reserve1 * this.allLp[i].proportion / Math.pow(10, decimals1)
                        //             this.$set(this.allLp[i], 'token0Balance', token0Balance)
                        //             this.$set(this.allLp[i], 'token1Balance', token1Balance)
                        //             this.lpLoading = false
                        //         })
                        //     })
                        // })
                        // const reserves = await pool.methods.getReserves().call()
                        // const token0 = this.allLp[i].from
                        // const token1 = this.allLp[i].to
                        // const decimals0 = this.getTokenDecimals(token0)
                        // const decimals1 = this.getTokenDecimals(token1)
                        // const totalSupply = await pool.methods.totalSupply().call()
                        // this.allLp[i].proportion = lpBalance / totalSupply
                        // const token0Balance = reserves._reserve0 * (lpBalance / totalSupply) / Math.pow(10, decimals0)
                        // const token1Balance = reserves._reserve1 * (lpBalance / totalSupply) / Math.pow(10, decimals1)
                        // this.allLp[i].token0Balance = token0Balance
                        // this.allLp[i].token1Balance = token1Balance
                    }
                }
            }
        },
        // 监听账户切换
        onChangeAccount() {
            if (this.provider) {
                const that = this
                this.provider.on('accountsChanged', function(res) {
                    that.changeFromAddress(res[0])
                    if (!that.fromAddress) {
                        that.showAdd = 0
                    }
                    that.init()
                })
            }
        },
        // 监听链是否正确
        onChangeChain() {
            if (this.provider) {
                const that = this
                this.provider.on('chainChanged', function(val) {
                    const chainId = Web3.utils.numberToHex(that.chainId)
                    if (val !== chainId) {
                        that.changeNetwork(false)
                        that.showAdd = 0
                    } else {
                        that.changeNetwork(true)
                        that.init()
                    }
                })
            }
        },
        async initList() {
            const web3 = new Web3(this.provider)
            this.loading = true
            const calls = this.allLp.map(lp => {
                const contractAddress = lp.address
                const pool = new web3.eth.Contract(pairAbi, contractAddress)
                return {
                    target: lp.address,
                    callData: pool.methods.balanceOf(this.fromAddress).encodeABI()
                }
            })
            const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
            const { returnData } = await multicallContract.methods.aggregate(calls).call()
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'close', true)
                const lpBalance = web3.eth.abi.decodeParameter('uint256', returnData[i])
                if (lpBalance > 0) {
                    this.$set(this.allLp[i], 'show', true)
                } else {
                    this.$set(this.allLp[i], 'show', false)
                }
            }
            // for (const i in this.allLp) {
            //     this.$set(this.allLp[i], 'close', true)

            //     const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
            //     // const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
            //     const calls = [
            //         {
            //             target: this.allLp[i].address,
            //             callData: pool.methods.balanceOf(this.fromAddress).encodeABI()
            //         }
            //     ]
            //     const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
            //     const { returnData } = await multicallContract.methods.aggregate(calls).call()
            //     const lpBalance = web3.eth.abi.decodeParameter('uint256', returnData[0])
            //     if (lpBalance > 0) {
            //         this.$set(this.allLp[i], 'show', true)
            //     } else {
            //         this.$set(this.allLp[i], 'show', false)
            //     }
            // }
            this.loading = false
        },
        // 初始化
        async init() {
            if (this.provider) {
                const web3 = new Web3(this.provider)
                const accountAddress = await web3.eth.getAccounts()
                this.changeFromAddress(accountAddress[0])
                if (this.fromAddress) {
                    const chainAddress = await web3.eth.getChainId()
                    if (chainAddress.toString() === this.chainId.toString()) {
                        this.changeNetwork(true)
                    } else {
                        this.changeNetwork(false)
                    }
                    if (this.network) {
                        // this.getTokenScale()
                        this.initList()
                    }
                }
            } else {
                console.log('请安装MetaMask钱包')
            }
        }
    },
    mounted() {
        this.init()
        this.onChangeAccount()
        this.onChangeChain()
    }
}
</script>
<style lang="less" scoped>
.jlswap-pool{
    display: flex;
    align-items: center;
    justify-content: center;
    .poolList-container{
        width: 480px;
        // box-shadow: 0px 1px 1px 1px rgba(0,0,0,0.5);
        margin:10vh 0 50px;
        min-height: 350px;
        background: #F5F8FC;
        border-radius: 15px;
        padding: 20px 15px 20px;
        box-sizing: border-box;
        position: relative;
        display: flex;
        flex-direction: column;
        .title{
            display: flex;
            justify-content: space-between;
            align-items: center;
            .tip{
                font-size: 20px;
                font-weight: bold;
            }
            .setting{
                font-size: 18px;
                cursor: pointer;
                font-weight: bold;
            }
        }
        .userState{
            flex:1;
            margin-top: 20px;
            .poolList{
                min-height: 200px;
                max-height: 260px;
                overflow-y: auto;
                // padding:30px 0 0;
                box-sizing: border-box;
                .poolItem{
                    background: #B7E3E9;
                    border-radius: 8px;
                    padding:15px 10px;
                    margin-bottom: 15px;
                    .infoDiv{
                        margin-top: 15px;
                        padding:0 5px;
                        .info{
                            background: #FFFFFF;
                            border-radius: 17px;
                            padding:15px ;
                            box-sizing: border-box;
                            .infoItem{
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                margin-bottom: 10px;
                                font-size: 14px;
                                color:#6D7278;
                            }
                            .infoItem:last-child{
                                margin-bottom: 0;
                            }
                        }
                        .options{
                            display: flex;
                            align-items: center;
                            justify-content: space-around;
                            margin-top: 15px;
                            .optBtn{
                                cursor: pointer;
                                color: #E02020;
                                font-size: 18px;
                                font-weight: bold;
                            }
                        }
                    }
                }
                .top{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .left{
                        display: flex;
                        .img{
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            margin-right: 10px;
                            background: #fff;
                            img{
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                            }
                        }
                        .tokens{
                            font-size: 20px;
                            line-height: 20px;
                            font-weight: bold;
                            color: #FFFFFF;
                            display: flex;
                            align-items: center;
                        }
                    }
                    .right{
                        font-size: 16px;
                        color:#fff;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                    }
                    .right::after{
                        display: block;
                        content:'';
                        width: 16px;
                        height: 16px;
                        background: url('../assets/arrowDown.png') no-repeat;
                        background-size: 100% 100%;
                        margin-left: 10px;
                        margin-right: 15px;
                        transition: all 0.3s;
                    }
                    .arrowUp::after{
                        transform: rotate(180deg);
                    }
                }
            }
            .addDiv{
                display: flex;
                margin-top: 20px;
                .add{
                    flex:1;
                    height: 52px;
                    background: #E02020;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color:#fff;
                    font-size: 18px;
                    font-weight: 500;
                   // margin-right: 5px;
                }
                .import{
                    flex:1;
                    margin-left: 5px;
                    height: 52px;
                    border: 1px solid #E02020;
                    box-sizing: border-box;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #000000;
                    font-size: 18px;
                    font-weight: 500;
                }
            }
        }
        .loginState{
            flex:1;
        }
        .connectWallet{
            height: 52px;
            background: #CE2D32;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color:#fff;
            font-size: 18px;
            font-weight: 500;
            margin-top: 200px;
        }
    }
}
</style>
<style lang="less">
.standardTip{
    max-width: 360px;
    background: #E9EEF4!important;
    border-radius: 8px;
    padding:10px;
    font-size: 14px;
    color: #000000!important;
    line-height: 18px;
    box-sizing: border-box;
}
</style>
