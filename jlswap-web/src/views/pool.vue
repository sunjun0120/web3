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
                                    <div :class="i.close?'right':'right arrowUp'" @click='openOrClose(index)'>manage</div>
                                </div>
                                <div class='infoDiv' v-show='!i.close'>
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
import utils from '../utils/storage'
import Web3 from 'web3'
import { tokenList } from '../constants/tokens'
import { lpList } from '../constants/lpList'
import { pairAbi } from '../constants/abi/pairAbi'
import { ERC20 } from '../constants/abi/ERC20'
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
            fromAddress: utils.load('fromAddress'),
            network: utils.load('network'),
            allToken: tokenList,
            allLp: lpList,
            showAdd: 0,
            loading: true,
            chainId: 137
        }
    },
    methods: {
        goback() {
            this.showAdd = 0
            this.init()
        },
        addPool() {
            this.$refs.poolAdd.show('USDC', '')
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
        getBalance(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.getShowBalance(this.allToken[i].balance)
                }
            }
        },
        // 保留5位小数
        getShowBalance(val) {
            const balance = Math.round(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        // 获取代币余额
        async getTokenBalance(address, decimals) {
            const web3 = new Web3(window.ethereum)
            const contractAddress = address
            const fromAddress = await web3.eth.getAccounts()
            const ethContract = new web3.eth.Contract(ERC20, contractAddress)
            const balance = await ethContract.methods.balanceOf(fromAddress[0]).call()
            const balanceVal = balance / Math.pow(10, decimals)
            return balanceVal
        },
        async getAllBalance() {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                if (this.fromAddress) {
                    const netId = await web3.eth.getChainId()
                    if (this.chainId === netId) {
                        for (const i of this.allToken) {
                            if (i.name === 'MATIC') { // 原生币通过钱包获取余额
                                web3.eth.getBalance(this.fromAddress, (err, res) => {
                                    if (!err) {
                                        const balance = res / Math.pow(10, 18)
                                        i.balance = balance
                                    }
                                })
                            } else {
                                if (i.address) {
                                    i.balance = await this.getTokenBalance(i.address, i.decimals)
                                } else {
                                    i.balance = 0
                                }
                            }
                        }
                    }
                } else {
                    for (const i of this.allToken) {
                        i.balance = 0
                    }
                }
            }
        },
        getTokenDecimals(val) {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].decimals
                }
            }
        },
        getProportion(val) {
            let percent
            if ((val / 100).length > 6) {
                percent = (val / 100).toFixed(6)
            } else {
                percent = (val / 100)
            }
            if (percent < 0.01) {
                return '<0.01%'
            } else {
                return percent + '%'
            }
        },
        async initList() {
            const web3 = new Web3(window.ethereum)
            this.loading = true
            // await this.getAllBalance()
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'close', true)
                const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
                // console.log(lpBalance)
                this.allLp[i].lpBalance = lpBalance
                if (lpBalance > 0) {
                    this.$set(this.allLp[i], 'show', true)
                } else {
                    this.$set(this.allLp[i], 'show', false)
                }
                // 获取池子里token额度和兑换比例
                const reserves = await pool.methods.getReserves().call()
                const token0 = await pool.methods.token0().call()
                const token1 = await pool.methods.token1().call()
                const decimals0 = this.getTokenDecimals(token0)
                const decimals1 = this.getTokenDecimals(token1)
                const totalSupply = await pool.methods.totalSupply().call()
                this.allLp[i].proportion = lpBalance / totalSupply
                const token0Balance = reserves._reserve0 * (lpBalance / totalSupply) / Math.pow(10, decimals0)
                const token1Balance = reserves._reserve1 * (lpBalance / totalSupply) / Math.pow(10, decimals1)
                this.allLp[i].token0Balance = token0Balance
                this.allLp[i].token1Balance = token1Balance
                const exchangeRate = token1Balance / token0Balance
                const name0 = this.getTokenName(token0)
                const name1 = this.getTokenName(token1)
                this.getBaseVal(name0, name1, exchangeRate)
            }
            this.loading = false
        },
        getBaseVal(name0, name1, scale) {
            for (const i of this.allToken) {
                if (i.name === 'USDC') {
                    i.baseVal = 1
                }
                if (name0 === 'USDC') {
                    if (i.name === name1) {
                        i.baseVal = scale
                    }
                }
                if (name0 === 'WMATIC' && name1 === 'USDC') {
                    if (i.name === name0) {
                        i.baseVal = 1 / scale
                    }
                    if (i.name === 'MATIC') {
                        i.baseVal = 1 / scale
                    }
                }
            }
        },
        getTokenName(val) {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].name
                }
            }
        },
        async openOrClose(index) {
            for (const i in this.allLp) {
                if (Number(i) === index) {
                    this.allLp[i].close = !this.allLp[i].close
                }
            }
        },
        connect() {
            if (window.ethereum) {
                const that = this
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
                    that.fromAddress = res[0]
                    utils.put('fromAddress', that.fromAddress)
                    that.connectWeb3()
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
                    utils.put('fromAddress', that.fromAddress)
                    if (!that.fromAddress) {
                        that.showAdd = 0
                    }
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
                        that.showAdd = 0
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
                utils.put('fromAddress', this.fromAddress)
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
