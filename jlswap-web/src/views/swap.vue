<template>
    <div class="jlswap-swap">
        <div class="swapContainer">
            <div class="title">
                <div class="tip">Swap</div>
                <el-popover
                    placement="bottom-end"
                    :visible-arrow="false"
                    title="Transaction Settings"
                    popper-class="settingsPopper"
                    width="430"
                    trigger="click"
                    content="">
                    <div class="settingContent">
                        <div class="settingTip">SLIPPAGE TOlERANCE</div>
                        <div class="percent">
                            <el-input v-model="settings" placeholder="0.1" type="number" class="settingsVal"></el-input>
                            <div class="percentIcon">%</div>
                            <div :class="showAuto?'auto active':'auto'" @click="autoPercent">auto</div>
                        </div>
                    </div>
                    <div slot="reference" class="setting el-icon-setting"></div>
                </el-popover>
            </div>
            <div class="token-container">
                <div class="token token1" @click="changeToken(1)">
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
            <div :class="swapT?'swapIcon el-icon-bottom':'swapIcon el-icon-bottom rotate'" @click="swapToken"></div>
            <div class="token-container">
                <div class="token token1" @click="changeToken(2)">
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
                    <div class="errorTip" v-if="showError">{{getMessage()}}</div>
                    <div class="approve" v-else>
                        <div class="exchangeInfo">
                            <div class="exchangeTip">exchange ratio</div>
                            <div class="exchangeContent">
                                <div class="scale">1 USDC = 2.49 GLMR</div>
                                <div :class="swapE?'rotateScale el-icon-sort':'rotateScale el-icon-sort swapExc'" @click="changeScale"></div>
                            </div>
                        </div>
                        <div class="approveBtn" @click="confirm">approve</div>
                    </div>
                </div>
                <div class="connectWallet" v-else>Network Error</div>
            </div>
        </div>
        <el-dialog
            title="Confirm Exchange"
            custom-class='confirmDia'
            top="5vh"
            :visible.sync="confirmExchange"
        >
            <div class="confirmInfo">
                <div class="confirmExc">
                    <div class="cofirmToken cofirmToken1">
                        <div class="tokenLeft">
                            <div class="tokenImg"></div>
                            <div class="tokenName">{{ token1 }}</div>
                        </div>
                        <div class="tokenRight">{{ tokenVal1 }}</div>
                    </div>
                    <div class="cofirmToken cofirmToken2">
                        <div class="tokenLeft">
                            <div class="tokenImg"></div>
                            <div class="tokenName">{{ token2 }}</div>
                        </div>
                        <div class="tokenRight">{{ tokenVal2 }}</div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">exchange ratio</div>
                    <div class="right">
                        <div class="scale">1 USDC = 2.49 GLMR</div>
                        <div :class="swapE2?'rotateScale el-icon-sort':'rotateScale el-icon-sort swapExc'" @click="changeScale2"></div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">minimum available quantity</div>
                    <div class="right">0.04 usdc</div>
                </div>
                <div class="confirmTip">
                    <div class="left">tolerable slippage</div>
                    <div class="right">{{ settings }}%</div>
                </div>
                <div class="tips">
                    The output is the estimated value and you will receive at least 0.040007 USDC otherwise the transaction will be rejected.
                </div>
                <div class="confirmBtn" @click="sureConfirm">confirm exchange</div>
            </div>
        </el-dialog>
        <confirm-wait ref="confirmWait"></confirm-wait>
        <confirm-success ref="confirmSuccess"></confirm-success>
        <confirm-fail ref="confirmFail"></confirm-fail>
        <change-token ref="changeToken"></change-token>
    </div>
</template>
<script>
import Web3 from 'web3'
import utils from '../utils/storage'
import ConfirmWait from '../components/swap/waitDia.vue'
import ConfirmSuccess from '../components/swap/success.vue'
import ConfirmFail from '../components/swap/fail.vue'
import ChangeToken from '../components/swap/changeToken.vue'
export default {
    name: '',
    components: {
        ConfirmWait, ConfirmSuccess, ConfirmFail, ChangeToken
    },
    data () {
        return {
            token1: 'ETH',
            token2: 'JLS',
            balance1: 1,
            balance2: 0,
            tokenVal1: null,
            tokenVal2: null,
            swapT: false,
            swapE: false,
            swapE2: false,
            showAuto: false,
            showError: true,
            confirmExchange: false,
            network: utils.load('network'),
            fromAddress: '',
            settings: 0.5,
            chainId: 80001
        }
    },
    methods: {
        changeToken(val) {
            if (val === 1) {
                this.$refs.changeToken.show1(this.token1)
            } else {
                this.$refs.changeToken.show2(this.token1, this.token2)
            }
        },
        swapToken() {
            this.swapT = !this.swapT
            const a = this.token1
            const b = this.token2
            this.token1 = b
            this.token2 = a
        },
        changeScale() {
            this.swapE = !this.swapE
        },
        changeScale2() {
            this.swapE2 = !this.swapE2
        },
        confirm() {
            this.confirmExchange = true
        },
        sureConfirm() {
            this.confirmExchange = false
            // this.$refs.confirmWait.show()
            // this.$refs.confirmSuccess.show()
            // this.$refs.confirmFail.show()
        },
        autoPercent() {
            this.settings = 0.1
            this.showAuto = true
        },
        getMessage() {
            if (!this.tokenVal1 || Number(this.tokenVal1) === 0) {
                return 'Enter the amount'
            } else {
                if (this.tokenVal1 > this.balance1) {
                    return 'Insufficient balance of token ' + this.token1
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
        // 获取钱包余额
        async getBalance() {
            const web3 = new Web3(window.ethereum)
            const fromAddress = await web3.eth.getAccounts()
            // console.log(web3.currentProvider)
            web3.eth.getBalance(fromAddress[0], (err, res) => {
                if (!err) {
                    console.log('余额：' + res / Math.pow(10, 18))
                }
            })
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
    },
    watch: {
        settings(newV, oldV) {
            if (newV !== 0.1) {
                this.showAuto = false
            }
        },
        tokenVal1(newV, oldV) {
            if (newV && Number(newV) !== 0 && (newV <= this.balance1)) {
                this.showError = false
            } else {
                this.showError = true
            }
        }
    }
}
</script>
<style lang="less" scoped>
.jlswap-swap{
    // height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .swapContainer{
        width: 730px;
        margin:10vh 0 50px;
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
            transform: rotate(-360deg);
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
                .tokenImg{
                    width: 54px;
                    margin-right: 20px;
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
            .errorTip{
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
            .approve{
                .exchangeInfo{
                    height: 70px;
                    background: #E9EEF4;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #B5B2AB;
                    font-size: 16px;
                    margin-top: 20px;
                    padding:0 20px;
                    .exchangeContent{
                        display: flex;
                        align-items: center;
                        .rotateScale{
                            transform: rotate(90deg);
                            margin-left: 20px;
                            cursor: pointer;
                            font-size: 20px;
                            transition: all 0.5s;
                        }
                        .swapExc{
                            transform: rotate(-90deg);
                        }
                    }
                }
                .approveBtn{
                    height: 70px;
                    background: #E02020;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 20px;
                    margin-top: 20px;
                    cursor: pointer;
                }
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
    .confirmDia{
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
        .confirmExc{
            height: 200px;
            background: #E9EEF4;
            border-radius: 16px;
            margin-top: 30px;
            padding:30px 10px;
            padding-right: 30px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .cofirmToken{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .tokenLeft{
                    display: flex;
                    align-items: center;
                    .tokenImg{
                        width: 54px;
                    }
                    .tokenName{
                        margin-left: 30px;
                        font-size: 26px;
                        color: #000000;
                        font-weight: 500;
                    }
                }
                .tokenRight{
                    font-size: 26px;
                    color: #000000;
                    font-weight: 500;
                }
            }
        }
        .confirmTip{
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 20px;
            font-weight: 400;
            color: #000000;
            margin-top: 40px;
            padding:0 10px;
            .right{
                display: flex;
                .rotateScale{
                    transform: rotate(90deg);
                    margin-left: 10px;
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.5s;
                }
                .swapExc{
                    transform: rotate(-90deg);
                }
            }
        }
        .tips{
            font-size: 20px;
            font-weight: 400;
            color: rgba(0,0,0,0.5);
            margin-top: 45px;
            text-align: left;
            line-height: 29px;
            padding:0 10px;
        }
        .confirmBtn{
            height: 70px;
            background: #E02020;
            border-radius: 15px;
            color:#fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            margin-top: 40px;
        }
    }
}

</style>
<style lang="less">
.settingsPopper{
    padding:35px 25px 50px;
    border-radius: 20px;
    .el-popover__title{
        font-size: 20px;
        font-weight: bold;
        color: #000000;
        margin-bottom: 25px;
    }
    .settingTip{
        font-size: 16px;
        color: #6D7278;
        margin-bottom: 15px;
    }
    .settingsVal{
        width: 316px;
        .el-input__inner{
            background-color: #F5F8FC;
            color: #0B0B0B;
            border: 1px solid #979797;
            padding-left: 20px;
            padding-right:30px;
            height: 44px;
            line-height: 44px;
            &::placeholder{
                color: rgba(0,0,0,0.63);
            }
        }
    }
    .percent{
        display: flex;
        // justify-content: space-between;
        align-items: center;
        position: relative;
        .percentIcon{
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 290px;
        }
        .auto{
            margin-left: 40px;
            padding: 0 15px;
            font-size: 16px;
            color:#000000;
            cursor: pointer;
            display: flex;
            align-items: center;
            height: 44px;
            box-sizing: border-box;
        }
        .active{
            border: 1px solid #CE2D32;
            border-radius: 8px;
        }
    }

}
</style>
