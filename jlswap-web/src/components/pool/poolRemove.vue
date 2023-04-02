<template>
    <div class='jlswap-poolRemove'>
        <div class="goBack" ><span @click="goBack">&lt; Go back</span></div>
        <div class="swapContainer">
            <div class="title">
                <div class="tip">Delete liquidity</div>
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
                <div class="token">remove liquidity</div>
                <div class="tokenNum">
                    <div class="numRight">
                        <div class="numTip" @click='changeTokenVal'>greatest amount</div>
                    </div>
                    <div class="numLeft">
                        <el-input v-model="tokenVal" placeholder="0" type="number" class="tokenVal" @input='getTokenBalance'></el-input>%
                    </div>
                </div>
            </div>
            <div class="showSwapBtn">
                <div class="approve">
                    <div class="exchangeInfo">
                        <div class="exchangeTip">you will receive</div>
                        <div class="confirmTip">
                            <div class="left">
                                <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
                                <div class='tokenName'>{{token1}} </div>
                            </div>
                            <div class="right">{{balance1}}</div>
                        </div>
                        <div class="confirmTip">
                            <div class="left">
                                <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
                                <div class='tokenName'>{{token2}} </div>
                            </div>
                            <div class="right">{{balance2}}</div>
                        </div>
                    </div>
                    <div class="errorTip" v-if='showError'>Enter the amount</div>
                    <div v-else>
                        <div class="approveBtn" @click="approve" v-if='!showCofirmBtn'>approve</div>
                        <div class='approveBtn' v-else @click="confirm">Confirm removing liquidity</div>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog
            title="you will receive "
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
                        <div class="tokenRight">{{ balance1 }}</div>
                    </div>
                    <div class="cofirmToken cofirmToken2">
                        <div class="tokenLeft">
                            <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
                            <div class="tokenName">{{ token2 }}</div>
                        </div>
                        <div class="tokenRight">{{ balance2 }}</div>
                    </div>
                </div>
                <div class='rateDiv'>
                    <div class='rateTip'>rate</div>
                    <div class='rateVal'>
                        <div class='rateNum'>{{getScaleTip(false)}}</div>
                        <div class='rateNum'>{{getScaleTip(true)}}</div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">Tolerable Slippage</div>
                    <div class="right">{{ settings }}%</div>
                </div>

                <div class="confirmBtn" @click="sureConfirm">confirm</div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Web3 from 'web3'
import utils from '../../utils/storage'
import { lpList } from '../../constants/lpList'
import { ERC20 } from '../../constants/abi/ERC20'
import { pairAbi } from '../../constants/abi/pairAbi'
import { routerAbi } from '../../constants/abi/routerAbi'
import C from '../../constants/contractAddress'
export default {
    name: '',
    components: {
    },
    data () {
        return {
            token1: '',
            token2: '',
            balance1: 0,
            balance2: 0,
            token1Balance: 0,
            token2Balance: 0,
            tokenVal: null,
            showAuto: false,
            fromAddress: utils.load('fromAddress'),
            pairAddress: '',
            allToken: [],
            allLp: lpList,
            showCofirmBtn: false,
            confirmExchange: false,
            settings: 0.5,
            chainId: 137
        }
    },
    methods: {
        goBack() {
            this.$emit('goback')
        },
        show(token0, token1, token0Balance, token1Balance, pairAddress, allToken) {
            this.tokenVal = null
            this.balance1 = 0
            this.balance2 = 0
            this.token1 = token0
            this.token2 = token1
            this.pairAddress = pairAddress
            this.token1Balance = token0Balance
            this.token2Balance = token1Balance
            this.allToken = allToken
            this.showCofirmBtn = false
            this.init()
        },
        changeTokenVal() {
            this.tokenVal = 100
        },
        getImg(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].icon
                }
            }
        },
        getScale(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].baseVal
                }
            }
        },
        getTokenDecimals(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].decimals
                }
            }
        },
        getTokenBalance() {
            if (Number(this.tokenVal) > 100 || Number(this.tokenVal) < 0) {
                this.tokenVal = null
            }
        },
        autoPercent() {
            this.settings = 0.1
            this.showAuto = true
        },
        getScaleTip(val) {
            if (!val) {
                const token1Scale = this.getScale(this.token1)
                const token2Scale = this.getScale(this.token2)
                const showScale = token2Scale / token1Scale
                return '1 ' + this.token1 + ' = ' + this.getShowBalance(showScale) + ' ' + this.token2
            } else {
                const token1Scale = this.getScale(this.token1)
                const token2Scale = this.getScale(this.token2)
                const showScale = token1Scale / token2Scale
                return '1 ' + this.token2 + ' = ' + this.getShowBalance(showScale) + ' ' + this.token1
            }
        },
        async approve() {
            // 审批，查询当前用户的erc20代币对于router的授权数量
            const web3 = new Web3(window.ethereum)
            const amountToApprove = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256-1
            let tokenAddress1
            let tokenAddress2
            let decimals1
            let decimals2
            let getAllowance1
            let getAllowance2
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
            const scale = this.tokenVal / 100
            const balance1 = this.token1Balance * scale
            const balance2 = this.token2Balance * scale
            if (decimals1 === 18) {
                // getAllowance1 = web3.utils.toWei(this.balance1.toString(), 'ether')
                getAllowance1 = balance1 * Math.pow(10, 18)
            } else {
                // getAllowance1 = web3.utils.toWei(this.balance1.toString(), 'lovelace')
                getAllowance1 = balance1 * Math.pow(10, 6)
            }
            if (decimals2 === 18) {
                // getAllowance2 = web3.utils.toWei(this.balance2.toString(), 'ether')
                getAllowance2 = balance2 * Math.pow(10, 18)
            } else {
                // getAllowance2 = web3.utils.toWei(this.balance2.toString(), 'lovelace')
                getAllowance2 = balance2 * Math.pow(10, 6)
            }
            // erc20+erc20
            const routerAddress = C.router_address
            const tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
            const tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
            const allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
            const allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
            if (Number(getAllowance1) > Number(allowance1)) {
                await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
            }
            if (Number(getAllowance2) > Number(allowance2)) {
                await tokenContract2.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
            }
            this.showCofirmBtn = true
        },
        confirm() {
            this.confirmExchange = true
        },
        async sureConfirm() {
            this.confirmExchange = false
            const message1 = this.balance1 + ' ' + this.token1
            const message2 = this.balance2 + ' ' + this.token2
            const message = 'Removing ' + message1 + ' and ' + message2
            this.$emit('showWait', message)
            const web3 = new Web3(window.ethereum)
            let tokenAddress1
            let tokenAddress2
            let decimals1
            let decimals2
            let getAllowance1
            let getAllowance2
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
            const scale = this.tokenVal / 100
            const balance1 = this.token1Balance * scale
            const balance2 = this.token2Balance * scale

            if (decimals1 === 18) {
                // getAllowance1 = web3.utils.toWei(balance1.toString(), 'ether')
                getAllowance1 = balance1 * Math.pow(10, 18)
            } else {
                // getAllowance1 = web3.utils.toWei(balance1.toString(), 'lovelace')
                getAllowance1 = balance1 * Math.pow(10, 6)
            }
            if (decimals2 === 18) {
                // getAllowance2 = web3.utils.toWei(balance2.toString(), 'ether')
                getAllowance2 = balance2 * Math.pow(10, 18)
            } else {
                // getAllowance2 = web3.utils.toWei(balance2.toString(), 'lovelace')
                getAllowance2 = balance2 * Math.pow(10, 6)
            }

            const getMinAllowance1 = Number(getAllowance1) * (1 - Number(this.settings) / 100)
            const getMinAllowance2 = Number(getAllowance2) * (1 - Number(this.settings) / 100)
            const routerAddress = C.router_address
            const routerContract = new web3.eth.Contract(routerAbi, routerAddress)
            const amountAMin = web3.utils.toWei(parseInt(getMinAllowance1).toString(), 'wei')
            const amountBMin = web3.utils.toWei(parseInt(getMinAllowance2).toString(), 'wei')
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60// 1小时后过期
            const pool = new web3.eth.Contract(pairAbi, this.pairAddress)
            const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
            const liquidity = parseInt(lpBalance * scale * (1 - Number(this.settings) / 100))
            const getLiquidity = liquidity
            const that = this
            if (this.token1 === 'WMATIC' || this.token2 === 'WMATIC') {
                if (this.token1 === 'WMATIC') {
                    const amountTokenMin = amountBMin
                    const amountETHMin = amountAMin
                    const tx = await routerContract.methods.removeLiquidityETH(tokenAddress2, getLiquidity, amountTokenMin, amountETHMin, this.fromAddress, deadline)
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        value: web3.utils.toHex(parseInt(getAllowance2)),
                        data: tx.encodeABI(),
                        gas: await tx.estimateGas({
                            from: this.fromAddress,
                            value: web3.utils.toHex(parseInt(getAllowance2))
                        }),
                        gasPrice: await web3.eth.getGasPrice()
                    }, function(error, hash) {
                        if (error) {
                            that.$emit('hideWait')
                            if (error.code !== 4001) {
                                that.$emit('showFail', error)
                            } else {
                                that.$emit('showFail', '')
                            }
                        }
                        if (hash) {
                            that.init()
                            that.$emit('hideWait')
                            that.$emit('showSuccess', hash)
                            that.getStatus(hash)
                        }
                    })
                } else {
                    const amountTokenMin = amountAMin
                    const amountETHMin = amountBMin
                    const tx = await routerContract.methods.removeLiquidityETH(tokenAddress1, getLiquidity, amountTokenMin, amountETHMin, this.fromAddress, deadline)
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        value: web3.utils.toHex(parseInt(getAllowance1)),
                        data: tx.encodeABI(),
                        gas: await tx.estimateGas({
                            from: this.fromAddress,
                            value: web3.utils.toHex(parseInt(getAllowance1))
                        }),
                        gasPrice: await web3.eth.getGasPrice()
                    }, function(error, hash) {
                        if (error) {
                            that.$emit('hideWait')
                            if (error.code !== 4001) {
                                that.$emit('showFail', error)
                            } else {
                                that.$emit('showFail', '')
                            }
                        }
                        if (hash) {
                            that.init()
                            that.$emit('hideWait')
                            that.$emit('showSuccess', hash)
                            that.getStatus(hash)
                        }
                    })
                }
            } else { // erc20+erc20
                const tx = await routerContract.methods.removeLiquidity(tokenAddress1, tokenAddress2, getLiquidity, amountAMin, amountBMin, this.fromAddress, deadline)
                console.log(tx)
                await web3.eth.sendTransaction({
                    from: this.fromAddress,
                    to: routerAddress,
                    data: tx.encodeABI(),
                    gas: await tx.estimateGas({ from: this.fromAddress }),
                    gasPrice: await web3.eth.getGasPrice()
                }, function(error, hash) {
                    if (error) {
                        that.$emit('hideWait')
                        if (error.code !== 4001) {
                            that.$emit('showFail', error)
                        } else {
                            that.$emit('showFail', '')
                        }
                    }
                    if (hash) {
                        that.init()
                        that.$emit('hideWait')
                        that.$emit('showSuccess', hash)
                        that.getStatus(hash)
                    }
                })
            }
        },
        // 监听状态
        getStatus(val) {
            const web3 = new Web3(window.ethereum)
            const that = this
            const startTime = Date.now() // 记录开始时间
            const timeout = 5 * 60 * 1000 // 设置超时时间为5分钟
            web3.eth.getTransactionReceipt(val, (error, receipt) => {
                if (error) {
                    console.log(error)
                } else {
                    if (receipt === null) {
                        const elapsedTime = Date.now() - startTime
                        if (elapsedTime < timeout) {
                            setTimeout(that.getStatus(val), 1000)
                        } else {
                            console.error('Transaction timed out')
                        }
                    } else if (receipt.status) {
                        that.$notify({
                            title: 'Transaction success',
                            type: 'success'
                        })
                        // that.init()
                    } else {
                        that.$notify.error({
                            title: 'Transaction fail'
                        })
                    }
                }
            })
        },
        // 保留几位小数
        getShowBalance(val) {
            const balance = Math.round(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        // 初始化
        init() {
            this.tokenVal = null
        }
    },
    computed: {
        showError() {
            if (this.tokenVal && Number(this.tokenVal) !== 0) {
                return false
            } else {
                return true
            }
        }
    },
    watch: {
        settings(newV, oldV) {
            if (newV !== 0.1) {
                this.showAuto = false
            }
        },
        tokenVal(newV, oldV) {
            if (newV > 0 || newV <= 100) {
                const scale = this.tokenVal / 100
                const balance1 = this.token1Balance * scale
                const balance2 = this.token2Balance * scale
                this.balance1 = this.getShowBalance(balance1)
                this.balance2 = this.getShowBalance(balance2)
            } else {
                this.balance1 = 0
                this.balance2 = 0
            }
        }
    }
}
</script>

<style lang="less" scoped>
.jlswap-poolRemove{
    .goBack{
        font-size: 26px;
        color: #000;
        margin-top: 8vh;
        text-align: left;
        span{
            cursor: pointer;
        }
    }
    .swapContainer{
        width: 730px;
        margin:1vh 0 50px;
        background: #F5F8FC;
        border-radius: 15px;
        padding:50px 40px 30px;
        box-sizing: border-box;
        position: relative;
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
                justify-content: center;
                font-size: 20px;
                color: #000000;
                font-weight: bold;
                .tokenCheck{
                    min-width: 80px;
                }
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
                padding:0 30px 0 15px;
                .numLeft{
                    flex:1;
                    display: flex;
                    align-items: center;
                    color: #0B0B0B;
                    font-size: 26px;
                }
                .numRight{
                    font-size: 16px;
                    .numTip{
                        padding:15px;
                        font-size: 16px;
                        border-radius: 15px;
                        background: #E9EEF4;
                        color: #6D7278;
                        cursor: pointer;
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
                    background: #E9EEF4;
                    border-radius: 15px;
                    color: #B5B2AB;
                    font-size: 16px;
                    margin-top: 20px;
                    padding:20px;
                    .exchangeTip{
                        text-align: left;
                        font-size: 26px;
                        color: #000000;
                        font-weight: bold;
                    }
                    .confirmTip{
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                        .left{
                            display: flex;
                            align-items: center;
                        }
                        .right{
                            font-size: 26px;
                            color: #6D7278;
                            font-weight: 500;
                        }
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
                            color: #6D7278;
                            font-weight: 500;
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
.jlswap-poolRemove{
    .tokenVal{
        .el-input__inner{
            background-color:transparent;
            text-align: right;
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
            margin-top: 15px;
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
            margin-top: 20px;
            text-align: left;
            line-height: 29px;
            padding:0 10px;
            word-break: break-word;
        }
        .rateDiv{
            display: flex;
            justify-content: space-between;
            margin-top: 35px;
            font-size: 20px;
            color: #000000;
            font-weight: 500;
            padding: 0 10px;
            padding-bottom: 40px;
            border-bottom: 2px solid #979797;
            margin-bottom: 20px;
            .rateNum{
                margin-bottom:15px;
                text-align: right;
            }
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
