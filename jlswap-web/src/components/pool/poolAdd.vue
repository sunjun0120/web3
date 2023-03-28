<template>
    <div class="jlswap-poolAdd">
        <div class="swapContainer">
            <div class="title">
                <div class="tip">Add liquidity</div>
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
                    <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
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
            <div class='swapIcon el-icon-plus'></div>
            <div class="token-container">
                <div class="token token1" @click="changeToken(2)">
                    <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
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
            <div class="showSwapBtn">
                <div>
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
                            <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
                            <div class="tokenName">{{ token1 }}</div>
                        </div>
                        <div class="tokenRight">{{ tokenVal1 }}</div>
                    </div>
                    <div class="cofirmToken cofirmToken2">
                        <div class="tokenLeft">
                            <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
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
        <change-token ref="changeToken" @changeToken1='changeToken1' @changeToken2='changeToken2'></change-token>
    </div>
</template>
<script>
import Web3 from 'web3'
import ChangeToken from './changeToken.vue'
import { tokenList } from '../../constants/tokens'
import { ERC20 } from '../../constants/abi/ERC20'
// import { routerAbi } from '../../constants/abi/routerAbi'
import C from '../../constants/contractAddress'
export default {
    name: '',
    components: {
        ChangeToken
    },
    data () {
        return {
            token1: 'USDC',
            token2: 'USDT',
            balance1: 0,
            balance2: 0,
            tokenVal1: null,
            tokenVal2: null,
            swapE: false,
            swapE2: false,
            showAuto: false,
            confirmExchange: false,
            fromAddress: '',
            allToken: tokenList,
            settings: 0.5,
            chainId: 137
        }
    },
    methods: {
        async changeToken(val) {
            await this.getAllBalance()
            if (val === 1) {
                this.$refs.changeToken.show1(this.token1, this.token2, this.allToken)
            } else {
                this.$refs.changeToken.show2(this.token1, this.token2, this.allToken)
            }
        },
        changeToken1(val) {
            this.token1 = val.name
            this.balance1 = this.getShowBalance(val.balance)
        },
        changeToken2(val) {
            this.token2 = val.name
            this.balance2 = this.getShowBalance(val.balance)
        },
        getImg(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].icon
                }
            }
        },
        changeScale() {
            this.swapE = !this.swapE
        },
        changeScale2() {
            this.swapE2 = !this.swapE2
        },
        async confirm() {
            // 审批，查询当前用户的erc20代币对于router的授权数量
            const web3 = new Web3(window.ethereum)
            const amountToApprove = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256-1
            // erc20+native
            if (this.token1 === 'MATIC') {
                let tokenAddress2
                for (const i of this.allToken) {
                    if (i.name === this.token2) {
                        tokenAddress2 = i.address
                    }
                }
                const tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                const routerAddress = C.router_address
                // const router = new web3.eth.Contract(routerAbi, routerAddress)
                const allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(this.tokenVal2) > allowance2) {
                    await tokenContract2.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            } else if (this.token2 === 'MATIC') {
                let tokenAddress1

                for (const i of this.allToken) {
                    if (i.name === this.token1) {
                        tokenAddress1 = i.address
                    }
                }
                const tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                const routerAddress = C.router_address
                // const router = new web3.eth.Contract(routerAbi, routerAddress)
                const allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(this.tokenVal1) > allowance1) {
                    await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            } else { // erc20+erc20
                let tokenAddress1
                let tokenAddress2
                let decimals1
                let decimals2
                for (const i of this.allToken) {
                    if (i.name === this.token1) {
                        tokenAddress1 = i.address
                        decimals1 = i.decimals
                    }
                    if (i.name === this.token2) {
                        tokenAddress2 = i.address
                        decimals2 = i.decimals
                    }
                }
                const tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                const tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                const routerAddress = C.router_address
                const allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                const allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                const getAllowance1 = allowance1 / Math.pow(10, decimals1)
                const getAllowance2 = allowance2 / Math.pow(10, decimals2)
                console.log(getAllowance1)
                console.log(getAllowance2)
                if (Number(this.tokenVal1) > getAllowance1) {
                    await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
                if (Number(this.tokenVal2) > getAllowance2) {
                    await tokenContract2.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            }
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
            if (!this.tokenVal1 || Number(this.tokenVal1) === 0 || !this.tokenVal2 || Number(this.tokenVal2) === 0) {
                return 'Enter the amount'
            } else {
                if (this.tokenVal1 > this.balance1) {
                    return 'Insufficient balance of token ' + this.token1
                } else {
                    if (this.tokenVal2 > this.balance2) {
                        return 'Insufficient balance of token ' + this.token2
                    }
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
        // 获取所有代币余额
        async getAllBalance() {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                if (this.fromAddress) {
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
                } else {
                    for (const i of this.allToken) {
                        i.balance = 0
                    }
                }
            }
        },
        // 初始化
        async init() {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                const fromAddress = await web3.eth.getAccounts()
                this.fromAddress = fromAddress[0]
                if (this.fromAddress) {
                    // 获取余额
                    await this.getAllBalance()
                    const a = this.token1
                    const b = this.token2
                    for (const i of this.allToken) {
                        if (i.name === a) {
                            this.balance1 = this.getShowBalance(i.balance)
                        } else if (i.name === b) {
                            this.balance2 = this.getShowBalance(i.balance)
                        }
                    }
                } else {
                    this.balance1 = 0
                    this.balance2 = 0
                }
            } else {
                console.log('请安装MetaMask钱包')
            }
        }
    },
    computed: {
        showError() {
            if (this.tokenVal1 && Number(this.tokenVal1) !== 0 && (this.tokenVal1 <= this.balance1) && this.tokenVal2 && Number(this.tokenVal2) !== 0 && (this.tokenVal2 <= this.balance2)) {
                return false
            } else {
                return true
            }
        }
    },
    mounted () {
        this.init()
    },
    watch: {
        settings(newV, oldV) {
            if (newV !== 0.1) {
                this.showAuto = false
            }
        }
    }
}
</script>
<style lang="less" scoped>
.jlswap-poolAdd{
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
                    height: 54px;
                    border-radius: 50%;
                    margin-right: 20px;
                    img{
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
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
                        text-align: right;
                        .balanceVal{
                            margin-left: 6px;
                        }
                    }
                    .numTip{
                        text-align: right;
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
.jlswap-poolAdd{
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
                        height: 54px;
                        border-radius: 50%;
                        img{
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
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
            word-break: break-word;
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
