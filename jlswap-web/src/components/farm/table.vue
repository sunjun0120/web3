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
        <div class='item' v-for='i,index in allFarm' :key='index'>
            <div class='itemInfo' >
                <div class='itemName leftName'>
                    <div class='img'><img :src="getImg(i.from)" alt=""></div>
                    <div class='img'><img :src="getImg(i.to)" alt=""></div>
                    <div class='tokens'>{{i.from}} / {{ i.to }}</div>
                </div>
                <div class='itemName second'>$34.10K</div>
                <div class='itemName third'>
                    <div class='tokenInfoDiv'>
                        <div class='tokenInfo'>
                            <div class='tokenImg'><img :src="getImg(i.from)" alt=""></div>
                            <div class='infoDesc'>4,807 JLS/day</div>
                        </div>
                        <div class='tokenInfo'>
                            <div class='tokenImg'><img :src="getImg(i.to)" alt=""></div>
                            <div class='infoDesc'>2018 USDC/day</div>
                        </div>
                    </div>
                </div>
                <div class='itemName rightName'>20%</div>
                <div class="optionsBtn">
                    <div :class="i.close?'manage el-icon-arrow-down':'manage el-icon-arrow-down arrowUp'" @click="openOrClose(index)"></div>
                </div>
            </div>
            <div class='options' v-show='!i.close'>
                <div class='farmContentDiv' v-if="fromAddress">
                    <div class="farmContent" v-if="network">
                        <div class='farmLeft'>
                            <div class='balanceTip'>Available: 0LP（$0.00）</div>
                            <div class='pledgeInputDiv'>
                                <div class='pledge'>
                                    <el-input v-model="pledgeVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                                </div>
                                <div class='max'>greatest amount</div>
                            </div>
                            <div class='pledgeBtn'>pledge</div>
                        </div>
                        <div class='farmRight'>
                            <div class='balanceTip'>Deposited: 0LP（$0.00）</div>
                            <div class='pledgeInputDiv'>
                                <div class='pledge'>
                                    <el-input v-model="releaseVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                                </div>
                                <div class='max'>greatest amount</div>
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
</template>

<script>
import { tokenList } from '../../constants/tokens'
import { farmList } from '../../constants/farmList'
import utils from '../../utils/storage'
import Web3 from 'web3'
export default {
    name: '',
    data () {
        return {
            fromAddress: utils.load('fromAddress'),
            network: utils.load('network'),
            chainId: 137,
            allToken: tokenList,
            pledgeVal: null,
            releaseVal: null,
            allFarm: farmList
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
            for (const i in this.allFarm) {
                if (Number(i) === index) {
                    this.allFarm[i].close = !this.allFarm[i].close
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
        initList() {
            for (const i in this.allFarm) {
                this.$set(this.allFarm[i], 'close', true)
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
            flex:1;
        }
        .leftName{
            text-align: left;
        }
        .rightName{
            text-align: right;
            padding-right: 30px;
            flex:0.6;
        }
        .second{
            flex:0.8;
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
                flex:1;
                color: rgba(0,0,0,0.85);
                font-size: 16px;
            }
            .leftName{
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
                flex:0.6;
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
            .options{
                height: 180px;
                border-top:1px solid #DAE7F9;
                box-sizing: border-box;
                display: flex;
                // align-items: center;
                justify-content: center;
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
                        border: 1px solid #6D7278;
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
             font-size: 20px;
        }
    }
}
</style>
