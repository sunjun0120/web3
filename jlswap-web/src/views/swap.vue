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
                    <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
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
                        <div class="maxVal" @click="getAllSwap(balance1)">MAX</div>
                        <div class="numVal">{{ getShowBalance(balance1) }}<span class="balanceVal">{{ token1 }}</span></div>
                    </div>
                </div>
            </div>
            <div :class="swapT?'swapIcon el-icon-bottom':'swapIcon el-icon-bottom rotate'" @click="swapToken"></div>
            <div class="token-container" v-loading='loading'>
                <div class="token token1" @click="changeToken(2)">
                    <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
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
                        <!-- <div class="maxVal" @click="getAllSwap(balance2)">MAX</div> -->
                        <div></div>
                        <div class="numVal">{{ getShowBalance(balance2) }}<span class="balanceVal">{{ token2 }}</span></div>
                    </div>
                </div>
            </div>
            <div class="connectWallet" @click="connectWallet" v-if="!fromAddress">Connect Wallet</div>
            <div class="showSwapBtn" v-else>
                <div v-if="network">
                    <div class="errorTip" v-if="showError">{{getMessage()}}</div>
                    <div class="approve" v-else>
                        <div class="exchangeInfo">
                            <div class="exchangeTip">exchange ratio</div>
                            <div class="exchangeContent">
                                <div class="scale">{{getScaleTip(swapE)}}</div>
                                <div :class="swapE?'rotateScale el-icon-sort':'rotateScale el-icon-sort swapExc'" @click="changeScale"></div>
                            </div>
                        </div>
                        <div class="approveBtn" @click="approve" v-if="token1!==nativeToken">approve</div>
                        <div class="approveBtn" @click="confirm" v-else>confirm</div>
                    </div>
                </div>
                <div class="connectWallet" v-else>Network Error</div>
            </div>
        </div>
        <el-dialog
            title="confirm exchange"
            custom-class='confirmDia'
            top="10vh"
            :visible.sync="confirmExchange"
        >
            <div class="confirmInfo">
                <div class="confirmExc">
                    <div class="cofirmToken cofirmToken1">
                        <div class="tokenLeft">
                            <div class="tokenImg"><img :src="getImg(token1)" alt=""></div>
                            <div class="tokenName">{{ token1 }}</div>
                        </div>
                        <div class="tokenRight">{{ getShowBalance(tokenVal1) }}</div>
                    </div>
                    <div class="cofirmToken cofirmToken2">
                        <div class="tokenLeft">
                            <div class="tokenImg"><img :src="getImg(token2)" alt=""></div>
                            <div class="tokenName">{{ token2 }}</div>
                        </div>
                        <div class="tokenRight">{{ getShowBalance(tokenVal2) }}</div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">exchange ratio</div>
                    <div class="right">
                        <div class="scale">{{getScaleTip(swapE2)}}</div>
                        <div :class="swapE2?'rotateScale el-icon-sort':'rotateScale el-icon-sort swapExc'" @click="changeScale2"></div>
                    </div>
                </div>
                <div class="confirmTip">
                    <div class="left">minimum available quantity</div>
                    <div class="right">{{getMinAvailable()}} {{token2}}</div>
                </div>
                <div class="confirmTip">
                    <div class="left">Tolerable Slippage</div>
                    <div class="right">{{ settings }}%</div>
                </div>
                <div class="tips">
                    The output is the estimated value and you will receive at least <span>{{getMinAvailable()}} {{token2}}</span> otherwise the transaction will be rejected.
                </div>
                <div class="confirmBtn" @click="sureConfirm">confirm exchange</div>
            </div>
        </el-dialog>
        <confirm-wait ref="confirmWait"></confirm-wait>
        <confirm-success ref="confirmSuccess"></confirm-success>
        <confirm-fail ref="confirmFail"></confirm-fail>
        <change-token ref="changeToken" @changeToken1='changeToken1' @changeToken2='changeToken2'></change-token>
    </div>
</template>
<script>
import Web3 from 'web3'
import { chainId, nativeToken, farmToken, nativeToErc20Token } from '../constants/common'
import ConfirmWait from '../components/swap/waitDia.vue'
import ConfirmSuccess from '../components/swap/success.vue'
import ConfirmFail from '../components/swap/fail.vue'
import ChangeToken from '../components/swap/changeToken.vue'

import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../store/index'

import { ERC20 } from '../constants/abi/ERC20'
import { routerAbi } from '../constants/abi/routerAbi'
import { wmaticAbi } from '../constants/abi/wmaticAbi'
import C from '../constants/contractAddress'
export default {
    name: '',
    components: {
        ConfirmWait, ConfirmSuccess, ConfirmFail, ChangeToken
    },
    data () {
        return {
            token1: nativeToken,
            token2: farmToken,
            balance1: 0,
            balance2: 0,
            tokenVal1: null,
            tokenVal2: null,
            swapT: false,
            swapE: false,
            swapE2: false,
            showAuto: false,
            confirmExchange: false,
            loading: false,
            settings: 0.5,
            chainId: chainId,
            nativeToken: nativeToken
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'network', 'allToken']),
        showError() {
            if (this.tokenVal1 && Number(this.tokenVal1) !== 0 && (this.tokenVal1 <= this.balance1) && this.tokenVal2) {
                return false
            } else {
                return true
            }
        }
    },
    methods: {
        ...mapActions(baseInfoStore, ['changeFromAddress', 'changeNetwork', 'connect', 'connectWeb3', 'getTokenScale']),
        connectWallet() {
            this.connect()
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
            await this.getTokenScale()
            this.tokenVal2 = this.getOtherCount(1, this.tokenVal1)
        },
        async limitToken2() {
            await this.getTokenScale()
            this.tokenVal1 = this.getOtherCount(2, this.tokenVal2)
        },
        async getAllSwap(val) {
            if (val) {
                this.tokenVal1 = val
                await this.getTokenScale()
                this.tokenVal2 = this.getOtherCount(1, this.tokenVal1)
            }
        },
        getImg(val) {
            for (const i of this.allToken) {
                if (i.name === val) {
                    return i.icon
                }
            }
        },
        swapToken() {
            this.swapT = !this.swapT
            const a = this.token1
            const b = this.token2
            const c = this.balance1
            const d = this.balance2
            const e = this.tokenVal1
            const f = this.tokenVal2
            this.token1 = b
            this.token2 = a
            this.balance1 = d
            this.balance2 = c
            this.tokenVal1 = f
            this.tokenVal2 = e
        },
        changeScale() {
            this.swapE = !this.swapE
        },
        changeScale2() {
            this.swapE2 = !this.swapE2
        },
        confirm() {
            // 已经approve 或者原生代币
            this.confirmExchange = true
        },
        async approve() {
            // erc20代币
            const web3 = new Web3(window.ethereum)
            const amountToApprove = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256-1
            let tokenAddress1
            let decimals1
            let getAllowance1
            for (const i of this.allToken) {
                if (i.name === this.token1) {
                    tokenAddress1 = i.address
                    decimals1 = i.decimals
                }
            }
            if (decimals1 === 18) {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'ether')
            } else {
                getAllowance1 = web3.utils.toWei(this.tokenVal1.toString(), 'lovelace')
            }
            const tokenContract1 = new web3.eth.Contract(ERC20, tokenAddress1)
            const routerAddress = C.router_address
            const allowance1 = await tokenContract1.methods.allowance(this.fromAddress, routerAddress).call()
            if (Number(getAllowance1) > Number(allowance1)) {
                await tokenContract1.methods.approve(routerAddress, amountToApprove).send({ from: this.fromAddress })
            }
            this.confirm()
        },
        async sureConfirm() {
            this.confirmExchange = false
            const message1 = this.tokenVal1 + ' ' + this.token1
            const message2 = this.tokenVal2 + ' ' + this.token2
            const message = 'Swapping ' + message1 + ' for ' + message2
            this.$refs.confirmWait.show(message)
            const web3 = new Web3(window.ethereum)
            const routerAddress = C.router_address
            const routerContract = new web3.eth.Contract(routerAbi, routerAddress)
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60// 1小时后过期
            let getAllowance1
            let getAllowance2
            let tokenAddress2
            let tokenAddress1
            let decimals1
            let decimals2
            let wmaticAddress
            for (const i of this.allToken) {
                if (i.name === this.token1) {
                    tokenAddress1 = i.address
                    decimals1 = i.decimals
                }
                if (i.name === this.token2) {
                    tokenAddress2 = i.address
                    decimals2 = i.decimals
                }
                if (this.token1 === nativeToken) {
                    if (i.name === nativeToErc20Token) {
                        tokenAddress1 = i.address
                        decimals1 = i.decimals
                    }
                }
                if (this.token2 === nativeToken) {
                    if (i.name === nativeToErc20Token) {
                        tokenAddress2 = i.address
                        decimals2 = i.decimals
                    }
                }
                if (i.name === nativeToErc20Token) {
                    wmaticAddress = i.address
                }
            }
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
            const amountIn = getAllowance1
            const amountOutMin = web3.utils.toWei(parseInt(((1 - Number(this.settings) / 100) * Number(getAllowance2))).toString(), 'wei')
            let tx
            const wmaticContract = new web3.eth.Contract(wmaticAbi, wmaticAddress)
            if (this.token1 === nativeToken && this.token2 === nativeToErc20Token) {
                tx = await wmaticContract.methods.deposit()
                const that = this
                await web3.eth.sendTransaction({
                    from: this.fromAddress,
                    to: wmaticAddress,
                    data: tx.encodeABI(),
                    value: web3.utils.toHex(amountIn),
                    gas: await tx.estimateGas({
                        from: this.fromAddress,
                        value: web3.utils.toHex(amountIn)
                    }),
                    gasPrice: await web3.eth.getGasPrice()
                }, function(error, hash) {
                    if (error) {
                        that.$refs.confirmWait.hide()
                        if (error.code !== 4001) {
                            that.$refs.confirmFail.show(error)
                        } else {
                            that.$refs.confirmFail.show('')
                        }
                    }
                    if (hash) {
                        that.init()
                        that.$refs.confirmWait.hide()
                        that.$refs.confirmSuccess.show(hash)
                        that.getStatus(hash)
                    }
                })
            } else if (this.token2 === nativeToken && this.token1 === nativeToErc20Token) {
                tx = await wmaticContract.methods.withdraw(amountIn)
                const that = this
                await web3.eth.sendTransaction({
                    from: this.fromAddress,
                    to: wmaticAddress,
                    data: tx.encodeABI(),
                    gas: await tx.estimateGas({ from: this.fromAddress }),
                    gasPrice: await web3.eth.getGasPrice()
                }, function(error, hash) {
                    if (error) {
                        that.$refs.confirmWait.hide()
                        if (error.code !== 4001) {
                            that.$refs.confirmFail.show(error)
                        } else {
                            that.$refs.confirmFail.show('')
                        }
                    }
                    if (hash) {
                        that.init()
                        that.$refs.confirmWait.hide()
                        that.$refs.confirmSuccess.show(hash)
                        that.getStatus(hash)
                    }
                })
            } else {
                if (this.token1 === nativeToken) { // native -> erc20
                    const path = [tokenAddress1, tokenAddress2]
                    tx = await routerContract.methods.swapExactETHForTokens(amountOutMin, path, this.fromAddress, deadline)
                    const that = this
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        data: tx.encodeABI(),
                        value: web3.utils.toHex(amountIn),
                        gas: await tx.estimateGas({
                            from: this.fromAddress,
                            value: web3.utils.toHex(amountIn)
                        }).catch(() => {
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmFail.show('Please modify slippage')
                        }),
                        gasPrice: await web3.eth.getGasPrice()
                    }, function(error, hash) {
                        if (error) {
                            that.$refs.confirmWait.hide()
                            if (error.code !== 4001) {
                                that.$refs.confirmFail.show(error)
                            } else {
                                that.$refs.confirmFail.show('')
                            }
                        }
                        if (hash) {
                            that.init()
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmSuccess.show(hash)
                            that.getStatus(hash)
                        }
                    })
                } else if (this.token1 !== nativeToken && this.token2 !== nativeToken) { // erc20 -> erc20
                    const path = [tokenAddress1, tokenAddress2]
                    tx = await routerContract.methods.swapExactTokensForTokens(amountIn, amountOutMin, path, this.fromAddress, deadline)
                    const that = this
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        data: tx.encodeABI(),
                        gas: await tx.estimateGas({ from: this.fromAddress }).catch(() => {
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmFail.show('Please modify slippage')
                        }),
                        gasPrice: await web3.eth.getGasPrice()
                    }, function(error, hash) {
                        if (error) {
                            that.$refs.confirmWait.hide()
                            if (error.code !== 4001) {
                                that.$refs.confirmFail.show(error)
                            } else {
                                that.$refs.confirmFail.show('')
                            }
                        }
                        if (hash) {
                            that.init()
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmSuccess.show(hash)
                            that.getStatus(hash)
                        }
                    })
                } else if (this.token2 === nativeToken) { // erc20 -> native
                    const path = [tokenAddress1, tokenAddress2]
                    tx = await routerContract.methods.swapExactTokensForETH(amountIn, amountOutMin, path, this.fromAddress, deadline)
                    const that = this
                    await web3.eth.sendTransaction({
                        from: this.fromAddress,
                        to: routerAddress,
                        data: tx.encodeABI(),
                        gas: await tx.estimateGas({ from: this.fromAddress }).catch(() => {
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmFail.show('Please modify slippage')
                        }),
                        gasPrice: await web3.eth.getGasPrice()
                    }, function(error, hash) {
                        if (error) {
                            that.$refs.confirmWait.hide()
                            if (error.code !== 4001) {
                                that.$refs.confirmFail.show(error)
                            } else {
                                that.$refs.confirmFail.show('')
                            }
                        }
                        if (hash) {
                            that.init()
                            that.$refs.confirmWait.hide()
                            that.$refs.confirmSuccess.show(hash)
                            that.getStatus(hash)
                        }
                    })
                }
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
                        that.getSwapBalance()
                    } else {
                        that.$notify.error({
                            title: 'Transaction fail'
                        })
                    }
                }
            })
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
        // 保留5位小数
        getShowBalance(val) {
            const balance = Math.round(val * Math.pow(10, 5)) / Math.pow(10, 5)
            return balance
        },
        // 获取代币余额
        async getTokenBalance(address, decimals) {
            const web3 = new Web3(window.ethereum)
            const contractAddress = address
            const ethContract = new web3.eth.Contract(ERC20, contractAddress)
            const balance = await ethContract.methods.balanceOf(this.fromAddress).call()
            const balanceVal = balance / Math.pow(10, decimals)
            return balanceVal
        },
        // 获取所有代币余额
        async getAllBalance() {
            const web3 = new Web3(window.ethereum)
            for (const i of this.allToken) {
                if (i.name === nativeToken) { // 原生币通过钱包获取余额
                    web3.eth.getBalance(this.fromAddress, (err, res) => {
                        if (!err) {
                            const balance = res / Math.pow(10, i.decimals)
                            i.balance = balance
                        }
                    })
                } else {
                    i.balance = await this.getTokenBalance(i.address, i.decimals)
                }
            }
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
        // 获取能接受的最小值
        getMinAvailable() {
            const token1Scale = this.getScale(this.token1)
            const token2Scale = this.getScale(this.token2)
            const tokenVal = Number(this.tokenVal1) * (token2Scale / token1Scale) * (1 - this.settings / 100)
            return this.getShowBalance(tokenVal)
        },

        getTokenName(val) {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allToken) {
                if (val === web3.utils.toChecksumAddress(this.allToken[i].address)) {
                    return this.allToken[i].name
                }
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
            } else if (index === 2) {
                const tokenVal = Number(val) * (token1Scale / token2Scale)
                return this.getShowBalance(tokenVal)
            }
        },
        initInfo() {
            this.balance1 = 0
            this.balance2 = 0
            this.tokenVal1 = null
            this.tokenVal2 = null
        },
        // 监听账户切换
        onChangeAccount() {
            if (window.ethereum) {
                const that = this
                window.ethereum.on('accountsChanged', function(res) {
                    that.changeFromAddress(res[0])
                    if (res[0]) {
                        that.init()
                    } else {
                        that.initInfo()
                    }
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
                        that.changeNetwork(false)
                        that.initInfo()
                    } else {
                        that.changeNetwork(true)
                        that.init()
                    }
                })
            }
        },
        // 获取页面余额
        async getSwapBalance() {
            await this.getAllBalance()
            this.tokenVal1 = null
            this.tokenVal2 = null
            const a = this.token1
            const b = this.token2
            for (const i of this.allToken) {
                if (i.name === a) {
                    this.balance1 = i.balance
                }
                if (i.name === b) {
                    this.balance2 = i.balance
                }
            }
        },
        // 初始化
        async init() {
            // 获取兑换比例
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                const accountAddress = await web3.eth.getAccounts()
                this.changeFromAddress(accountAddress[0])
                if (this.fromAddress) {
                    const chainAddress = await web3.eth.getChainId()
                    if (chainAddress.toString() === this.chainId.toString()) {
                        this.changeNetwork(true)
                    } else {
                        this.changeNetwork(false)
                    }
                    if (this.network) {
                        this.loading = true
                        // 获取余额
                        await this.getSwapBalance()
                        this.loading = false
                    } else {
                        this.connectWeb3()
                    }
                } else {
                    this.initInfo()
                }
            } else {
                this.initInfo()
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
        width: 480px;
        margin:10vh 0 50px;
        // height: 550px;
        background: #F5F8FC;
        border-radius: 15px;
        padding: 20px 15px 20px;
        box-sizing: border-box;
        // box-shadow: 0px 1px 1px 1px rgba(0,0,0,0.5);
        position: relative;
        .swapIcon{
            position: absolute;
            width: 36px;
            height: 36px;
            background: #F5F8FC;
            border-radius: 10px;
            border: 2px solid #FFFFFF;
            left: 70px;
            top: 124px;
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
                    font-size: 14px;
                    margin-top: 20px;
                    padding:0 20px;
                    .exchangeContent{
                        display: flex;
                        align-items: center;
                        .rotateScale{
                            transform: rotate(90deg);
                            margin-left: 20px;
                            cursor: pointer;
                            font-size: 16px;
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
.jlswap-swap{
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
                        flex-shrink: 0;
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
                        font-weight: bold;
                        flex-shrink: 0;
                    }
                }
                .tokenRight{
                    font-size: 20px;
                    color: #000000;
                    font-weight: bold;
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
            margin-top: 20px;
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
            margin-top: 30px;
            text-align: left;
            line-height: 20px;
            padding:0 10px;
            word-break: break-word;
            span{
                font-weight: bold;
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
            padding: 0 15px;
            flex-shrink: 0;
            font-size: 16px;
            color: #448aff;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
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
