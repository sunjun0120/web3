<template>
  <div class='farmTable'>
    <div class='title'>
        <div class='titleName leftName'>Featured</div>
        <div class='titleName second'>Total Value</div>
        <div class='titleName third'>Daily Reward</div>
        <div class='titleName rightName'>APR</div>
        <div class="options"></div>
    </div>
    <div class='content'>
        <div class='itemDiv' v-for='i,index in allLp' :key='index'>
            <div class="item" v-if="i.stakeToken">
                <div class='itemInfo' >
                    <div class='itemName leftName'>
                        <div class='img'><img :src="getImg(i.from)" alt=""></div>
                        <div class='img'><img :src="getImg(i.to)" alt=""></div>
                        <div class='tokens'>{{i.from}} / {{ i.to }}</div>
                    </div>
                    <div class='itemName second'>${{ i.farmValue }}</div>
                    <div class='itemName third'>
                        <div class='tokenInfoDiv'>
                            <div class='tokenInfo'>
                                <div class='tokenImg'><img :src="getImg('JLS')" alt=""></div>
                                <div class='infoDesc'>{{ i.rewardRate }} JLS/day</div>
                            </div>
                            <!-- <div class='tokenInfo'>
                                <div class='tokenImg'><img :src="getImg(i.to)" alt=""></div>
                                <div class='infoDesc'>2018 {{i.to}}/day</div>
                            </div> -->
                        </div>
                    </div>
                    <div class='itemName rightName'>{{ i.apr }}</div>
                    <div class="optionsBtn">
                        <div :class="i.close?'manage el-icon-arrow-down':'manage el-icon-arrow-down arrowUp'" @click="openOrClose(index)"></div>
                    </div>
                </div>
                <div class='optionsContainer' v-show='!i.close'>
                    <div class='farmContentDiv' v-if="fromAddress">
                        <div class="farmContent" v-if="network">
                            <div class='farmLeft'>
                                <div class='balanceTip'>Available: {{getNum(i.lpBalance)}} LP（${{getTwoPrice(i.lpBalanceValue)}}）</div>
                                <div class='pledgeInputDiv'>
                                    <div class='pledge'>
                                        <el-input v-model="i.pledgeVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                                    </div>
                                    <div class='max' @click="pledgeMax(index)">greatest amount</div>
                                </div>
                                <div class='pledgeBtn'>pledge</div>
                            </div>
                            <div class='farmRight'>
                                <div class='balanceTip'>Deposited: {{getNum(i.personLpNum)}} LP（${{getTwoPrice(i.personLpValue)}}）</div>
                                <div class='pledgeInputDiv'>
                                    <div class='pledge'>
                                        <el-input v-model="i.releaseVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                                    </div>
                                    <div class='max' @click="releaseMax(index)">greatest amount</div>
                                </div>
                                <div class='pledgeBtn'>release mortgage</div>
                            </div>
                        </div>
                        <div class='connect' v-else>
                            <div class='connectTip'>Please switch network</div>
                            <div class='connectBtn'>Network Error</div>
                        </div>
                    </div>
                    <div class='connect' v-else>
                        <div class='connectTip'>Connect to a Wallet to start farm</div>
                        <div class='connectBtn' @click="connect">Connect Wallet</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { tokenList } from '../../constants/tokens'
import { lpList } from '../../constants/lpList.js'
import utils from '../../utils/storage'
import Web3 from 'web3'
import { chainId } from '../../constants/common'
import { pairAbi } from '../../constants/abi/pairAbi'
import { farmAbi } from '../../constants/abi/farmAbi'
export default {
    name: '',
    data () {
        return {
            fromAddress: utils.load('fromAddress'),
            network: utils.load('network'),
            chainId: chainId,
            allToken: tokenList,
            allLp: lpList
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
        openOrClose(index) {
            for (const i in this.allLp) {
                if (Number(i) === index) {
                    this.allLp[i].close = !this.allLp[i].close
                }
            }
        },
        pledgeMax(index) {
            if (Number(this.allLp[index].lpBalance) > 0) {
                this.allLp[index].pledgeVal = this.allLp[index].lpBalance
            }
        },
        releaseMax(index) {
            if (Number(this.allLp[index].personLpNum) > 0) {
                this.allLp[index].releaseVal = this.allLp[index].personLpNum
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
        async initList() {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'close', true)
                this.$set(this.allLp[i], 'pledgeVal', null)
                this.$set(this.allLp[i], 'releaseVal', null)
                if (this.allLp[i].stakeToken) {
                    const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                    const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
                    const lpDecimals = await pool.methods.decimals().call()
                    const showBalance = lpBalance / Math.pow(10, lpDecimals)
                    this.allLp[i].lpBalance = showBalance.toFixed(lpDecimals)

                    const farmContract = new web3.eth.Contract(farmAbi, this.allLp[i].stakeToken)
                    const lpPrice = await this.getLpPrice(this.allLp[i].address)
                    this.allLp[i].lpPrice = lpPrice
                    const lpBalanceValue = lpPrice * lpBalance
                    this.allLp[i].lpBalanceValue = lpBalanceValue
                    const totalSupply = await farmContract.methods.totalSupply().call()
                    const farmValue = lpPrice * totalSupply
                    this.allLp[i].farmValue = farmValue
                    const periodFinish = await farmContract.methods.periodFinish().call()
                    const now = new Date() // 获取当前时间
                    const nowTime = Math.floor(now.getTime() / 1000)
                    // 每秒产出JLS数量
                    const rewardRate = await farmContract.methods.rewardRate().call()
                    // 判断是否到期，到期后无奖励
                    if (nowTime <= periodFinish) {
                        if (this.allLp[i].farmValue) {
                            // 一年总奖励
                            const rewardRateYear = rewardRate * 3600 * 24 * 365
                            const jlsPrice = this.getTokenPrice('JLS')
                            const rewardRateYearValue = (rewardRateYear / Math.pow(10, 18)) * jlsPrice
                            const apr = rewardRateYearValue / farmValue * 100
                            const showApr = this.getAprShow(apr) + '%'
                            this.allLp[i].apr = showApr
                        } else { // 池子没有抵押资产
                            this.allLp[i].apr = '∞'
                        }
                    } else if (nowTime > periodFinish) {
                        this.allLp[i].apr = '0'
                    }

                    // 每天产出
                    const rewardRateDay = rewardRate * 60 * 60 * 24 / Math.pow(10, 18)
                    this.allLp[i].rewardRate = rewardRateDay

                    // 个人抵押lp数量
                    const personLpNum = await farmContract.methods.balanceOf(this.fromAddress).call()
                    const personLpNumShow = personLpNum / Math.pow(10, lpDecimals)
                    this.allLp[i].personLpNum = personLpNumShow.toFixed(lpDecimals)
                    this.allLp[i].personLpValue = personLpNum * lpPrice
                }
            }
        },
        // 转换时间
        getTime(date) {
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            const hours = date.getHours()
            const minutes = date.getMinutes()
            const seconds = date.getSeconds()
            const time = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
            return time
        },
        // 获取lp单价
        async getLpPrice(address) {
            const web3 = new Web3(window.ethereum)
            const pool = new web3.eth.Contract(pairAbi, address)
            const reserves = await pool.methods.getReserves().call()
            const token0 = await pool.methods.token0().call()
            const token1 = await pool.methods.token1().call()
            const decimals0 = this.getTokenDecimals(token0)
            const decimals1 = this.getTokenDecimals(token1)
            const token0Num = reserves._reserve0 / Math.pow(10, decimals0)
            const token1Num = reserves._reserve1 / Math.pow(10, decimals1)
            const totalSupply = await pool.methods.totalSupply().call()
            const exchangeRate = token1Num / token0Num
            const name0 = this.getTokenName(token0)
            const name1 = this.getTokenName(token1)
            this.getBaseVal(name0, name1, exchangeRate)
            const token0Price = this.getTokenPrice(name0)
            const token1Price = this.getTokenPrice(name1)
            const totalPrice = token0Num * token0Price + token1Num * token1Price
            const lpPrice = totalPrice / totalSupply
            return lpPrice
        },
        getTokenPrice(name) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === name) {
                    return this.allToken[i].baseVal
                }
            }
        },
        // 获取token单价
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
        // 获取精度
        getTokenDecimals(val) {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].decimals
                }
            }
        },
        // 获取tokenName
        getTokenName(val) {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].name
                }
            }
        },
        // 保留两位小数
        getTwoPrice(val) {
            if (val) {
                // const balance = Math.round(val * Math.pow(10, 2)) / Math.pow(10, 2)
                const balance = val.toFixed(2)
                return balance
            } else {
                return '0.00'
            }
        },
        // 保留几位小数
        getAprShow(val) {
            if (val) {
                const balance = Math.round(val * Math.pow(10, 2)) / Math.pow(10, 2)
                return balance
            } else {
                return '0.00'
            }
        },
        // 数字格式化
        getNum(num) {
            if (Number(num) < 1 && Number(num) > 0) {
                return num
            } else if (Number(num) >= 1) {
                return Number(num).toFixed(5)
            } else {
                return 0
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
.farmTable{
    .title{
        padding:0 10px 0 10px;
        display: flex;
        align-items: center;
        .titleName{
            font-size: 18px;
            font-weight: bold;
            color: rgba(0,0,0,0.85);
        }
        .leftName{
            text-align: left;
            flex:1;
        }
        .rightName{
            text-align: right;
            padding-right: 30px;
            // flex:0.6;
            width: 70px;
        }
        .second{
            flex:0.8;
        }
        .third{
            flex:1;
        }
        .options{
            width: 60px;
        }
    }
    .content{
        .item{
            border: 2px solid #DAE7F9;
            border-radius: 8px;
            box-sizing: border-box;
            margin-top: 20px;

            .itemInfo{
                display: flex;
                align-items: center;
                height: 100px;
                // cursor: pointer;
                padding:0 10px 0 10px;
            }
            .itemName{
                color: rgba(0,0,0,0.85);
                font-size: 16px;
            }
            .leftName{
                flex:1;
                text-align: left;
                display: flex;
                align-items: center;
                .img{
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-left:5px;
                    img{
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }
                .tokens{
                    color: rgba(0,0,0,0.85);
                    font-size: 16px;
                    margin-left: 10px;
                }
            }
            .rightName{
                text-align: right;
                // flex:0.6;
                width: 70px;
                padding-right: 30px;
                font-size: 16px;
                color: rgba(0,0,0,0.85);
            }
            .second{
                flex:0.8;
                font-size: 16px;
                color: rgba(0,0,0,0.85);
            }
            .third{
                flex:1;
                .tokenInfoDiv{
                    width: 170px;
                    margin:0 auto;
                }
                .tokenInfo{
                    display: flex;
                    align-items: center;
                    margin-top:10px;
                    .tokenImg{
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        margin-right: 10px;
                        img{
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }
                    .infoDesc{
                        font-size: 14px;
                    }
                }
                .tokenInfo:first-child{
                    margin-top: 0;
                }
            }
            .optionsBtn{
                width: 60px;
                display: flex;
                justify-content: center;
                align-items: center;
                .manage{
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.3s;
                }
                .arrowUp{
                    transform:rotate(180deg);
                }
            }
            .optionsContainer{
                height: 180px;
                border-top:1px solid #DAE7F9;
                box-sizing: border-box;
                display: flex;
                // align-items: center;
                justify-content: center;
                .farmContentDiv{
                    flex:1;
                }
                .connect{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    .connectTip{
                        font-size: 16px;
                        color: rgba(0,0,0,0.85);
                    }
                    .connectBtn{
                        background: #E02020;
                        border-radius: 5px;
                        height: 50px;
                        width: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color:#FFF;
                        font-size: 18px;
                        cursor: pointer;
                        margin-top: 30px;
                    }
                }
                .farmContent{
                    flex:1;
                    padding:0 20px;
                    display: flex;
                    .farmLeft,.farmRight{
                        flex:1;
                    }
                    .farmLeft{
                        padding-right: 15px;
                    }
                    .farmRight{
                        padding-left: 15px;
                    }
                    .balanceTip{
                        font-size: 14px;
                        color: rgba(0,0,0,0.85);
                        margin-top: 10px;
                        margin-bottom: 15px;
                        text-align: left;
                    }
                    .pledgeInputDiv{
                        height: 50px;
                        background: #F5F8FC;
                        border-radius: 5px;
                        border: 1px solid #d7d7d7;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        padding:0 15px;
                        .pledge{
                            flex:1;
                        }
                        .max{
                            background: #E02020;
                            border-radius: 10px;
                            color: rgba(253,250,250,0.85);
                            padding:8px 10px;
                            font-size: 12px;
                            cursor: pointer;
                        }
                    }
                    .pledgeBtn{
                        height: 50px;
                        background: #E02020;
                        border-radius: 5px;
                        color:#fff;
                        font-size: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-top: 15px;
                    }
                }
            }
        }
    }
}
</style>
<style lang="less">
.farmTable{
    .pledgeInput{
        .el-input__inner{
             border: none;
             padding-left: 0;
             background-color:transparent;
             font-size: 18px;
        }
    }
}
</style>
