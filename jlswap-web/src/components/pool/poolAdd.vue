<template>
    <div class="jlswap-poolAdd">
        <div class="goBack" ><span @click="goBack">&lt; Go back</span></div>
        <div class="swapContainer">
            <div class="title">
                <div class="tip">Add liquidity</div>
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
            <div class="token-container" v-loading='loading'>
                <div class="token token1" @click="changeToken(1)">
                    <div class="tokenImg"><img :src="getImg(token1)" alt="" v-show="token1"></div>
                    <div class="tokenCheck">
                        {{ token1 }}
                    </div>
                    <div class="tokenCheckIcon el-icon-arrow-down"></div>
                </div>
                <div class="tokenNum">
                    <div class="tokenNumLine">
                        <div class="numLeft">
                            <el-input v-model="tokenVal1" placeholder="0" type="number" class="tokenVal" @input="limitToken1"></el-input>
                        </div>
                        <div class="numRight">
                            <div class="numTip">balance</div>
                        </div>
                    </div>
                    <div class="tokenNumLine">
                        <div class="maxVal" @click="getAllSwap1(balance1)">MAX</div>
                        <div class="numVal">{{ getShowBalance(balance1) }}<span class="balanceVal">{{ token1 }}</span></div>
                    </div>
                </div>
            </div>
            <div class='swapIcon el-icon-plus'></div>
            <div class="token-container" v-loading='loading'>
                <div class="token token1" @click="changeToken(2)">
                    <div class="tokenImg"><img :src="getImg(token2)" alt="" v-show="token2"></div>
                    <div class="tokenCheck">
                        {{ token2 }}
                    </div>
                    <div class="tokenCheckIcon el-icon-arrow-down"></div>
                </div>
                <div class="tokenNum">
                    <div class="tokenNumLine">
                        <div class="numLeft">
                            <el-input v-model="tokenVal2" placeholder="0" type="number" class="tokenVal" @input="limitToken2"></el-input>
                        </div>
                        <div class="numRight">
                            <div class="numTip">balance</div>
                        </div>
                    </div>
                    <div class="tokenNumLine">
                        <div class="maxVal" @click="getAllSwap2(balance2)">MAX</div>
                        <div class="numVal">{{ getShowBalance(balance2) }}<span class="balanceVal">{{ token2 }}</span></div>
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
                                <div class="scale">{{getScaleTip(swapE)}}</div>
                                <div :class="swapE?'rotateScale el-icon-sort':'rotateScale el-icon-sort swapExc'" @click="changeScale"></div>
                            </div>
                        </div>
                        <div class="approveBtn" @click="approve" v-if='showCofirmBtn'>{{approveMsg}}</div>
                        <div class='approveBtn' v-else @click="confirm">Confirm Supply</div>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog
            title="you will add "
            custom-class='confirmDia'
            top="15vh"
            :visible.sync="confirmExchange"
        >
            <div class="confirmInfo">
                <div class="confirmExc">
                    <div class="cofirmToken cofirmToken1">
                        <div class="tokenRight">
                            <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
                            <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
                        </div>
                    </div>
                    <div class="cofirmToken cofirmToken2">
                        <div class="tokenLeft">
                            {{token1}}/{{token2}} Liquidity Pool
                        </div>
                    </div>
                </div>
                <div class='rateDiv'>
                    <div class='rateTip'>rate</div>
                    <div class='rateVal'>
                        <div class='rateNum'>{{getScaleTip(swapE2)}}</div>
                        <div class='rateNum'>{{getScaleTip(!swapE2)}}</div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">Deposited by {{token1}} </div>
                    <div class="right">{{tokenVal1}} {{token1}}</div>
                </div>
                <div class="confirmTip">
                    <div class="left">{{token2}} deposited</div>
                    <div class="right">{{tokenVal2}} {{token2}}</div>
                </div>
                <div class="confirmTip">
                    <div class="left">Tolerable Slippage</div>
                    <div class="right">{{ settings }}%</div>
                </div>

                <div class="confirmBtn" @click="sureConfirm">Confirm Supply</div>
            </div>
        </el-dialog>
        <change-token ref="changeToken" @changeToken1='changeToken1' @changeToken2='changeToken2'></change-token>
    </div>
</template>
<script>
import Web3 from 'web3'
import ChangeToken from './changeToken.vue'
import { chainId, nativeToken } from '../../constants/common'

import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../../store/index'
import { ERC20 } from '../../constants/abi/ERC20'
import { routerAbi } from '../../constants/abi/routerAbi'
import C from '../../constants/contractAddress'
export default {
    name: '',
    components: {
        ChangeToken
    },
    data () {
        return {
            token1: '',
            token2: '',
            balance1: 0,
            balance2: 0,
            tokenVal1: null,
            tokenVal2: null,
            swapE: false,
            swapE2: false,
            showAuto: false,
            confirmExchange: false,
            loading: false,
            showCofirmBtn: true,
            maxFlag1: false,
            maxFlag2: false,
            settings: 0.5,
            approveMsg: 'Approve',
            chainId: chainId
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'allToken', 'allLp', 'provider']),
        showError() {
            if (this.tokenVal1 && Number(this.tokenVal1) !== 0 && (this.tokenVal1 <= this.balance1) && this.tokenVal2 && Number(this.tokenVal2) !== 0 && (this.tokenVal2 <= this.balance2)) {
                return false
            } else {
                return true
            }
        }
    },
    methods: {
        ...mapActions(baseInfoStore, ['changeFromAddress', 'getTokenScale', 'aggregateBalance']),
        goBack() {
            this.$emit('goback')
        },
        show(token0, token1) {
            this.token1 = token0
            this.token2 = token1
            this.showCofirmBtn = false
            this.init()
        },
        async changeToken(val) {
            if (val === 1) {
                this.$refs.changeToken.show1(this.token1, this.token2)
            } else {
                this.$refs.changeToken.show2(this.token1, this.token2)
            }
        },
        changeToken1(val) {
            this.token1 = val.name
            this.balance1 = val.balance
            this.tokenVal1 = null
            this.tokenVal2 = null
        },
        changeToken2(val) {
            this.token2 = val.name
            this.balance2 = val.balance
            this.tokenVal1 = null
            this.tokenVal2 = null
        },
        async limitToken1() {
            if (this.token2 && this.tokenVal1) {
                await this.getTokenScale()
                this.tokenVal2 = this.getOtherCount(1, this.tokenVal1)
                this.showCofirmBtn = await this.getShowApprove()
            } else {
                this.tokenVal2 = null
            }
            this.maxFlag1 = false
            this.maxFlag2 = false
        },
        async  limitToken2() {
            if (this.token1 && this.tokenVal2) {
                await this.getTokenScale()
                this.tokenVal1 = this.getOtherCount(2, this.tokenVal2)
                this.showCofirmBtn = await this.getShowApprove()
            } else {
                this.tokenVal1 = null
            }
            this.maxFlag1 = false
            this.maxFlag2 = false
        },
        async  getAllSwap1(val) {
            if (val && this.token2) {
                this.tokenVal1 = this.getShowBalance(val)
                // this.tokenVal1 = val
                await this.getTokenScale()
                this.tokenVal2 = this.getOtherCount(1, this.tokenVal1)
                this.showCofirmBtn = await this.getShowApprove()
                this.maxFlag1 = true
                this.maxFlag2 = false
            }
        },
        async  getAllSwap2(val) {
            if (val && this.token1) {
                this.tokenVal2 = this.getShowBalance(val)
                // this.tokenVal2 = val
                await this.getTokenScale()
                this.tokenVal1 = this.getOtherCount(2, this.tokenVal2)
                this.showCofirmBtn = await this.getShowApprove()
                this.maxFlag1 = false
                this.maxFlag2 = true
            }
        },
        getImg(val) {
            for (const i of this.allToken) {
                if (i.name === val) {
                    return i.icon
                }
            }
        },
        getAddress(token) {
            for (const i of this.allToken) {
                if (i.name === token) {
                    return i.address
                }
            }
        },
        async getBalance(token) {
            const web3 = new Web3(this.provider)
            if (token === nativeToken) {
                const balance = await web3.eth.getBalance(this.fromAddress).call()
                return balance
            } else {
                const contractAddress = this.getAddress(token)
                const ethContract = new web3.eth.Contract(ERC20, contractAddress)
                const balance = await ethContract.methods.balanceOf(this.fromAddress).call()
                return balance
            }
        },
        changeScale() {
            this.swapE = !this.swapE
        },

        async sureConfirm() {
            this.confirmExchange = false
            const message1 = this.tokenVal1 + ' ' + this.token1
            const message2 = this.tokenVal2 + ' ' + this.token2
            const message = 'Supplying ' + message1 + ' and ' + message2
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
            if (this.maxFlag1) {
                getAllowance1 = await this.getBalance(this.token1)
            } else {
                if (decimals1 === 18) {
                    getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'ether')
                } else {
                    getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'lovelace')
                }
            }
            if (this.maxFlag2) {
                getAllowance2 = await this.getBalance(this.token2)
            } else {
                if (decimals2 === 18) {
                    getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'ether')
                } else {
                    getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'lovelace')
                }
            }

            const routerAddress = C.router_address
            const routerContract = new web3.eth.Contract(routerAbi, routerAddress)
            const amountAMin = web3.utils.toWei(parseInt(((1 - Number(this.settings) / 100) * Number(this.tokenVal1))).toString(), 'wei')
            const amountBMin = web3.utils.toWei(parseInt(((1 - Number(this.settings) / 100) * Number(this.tokenVal2))).toString(), 'wei')
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60// 1小时后过期
            const that = this
            if (this.token1 === nativeToken || this.token2 === nativeToken) { // erc20+native
                let tokenAddress
                let amountTokenDesired
                let amountTokenMin
                let amountETHMin
                let amountETHDesired
                if (this.token1 === nativeToken) {
                    tokenAddress = tokenAddress2
                    amountTokenDesired = getAllowance2
                    amountETHDesired = getAllowance1
                    amountETHMin = amountAMin
                    amountTokenMin = amountBMin
                } else {
                    tokenAddress = tokenAddress1
                    amountTokenDesired = getAllowance1
                    amountETHDesired = getAllowance2
                    amountETHMin = amountBMin
                    amountTokenMin = amountAMin
                }
                const tx = await routerContract.methods.addLiquidityETH(tokenAddress, amountTokenDesired, amountTokenMin, amountETHMin, this.fromAddress, deadline)
                await web3.eth.sendTransaction({
                    from: this.fromAddress,
                    to: routerAddress,
                    value: web3.utils.toHex(amountETHDesired),
                    data: tx.encodeABI(),
                    gas: await tx.estimateGas({
                        from: this.fromAddress,
                        value: web3.utils.toHex(amountETHDesired)
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
            } else { // erc20+erc20
                const tx = await routerContract.methods.addLiquidity(tokenAddress1, tokenAddress2, getAllowance1, getAllowance2, amountAMin, amountBMin, this.fromAddress, deadline)
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
        confirm() {
            this.confirmExchange = true
        },
        async getShowApprove() {
            // 审批，查询当前用户的erc20代币对于router的授权数量
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
            let tokenContract1
            let tokenContract2
            let allowance1
            let allowance2
            const routerAddress = C.router_address
            if (decimals1 === 18) {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'ether')
            } else {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'lovelace')
            }
            if (decimals2 === 18) {
                getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'ether')
            } else {
                getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'lovelace')
            }
            if (this.token1 === nativeToken) { // erc20+native
                tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance2) > Number(allowance2)) {
                    this.approveMsg = 'Approve ' + this.token2
                    return true
                } else {
                    return false
                }
            } else if (this.token2 === nativeToken) { // erc20+native
                tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance1) > Number(allowance1)) {
                    this.approveMsg = 'Approve ' + this.token1
                    return true
                } else {
                    return false
                }
            } else { // erc20+erc20
                tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance1) <= Number(allowance1) && Number(getAllowance2) <= Number(allowance2)) {
                    return false
                } else {
                    if (Number(getAllowance1) > Number(allowance1)) {
                        this.approveMsg = 'Approve ' + this.token1
                    } else {
                        if (Number(getAllowance2) > Number(allowance2)) {
                            this.approveMsg = 'Approve ' + this.token2
                        }
                    }
                    return true
                }
            }
        },
        async approve() {
            // 审批，查询当前用户的erc20代币对于router的授权数量
            const web3 = new Web3(this.provider)
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
            let tokenContract1
            let tokenContract2
            let allowance1
            let allowance2
            const routerAddress = C.router_address
            if (decimals1 === 18) {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'ether')
            } else {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'lovelace')
            }
            if (decimals2 === 18) {
                getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'ether')
            } else {
                getAllowance2 = web3.utils.toWei(this.tokenVal2.toString(), 'lovelace')
            }
            if (this.token1 === nativeToken) { // erc20+native
                tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance2) > Number(allowance2)) {
                    await tokenContract2.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            } else if (this.token2 === nativeToken) { // erc20+native
                tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance1) > Number(allowance1)) {
                    await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            } else { // erc20+erc20
                tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
                tokenContract2 = new web3.eth.Contract(ERC20, tokenAddress2)
                allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
                allowance2 = await tokenContract2.methods.allowance(this.fromAddress, routerAddress).call()
                if (Number(getAllowance1) > Number(allowance1)) {
                    await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
                if (Number(getAllowance2) > Number(allowance2)) {
                    await tokenContract2.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
                }
            }
            this.showCofirmBtn = false
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
                    // console.log(receipt)
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
                        that.init()
                    } else {
                        that.$notify.error({
                            title: 'Transaction fail'
                        })
                    }
                }
            })
        },
        // 保留5位小数
        getShowBalance(val) {
            const balance = Math.floor(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        // 获取代币余额
        // async getTokenBalance(address, decimals) {
        //     const web3 = new Web3(this.provider)
        //     const contractAddress = address
        //     const fromAddress = await web3.eth.getAccounts()
        //     const ethContract = new web3.eth.Contract(ERC20, contractAddress)
        //     const balance = await ethContract.methods.balanceOf(fromAddress[0]).call()
        //     const balanceVal = balance / Math.pow(10, decimals)
        //     return balanceVal
        // },
        // 获取所有代币余额
        // async getAllBalance() {
        //     if (this.provider) {
        //         const web3 = new Web3(this.provider)
        //         for (const i of this.allToken) {
        //             if (i.name === nativeToken) { // 原生币通过钱包获取余额
        //                 web3.eth.getBalance(this.fromAddress, (err, res) => {
        //                     if (!err) {
        //                         const balance = res / Math.pow(10, 18)
        //                         i.balance = balance
        //                     }
        //                 })
        //             } else {
        //                 i.balance = await this.getTokenBalance(i.address, i.decimals)
        //             }
        //         }
        //     }
        // },
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
        getScale(token) {
            for (const i of this.allToken) {
                if (i.name === token) {
                    return i.baseVal
                }
            }
        },
        getOtherCount(index, val) {
            const token1Scale = this.getScale(this.token1)
            const token2Scale = this.getScale(this.token2)
            if (index === 1) {
                const tokenVal = Number(val) * (token2Scale / token1Scale)
                return this.getShowBalance(tokenVal)
                // return tokenVal
            } else if (index === 2) {
                const tokenVal = Number(val) * (token1Scale / token2Scale)
                return this.getShowBalance(tokenVal)
                // return tokenVal
            }
        },
        // 初始化
        async init() {
            this.tokenVal1 = null
            this.tokenVal2 = null
            this.balance1 = 0
            this.balance2 = 0
            // 获取余额
            this.loading = true
            if (this.token1 || this.token2) {
                await this.aggregateBalance()
                // 获取兑换比例
                // this.getTokenScale()
                const a = this.token1
                const b = this.token2
                for (const i of this.allToken) {
                    if (i.name === a) {
                        this.balance1 = this.getShowBalance(i.balance)
                    } else if (i.name === b) {
                        this.balance2 = this.getShowBalance(i.balance)
                    }
                }
            }

            this.loading = false
        }
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
        margin:1vh 0 50px;
        // box-shadow: 0px 1px 1px 1px rgba(0,0,0,0.5);
        // height: 550px;
        background: #F5F8FC;
        border-radius: 15px;
        padding: 20px 15px 20px;
        box-sizing: border-box;
        position: relative;
        .swapIcon{
            position: absolute;
            width: 36px;
            height: 36px;
            background: #F5F8FC;
            border-radius: 10px;
            border: 2px solid #FFFFFF;
            left: 70px;
            top: 126px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            transition: all 0.5s;
            z-index: 2;
        }
        .rotate{
            transform: rotate(-360deg);
        }
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
                padding-left: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                .tokenCheck{
                    width:70px;
                    font-weight: bold;
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
                    flex-shrink: 0;
                    background: #fff;
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
                flex-direction: column;
                justify-content: flex-end;
                padding:10px 20px;
                .tokenNumLine{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .numLeft{
                    flex:1;
                }
                .numRight{
                    color: #FFFDFD;
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: 500;
                    align-self: flex-end;
                    .numTip{
                        text-align: right;
                    }
                }
                .numVal{
                    color: #FFFDFD;
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: 500;
                    // margin-top: 4px;
                    text-align: right;
                    .balanceVal{
                        margin-left: 6px;
                    }
                }
                .maxVal{
                    color:#448aff;
                    font-weight: bold;
                    cursor: pointer;
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
                    height: 52px;
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
                            // font-size: 20px;
                            transition: all 0.5s;
                            color:#448aff;
                        }
                        .swapExc{
                            transform: rotate(-90deg);
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
.jlswap-poolAdd{
    .tokenVal{
        .el-input__inner{
            background-color:transparent;
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
            padding:20px 10px;

            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .cofirmToken{
                display: flex;
                align-items: center;
                .tokenRight{
                    display: flex;
                    align-items: center;
                    // margin-left: 30px;
                    .tokenImg{
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
                    .tokenName{
                        margin-left: 15px;
                        font-size: 20px;
                        color: #000000;
                        font-weight: 500;
                    }
                }
                .tokenLeft{
                    font-size: 20px;
                    color: #000000;
                    font-weight: bold;
                    word-break: break-word;
                    text-align: left;
                }
            }
            .cofirmToken1{
                justify-content: space-between;
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
                    // font-size: 20px;
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
    border-radius: 15px;
    .el-popover__title{
        font-size: 20px;
        font-weight: bold;
        color: #000000;
        margin-bottom: 20px;
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
