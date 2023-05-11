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
                    width="290"
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
                        <div class="numTip" @click='changeTokenVal'>MAX</div>
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
                        <div class="approveBtn" @click="approve" v-if='showCofirmBtn'>Approve</div>
                        <div class='approveBtn' v-else @click="confirm">Confirm Removing Liquidity</div>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog
            title="you will receive "
            custom-class='confirmDia'
            top="15vh"
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
                        <div class='rateNum'>{{message1}}</div>
                        <div class='rateNum'>{{message2}}</div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">Tolerable Slippage</div>
                    <div class="right">{{ settings }}%</div>
                </div>

                <div class="confirmBtn" @click="sureConfirm">Confirm</div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Web3 from 'web3'
import { chainId, nativeToken, nativeToErc20Token } from '../../constants/common'

import { mapActions, mapState } from 'pinia'
import { baseInfoStore } from '../../store/index'
import { multicallAbi } from '../../constants/abi/multicall'
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
            pairAddress: '',
            showCofirmBtn: true,
            confirmExchange: false,
            message1: '',
            message2: '',
            allToken: [],
            settings: 0.5,
            chainId: chainId
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'allLp', 'provider']),
        showError() {
            if (this.tokenVal && Number(this.tokenVal) !== 0) {
                return false
            } else {
                return true
            }
        }
    },
    methods: {
        ...mapActions(baseInfoStore, ['getTokenScale']),
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
        async changeTokenVal() {
            this.tokenVal = 100
            this.showCofirmBtn = await this.getShowApprove()
            this.message1 = await this.getScaleTip(true)
            this.message2 = await this.getScaleTip(false)
        },
        getImg(val) {
            for (const i of this.allToken) {
                if (i.name === val) {
                    return i.icon
                }
            }
        },
        getScale(val) {
            for (const i of this.allToken) {
                if (i.name === val) {
                    return i.baseVal
                }
            }
        },
        getTokenDecimals(val) {
            for (const i of this.allToken) {
                if (i.name === val) {
                    return i.decimals
                }
            }
        },
        async getTokenBalance() {
            if (Number(this.tokenVal) > 100 || Number(this.tokenVal) < 0) {
                this.tokenVal = null
            } else {
                this.showCofirmBtn = await this.getShowApprove()
                this.message1 = await this.getScaleTip(true)
                this.message2 = await this.getScaleTip(false)
            }
        },
        autoPercent() {
            this.settings = 0.1
            this.showAuto = true
        },
        async getScaleTip(val) {
            await this.getTokenScale()
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
        async getShowApprove() {
            // 审批，查询当前lp对于router的授权数量
            const web3 = new Web3(this.provider)
            const scale = this.tokenVal / 100
            const routerAddress = C.router_address
            const pool = new web3.eth.Contract(pairAbi, this.pairAddress)
            const calls = [
                {
                    target: this.pairAddress,
                    callData: pool.methods.allowance(this.fromAddress, routerAddress).encodeABI()
                },
                {
                    target: this.pairAddress,
                    callData: pool.methods.balanceOf(this.fromAddress).encodeABI()
                }
            ]
            const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
            const { returnData } = await multicallContract.methods.aggregate(calls).call()
            const lpAllowance = web3.eth.abi.decodeParameter('uint256', returnData[0])
            const lpBalance = web3.eth.abi.decodeParameter('uint256', returnData[1])

            // const lpAllowance = await pool.methods.allowance(this.fromAddress, routerAddress).call()
            // const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()

            const liquidity = parseInt(lpBalance * scale)
            const getLiquidity = web3.utils.toWei(liquidity.toString(), 'wei')
            if (Number(getLiquidity) > Number(lpAllowance)) {
                return true
            } else {
                return false
            }
        },
        async approve() {
            // 审批，查询当前lp对于router的授权数量
            const web3 = new Web3(this.provider)
            const amountToApprove = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256-1
            const routerAddress = C.router_address
            const pool = new web3.eth.Contract(pairAbi, this.pairAddress)
            await pool.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
            this.showCofirmBtn = false
        },
        confirm() {
            this.confirmExchange = true
        },
        async sureConfirm() {
            this.confirmExchange = false
            let message1
            let message2
            if (this.token1 === nativeToErc20Token) {
                message1 = this.balance1 + ' ' + nativeToken
                message2 = this.balance2 + ' ' + this.token2
            } else if (this.token2 === nativeToErc20Token) {
                message1 = this.balance1 + ' ' + this.token1
                message2 = this.balance2 + ' ' + nativeToken
            } else {
                message1 = this.balance1 + ' ' + this.token1
                message2 = this.balance2 + ' ' + this.token2
            }
            // const message1 = this.balance1 + ' ' + this.token1
            // const message2 = this.balance2 + ' ' + this.token2
            const message = 'You will receive ' + message1 + ' and ' + message2
            this.$emit('showWait', message)
            const web3 = new Web3(this.provider)
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
            let balance1
            let balance2
            if (scale === 1) {
                balance1 = this.token1Balance
                balance2 = this.token2Balance
            } else {
                balance1 = this.token1Balance * scale
                balance2 = this.token2Balance * scale
            }
            // const balance1 = this.token1Balance * scale
            // const balance2 = this.token2Balance * scale
            if (scale === 1) {
                const web3 = new Web3(this.provider)
                const pool = new web3.eth.Contract(pairAbi, this.pairAddress)
                const calls = [
                    {
                        target: this.pairAddress,
                        callData: pool.methods.balanceOf(this.fromAddress).encodeABI()
                    },
                    {
                        target: this.pairAddress,
                        callData: pool.methods.totalSupply().encodeABI()
                    },
                    {
                        target: this.pairAddress,
                        callData: pool.methods.getReserves().encodeABI()
                    }
                ]
                const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
                const { returnData } = await multicallContract.methods.aggregate(calls).call()
                const lpBalance = web3.eth.abi.decodeParameter('uint256', returnData[0])
                const totalSupply = web3.eth.abi.decodeParameter('uint256', returnData[1])
                const reserves = web3.eth.abi.decodeParameters(['uint112', 'uint112', 'uint32'], returnData[2])
                // const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
                // const totalSupply = await pool.methods.totalSupply().call()
                // const reserves = await pool.methods.getReserves().call()
                const proportion = lpBalance / totalSupply
                const token0Balance = parseInt(reserves[0] * proportion)
                const token1Balance = parseInt(reserves[1] * proportion)
                getAllowance1 = token0Balance
                getAllowance2 = token1Balance
                console.log(getAllowance1)
                console.log(getAllowance2)
            } else {
                if (decimals1 === 18) {
                    getAllowance1 = balance1 * Math.pow(10, 18)
                } else {
                    getAllowance1 = balance1 * Math.pow(10, 6)
                }
                if (decimals2 === 18) {
                    getAllowance2 = balance2 * Math.pow(10, 18)
                } else {
                    getAllowance2 = balance2 * Math.pow(10, 6)
                }
            }

            const getMinAllowance1 = parseInt(getAllowance1 * (1 - Number(this.settings) / 100))
            const getMinAllowance2 = parseInt(getAllowance2 * (1 - Number(this.settings) / 100))
            const routerAddress = C.router_address
            const routerContract = new web3.eth.Contract(routerAbi, routerAddress)
            const amountAMin = web3.utils.toWei(getMinAllowance1.toString(), 'wei')
            const amountBMin = web3.utils.toWei(getMinAllowance2.toString(), 'wei')
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60// 1小时后过期
            const pool = new web3.eth.Contract(pairAbi, this.pairAddress)
            const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
            let liquidity
            if (scale === 1) {
                liquidity = lpBalance
            } else {
                liquidity = parseInt(lpBalance * scale)
            }
            // console.log(lpBalance)
            // const liquidity = parseInt(lpBalance * scale)
            // console.log(liquidity)
            const getLiquidity = web3.utils.toWei(liquidity.toString(), 'wei')
            const that = this
            if (this.token1 === nativeToErc20Token || this.token2 === nativeToErc20Token) {
                if (this.token1 === nativeToErc20Token) {
                    const amountTokenMin = amountBMin
                    const amountETHMin = amountAMin
                    const tx = await routerContract.methods.removeLiquidityETH(tokenAddress2, getLiquidity, amountTokenMin, amountETHMin, this.fromAddress, deadline)
                    // console.log(tx)
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        gas: await tx.estimateGas({ from: this.fromAddress }),
                        data: tx.encodeABI(),
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
                    // const value = web3.utils.toWei(parseInt(getAllowance2).toString(), 'wei')
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
            } else { // erc20+erc20
                const tx = await routerContract.methods.removeLiquidity(tokenAddress1, tokenAddress2, getLiquidity, amountAMin, amountBMin, this.fromAddress, deadline)
                // console.log(tx)
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
            const web3 = new Web3(this.provider)
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
                        that.$emit('goback')
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
            const balance = Math.floor(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        // 初始化
        init() {
            this.tokenVal = null
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
        font-size: 20px;
        color: #000;
        margin-top: 8vh;
        text-align: left;
        span{
            cursor: pointer;
        }
    }
    .swapContainer{
        width: 480px;
        // box-shadow: 0px 1px 1px 1px rgba(0,0,0,0.5);
        margin:1vh 0 50px;
        background: #F5F8FC;
        border-radius: 15px;
        padding: 20px 15px 20px;
        box-sizing: border-box;
        position: relative;
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
            }
        }
        .token-container{
            display: flex;
            margin-top: 20px;
            .token{
                height: 72px;
                width: 145px;
                margin-right: 15px;
                background: #F5D0A9;
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: #000000;
                font-weight: bold;
                .tokenCheck{
                    min-width: 70px;
                }
                .tokenCheckIcon{
                    // margin-left: 5px;
                    font-size: 20px;
                }
                .tokenImg{
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 8px;
                    background: #fff;
                    flex-shrink: 0;
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
                padding:10px ;
                .numLeft{
                    flex:1;
                    display: flex;
                    align-items: center;
                    color: #0B0B0B;
                    font-size: 16px;
                }
                .numRight{
                    font-size: 14px;
                    .numTip{
                        padding:8px 10px;
                        font-size: 16px;
                        border-radius: 10px;
                        background: #E9EEF4;
                        color: #6D7278;
                        cursor: pointer;
                    }
                }
            }
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
            margin-top: 20px;
        }
        .showSwapBtn{
            .errorTip{
                height: 52px;
                background: #E9EEF4;
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(18,18,18,0.17);
                font-weight: 500;
                font-size: 18px;
                margin-top: 20px;
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
                        font-size: 20px;
                        color: #000000;
                        font-weight: bold;
                    }
                    .confirmTip{
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 15px;
                        .left{
                            display: flex;
                            align-items: center;
                        }
                        .right{
                            font-size: 16px;
                            color: #6D7278;
                            font-weight: 500;
                        }
                        .tokenImg{
                            width: 40px;
                            height: 40px;
                            background: #fff;
                            border-radius: 50%;
                            img{
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                            }
                        }
                        .tokenName{
                            margin-left: 10px;
                            font-size: 16px;
                            color: #6D7278;
                            font-weight: 500;
                        }
                    }
                }
                .approveBtn{
                    height: 52px;
                    background: #E02020;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 18px;
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
            font-size: 20px;
            border:none;
            height: 28px;
            line-height: 28px;
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
        width: 430px;
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
            height: 130px;
            background: #E9EEF4;
            border-radius: 16px;
            margin-top: 30px;
            padding:15px 10px;
            padding-right: 25px;
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
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: #fff;
                        img{
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }
                    .tokenName{
                        margin-left: 15px;
                        font-size: 20px;
                        color: #000000;
                        font-weight: 500;
                    }
                }
                .tokenRight{
                    font-size: 20px;
                    color: #000000;
                    font-weight: 500;
                }
            }
        }
        .confirmTip{
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
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
                    color:#448aff;
                }
                .swapExc{
                    transform: rotate(-90deg);
                }
            }
        }
        .tips{
            font-size: 14px;
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
            margin-top: 30px;
            font-size: 18px;
            color: #000000;
            font-weight: 500;
            padding: 0 10px;
            padding-bottom: 20px;
            border-bottom: 2px solid #979797;
            margin-bottom: 20px;
            .rateNum{
                margin-bottom:15px;
                text-align: right;
            }
            .rateVal{
                text-align: right;
            }
        }
        .confirmBtn{
            height: 52px;
            background: #E02020;
            border-radius: 15px;
            color:#fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            margin-top: 25px;
        }
    }
}

</style>
<style lang="less">
.settingsPopper{
    padding:20px;
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
        margin-bottom: 14px;
    }
    .settingsVal{
        // width: 316px;
        .el-input__inner{
            background-color: #F5F8FC;
            color: #0B0B0B;
            border: 1px solid #979797;
            padding-left: 20px;
            padding-right:30px;
            height: 40px;
            line-height: 40px;
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
            left: 175px;
        }
        .auto{
            margin-left: 20px;
            width: 70px;
            flex-shrink: 0;
            padding: 0 15px;
            font-size: 16px;
            color: #448aff;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            height: 40px;
            box-sizing: border-box;
        }
        .active{
            border: 1px solid #448aff;
            font-weight: 400;
            border-radius: 8px;
        }
    }

}
</style>
