<template>
    <div class="jlswap-pool">
        <div class='poolList-container'>
            <div class="title">
                <div class="tip">Standard AMM </div>
                <el-tooltip popper-class='standardTip' :visible-arrow='false' effect="dark" content="Standard AMM：Liquidity providers earn 0.25% fee whenever a trade is made on JmlSwap proportional to their share of the pool. Fees are added to the pool and can be claimed anytime by withdrawing your liquidity" placement="right">
                    <div class="setting el-icon-warning-outline"></div>
                </el-tooltip>
            </div>
            <div class='userState' v-if='fromAddress'>
                <div  v-if='network'>
                    <div class='poolList'>
                        <div v-for='i,index in allLp' :key='index'>
                            <div class='poolItem' v-if='i.show'>
                                <div class='top'>
                                    <div class='left'>
                                        <div class='img'><img :src="getImg(i.from)" alt=""></div>
                                        <div class='img'><img :src="getImg(i.to)" alt=""></div>
                                        <div class='tokens'>{{i.from}} / {{i.to}}</div>
                                    </div>
                                    <div :class="i.close?'right':'right arrowUp'" @click='openOrClose(index)'>manage</div>
                                </div>
                                <div class='infoDiv' v-show='!i.close'>
                                    <div class='info'>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Total Tokens in Liquidity Pool：</div>
                                            <div class='infoRight'>0.00000006134</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Tokens in the reward pool：</div>
                                            <div class='infoRight'>0</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Pool {{i.from}}：</div>
                                            <div class='infoRight'>0.039</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>To pool {{i.to}}： </div>
                                            <div class='infoRight'>0.1036</div>
                                        </div>
                                        <div class='infoItem'>
                                            <div class='infoLeft'>Your proportion in the Liquidity Pool： </div>
                                            <div class='infoRight'>&lt;0.01%</div>
                                        </div>
                                    </div>
                                    <div class='options'>
                                        <div class='optBtn add'>Add to</div>
                                        <div class='optBtn remove'>Remove</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class='addDiv'>
                        <div class='add'>Add</div>
                        <div class='import'>Import</div>
                    </div>
                </div>
                <div class='connectWallet' v-else>Network Error</div>
            </div>
            <div class='loginState' v-else>
                <div class='connectWallet'  @click='connect'>Connect Wallet</div>
            </div>

        </div>
    </div>
</template>
<script>
import utils from '../utils/storage'
import Web3 from 'web3'
import { tokenList } from '../constants/tokens'
import { lpList } from '../constants/lpList'
import { pairAbi } from '../constants/abi/pairAbi'
export default {
    name: '',
    data () {
        return {
            fromAddress: '',
            network: utils.load('network'),
            allToken: tokenList,
            allLp: lpList,
            chainId: 137
        }
    },
    methods: {
        getImg(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].icon
                }
            }
        },
        async initList() {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'close', true)
                const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
                console.log(lpBalance)
                if (lpBalance > 0) {
                    this.$set(this.allLp[i], 'show', true)
                } else {
                    this.$set(this.allLp[i], 'show', false)
                }
            }
        },
        openOrClose(index) {
            for (const i in this.allLp) {
                if (Number(i) === index) {
                    this.allLp[i].close = !this.allLp[i].close
                }
            }
        },
        connect() {
            if (window.ethereum) {
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
                    this.fromAddress = res[0]
                    this.connectWeb3()
                })
            } else {
                // 唤起失败，跳转metaMask
                window.open('https://metamask.io/')
            }
        },
        // 连接web3,切换节点
        async connectWeb3() {
            if (window.ethereum) {
                const that = this
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{
                            chainId: Web3.utils.numberToHex(that.chainId) // 目标链ID
                        }]
                    })
                    that.network = true
                    utils.put('network', true)
                } catch (e) {
                    console.log(e.code)
                    if (e.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: Web3.utils.numberToHex(that.chainId),
                                        chainName: 'Polygon',
                                        nativeCurrency: {
                                            name: 'matic',
                                            symbol: 'MATIC',
                                            decimals: 18
                                        },
                                        rpcUrls: ['https://polygon.llamarpc.com'],
                                        blockExplorerUrls: ['https://polygonscan.com']
                                    }
                                ]
                            })
                            that.network = true
                            utils.put('network', true)
                        } catch (error) {
                        }
                    } else if (e.code === 4001) {

                    } else {
                        that.network = false
                        utils.put('network', false)
                    }
                }
            }
        },
        // 监听账户切换
        onChangeAccount() {
            if (window.ethereum) {
                const that = this
                window.ethereum.on('accountsChanged', function(res) {
                    that.fromAddress = res[0]
                    that.init()
                })
            }
        },
        // 监听链是否正确
        onChangeChain() {
            if (window.ethereum) {
                const that = this
                window.ethereum.on('chainChanged', function(val) {
                    const chainId = Web3.utils.numberToHex(that.chainId)
                    if (val !== chainId) {
                        that.network = false
                        utils.put('network', false)
                    } else {
                        that.network = true
                        utils.put('network', true)
                        that.init()
                    }
                })
            }
        },
        // 初始化
        async init() {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                const fromAddress = await web3.eth.getAccounts()
                this.fromAddress = fromAddress[0]
                if (this.fromAddress) {
                    const netId = await web3.eth.getChainId()
                    if (this.chainId === netId) {
                        this.network = true
                        utils.put('network', true)
                        this.initList()
                    } else {
                        this.network = false
                        utils.put('network', false)
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
        width: 730px;
        margin:10vh 0 50px;
        min-height: 350px;
        background: #F5F8FC;
        border-radius: 15px;
        padding:50px 40px 30px;
        position: relative;
        display: flex;
        flex-direction: column;
        .title{
            display: flex;
            justify-content: space-between;
            align-items: center;
            .tip{
                font-size: 28px;
                font-weight: bold;
            }
            .setting{
                font-size: 26px;
                cursor: pointer;
                font-weight: bold;
            }
        }
        .userState{
            flex:1;
            .poolList{
                min-height: 350px;
                max-height: 480px;
                overflow-y: auto;
                padding:30px 0 0;
                box-sizing: border-box;
                .poolItem{
                    background: #B7E3E9;
                    border-radius: 8px;
                    padding:20px 10px;
                    margin-bottom: 15px;
                    .infoDiv{
                        margin-top: 20px;
                        padding:0 5px;
                        .info{
                            background: #FFFFFF;
                            border-radius: 17px;
                            padding:15px 20px;
                            box-sizing: border-box;
                            .infoItem{
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                margin-bottom: 10px;
                                font-size: 15px;
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
                            margin-top: 20px;
                            .optBtn{
                                cursor: pointer;
                                color: #E02020;
                                font-size: 20px;
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
                            width: 54px;
                            height: 54px;
                            border-radius: 50%;
                            margin-right: 15px;
                            img{
                                width: 100%;
                                height: 100%;
                            }
                        }
                        .tokens{
                            font-size: 20px;
                            font-weight: bold;
                            color: #FFFFFF;
                            display: flex;
                            align-items: center;
                        }
                    }
                    .right{
                        font-size: 20px;
                        color:#fff;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                    }
                    .right::after{
                        display: block;
                        content:'';
                        width: 18px;
                        height: 18px;
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
                    height: 70px;
                    background: #E02020;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color:#fff;
                    font-size: 20px;
                    font-weight: 500;
                    margin-right: 5px;
                }
                .import{
                    flex:1;
                    margin-left: 5px;
                    height: 70px;
                    border: 1px solid #E02020;
                    box-sizing: border-box;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #000000;
                    font-size: 20px;
                    font-weight: 500;
                }
            }
        }
        .loginState{
            flex:1;
        }
        .connectWallet{
            height: 70px;
            background: #CE2D32;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color:#fff;
            font-size: 20px;
            font-weight: 500;
            margin-top: 200px;
        }
    }
}
</style>
<style lang="less">
.standardTip{
    width: 420px;
    background: #E9EEF4!important;
    border-radius: 8px;
    padding:20px 20px;
    font-size: 16px;
    color: #000000!important;
    line-height: 18px;
    box-sizing: border-box;
}
</style>
