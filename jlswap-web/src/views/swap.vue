<template>
    <div class="jlswap-swap">
        <div class="swapContainer">
            <div class="title">
                <div class="tip">Swap</div>
                <div class="setting el-icon-setting"></div>
            </div>
            <div class="token-container">
                <div class="token token1">
                    <div class="tokenImg"></div>
                    <div class="tokenCheck">
                        {{ token1 }}
                    </div>
                    <div class="tokenCheckIcon el-icon-arrow-down"></div>
                </div>
                <div class="tokenNum">
                    <div class="numLeft">
                        <el-input v-model="tokenVal1" placeholder="0" type="number" class="tokenVal"></el-input>
                    </div>
                    <div class="numRight">
                        <div class="numTip">balance</div>
                        <div class="numVal">{{ balance1 }}<span class="balanceVal">{{ token1 }}</span></div>
                    </div>
                </div>
            </div>
            <div :class="swapT?'swapIcon el-icon-sort':'swapIcon el-icon-sort rotate'" @click="swapToken"></div>
            <div class="token-container">
                <div class="token token1">
                    <div class="tokenImg"></div>
                    <div class="tokenCheck">
                        {{ token2 }}
                    </div>
                    <div class="tokenCheckIcon el-icon-arrow-down"></div>
                </div>
                <div class="tokenNum">
                    <div class="numLeft">
                        <el-input v-model="tokenVal2" placeholder="0" type="number" class="tokenVal"></el-input>
                    </div>
                    <div class="numRight">
                        <div class="numTip">balance</div>
                        <div class="numVal">{{ balance2 }}<span class="balanceVal">{{ token2 }}</span></div>
                    </div>
                </div>
            </div>
            <div class="connectWallet" @click="connect" v-if="!fromAddress">Connect Wallet</div>
            <div class="showSwapBtn" v-else>
                <div v-if="network">
                    <div class="amount">Enter the amount</div>
                    <div class=""></div>
                </div>
                <div class="connectWallet" v-if="!network">Network Error</div>
            </div>
        </div>
    </div>
</template>
<script>
import Web3 from 'web3'
import utils from '../utils/storage'
export default {
    name: '',
    data () {
        return {
            token1: 'GLMR',
            token2: 'USDC',
            balance1: '0',
            balance2: '0',
            tokenVal1: null,
            tokenVal2: null,
            swapT: false,
            network: utils.load('network'),
            fromAddress: '',
            chainId: 80001
        }
    },
    methods: {
        swapToken() {
            this.swapT = !this.swapT
            const a = this.token1
            const b = this.token2
            this.token1 = b
            this.token2 = a
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
                } catch (e) {
                    that.network = false
                    console.log(e.code)
                }
            }
        },
        // 监听账户切换
        onChangeAccount() {
            if (window.ethereum) {
                const that = this
                window.ethereum.on('accountsChanged', function(res) {
                    that.fromAddress = res[0]
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
                        console.log('链id:' + Web3.utils.hexToNumber(val))
                        that.network = false
                    } else {
                        that.network = true
                        console.log('网络切换正确！')
                    }
                })
            }
        },
        async init() {
            // 获取账户信息
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                const fromAddress = await web3.eth.getAccounts()
                this.fromAddress = fromAddress[0]
                // this.connectWeb3()
            } else {
                console.log('请安装MetaMask钱包')
            }
        }
    },
    mounted () {
        this.init()
        this.onChangeAccount()
        this.onChangeChain()
    }
}
</script>
<style lang="less" scoped>
.jlswap-swap{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .swapContainer{
        width: 730px;
        // height: 550px;
        background: #F5F8FC;
        border-radius: 15px;
        padding:50px 40px 30px;
        position: relative;
        .swapIcon{
            position: absolute;
            width: 48px;
            height: 48px;
            background: #F5F8FC;
            border-radius: 14px;
            border: 2px solid #FFFFFF;
            left: 148px;
            top: 224px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.5s;
        }
        .rotate{
            transform: rotate(180deg);
        }
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
            }
        }
        .token-container{
            display: flex;
            margin-top: 32px;
            .token{
                height: 120px;
                width: 250px;
                margin-right: 20px;
                background: #F5D0A9;
                border-radius: 15px;
                display: flex;
                align-items: center;
                padding-left: 15px;
                font-size: 20px;
                font-weight: 500;
                cursor: pointer;
                .tokenCheckIcon{
                    margin-left: 10px;
                    font-size: 32px;
                }
            }
            .tokenNum{
                flex:1;
                border-radius: 15px;
                background: #B3DFE4;
                display: flex;
                align-items: center;
                padding:0 20px 0 40px;
                .numLeft{
                    flex:1;
                }
                .numRight{
                    font-weight: 500;
                    color: #FFFDFD;
                    font-size: 16px;
                    line-height: 22px;
                    font-weight: 500;
                    .numVal{
                        margin-top: 4px;
                        .balanceVal{
                            margin-left: 6px;
                        }
                    }
                }
            }
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
            margin-top: 40px;
        }
        .showSwapBtn{
            .amount{
                height: 70px;
                background: #E9EEF4;
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(18,18,18,0.17);
                font-weight: 500;
                font-size: 20px;
                margin-top: 40px;
            }
        }
    }
}
</style>
<style lang="less">
.jlswap-swap{
    .tokenVal{
        .el-input__inner{
            background-color:transparent;
            color: #0B0B0B;
            font-size: 30px;
            border:none;
            padding-left: 0;
            &::placeholder{
                color: rgba(0,0,0,0.63);
            }
        }
    }
}

</style>
