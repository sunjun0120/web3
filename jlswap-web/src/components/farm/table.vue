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
            <div class="item" v-if="i.farmAddress" v-loading='i.loading'>
                <div class='itemInfo' >
                    <div class='itemName leftName'>
                        <div class='img'><img :src="getImg(i.from)" alt=""></div>
                        <div class='img'><img :src="getImg(i.to)" alt=""></div>
                        <div class='tokens'>{{i.from}} / {{ i.to }}</div>
                    </div>
                    <div class='itemName second'>${{ getAprShow(i.farmValue) }}</div>
                    <div class='itemName third'>
                        <div class='tokenInfoDiv'>
                            <div class='tokenInfo'>
                                <div class='tokenImg'><img :src="getImg(farmToken)" alt=""></div>
                                <div class='infoDesc'>{{ i.rewardRate }} {{farmToken}}/day</div>
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
                <div class='optionsContainer' v-show='!i.close' v-loading='i.detailLoading'>
                    <div class='farmContentDiv' v-if="fromAddress">
                        <div class="farmContent" v-if="network">
                            <div class='farmLeft'>
                                <div class='balanceTip'>Available: {{getNum(i.lpBalance)}} LP（${{getAprShow(i.lpBalanceValue)}}）</div>
                                <div class='pledgeInputDiv'>
                                    <div class='pledge'>
                                        <el-input v-model="i.pledgeVal" placeholder="0.0" type="number" class='pledgeInput' @input="showApproveBtn(i,index)"></el-input>
                                    </div>
                                    <div class='max' @click="pledgeMax(index)">MAX</div>
                                </div>
                                <div v-show='!i.hideError' class='errorBtn'>Enter the correct amount</div>
                                <div v-show='i.hideError'>
                                    <div class='pledgeBtn' v-show='!i.approve' @click='approve(i,index)'>Approve</div>
                                    <div class='pledgeBtn' v-show='i.approve' @click='pledge(i,index)'>Stake</div>
                                </div>
                            </div>
                            <div class='farmMiddle'>
                                <div class='balanceTip'>Deposited: {{getNum(i.personLpNum)}} LP（${{getAprShow(i.personLpValue)}}）</div>
                                <div class='pledgeInputDiv'>
                                    <div class='pledge'>
                                        <el-input v-model="i.releaseVal" placeholder="0.0" type="number" class='pledgeInput' @input="showReleaseBtn(i,index)"></el-input>
                                    </div>
                                    <div class='max' @click="releaseMax(index)">MAX</div>
                                </div>
                                <div v-show='!i.hideError2' class='errorBtn'>Enter the correct amount</div>
                                <div class='pledgeBtn' v-show='i.hideError2' @click='release(i,index)'>Withdraw</div>
                            </div>
                            <div class='farmRight'>
                                <div class='balanceTip'>Earned rewards</div>
                                <div class='pledgeInputDiv2'>
                                    {{i.rewardCount}}
                                </div>
                                <div class='pledgeBtn' v-if='showCliam(i.rewardCount)' @click='cliam(i,index)'>Cliam</div>
                                <div class='pledgeBtn disableBtn' v-else>Cliam</div>
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
import Web3 from 'web3'
import { chainId, farmToken } from '../../constants/common'
import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../../store/index'
import { pairAbi } from '../../constants/abi/pairAbi'
import { farmAbi } from '../../constants/abi/farmAbi'
export default {
    name: '',
    data () {
        return {
            chainId: chainId,
            farmToken: farmToken
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'network', 'allToken', 'allLp'])
    },
    methods: {
        ...mapActions(baseInfoStore, ['changeFromAddress', 'changeNetwork', 'connect', 'getBaseVal', 'connectWeb3']),
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
                    if (this.fromAddress) {
                        if (!this.allLp[i].close) {
                            this.getDetailInfo(index)
                        }
                    }
                }
            }
        },
        pledgeMax(index) {
            if (Number(this.allLp[index].lpBalance) > 0) {
                this.allLp[index].pledgeVal = this.allLp[index].lpBalance
                this.allLp[index].hideError = true
                this.showApprove(this.allLp[index], index)
            }
        },
        releaseMax(index) {
            if (Number(this.allLp[index].personLpNum) > 0) {
                this.allLp[index].releaseVal = this.allLp[index].personLpNum
                this.allLp[index].hideError2 = true
            }
        },
        showCliam(val) {
            if (val && Number(val) > 0) {
                return true
            } else {
                return false
            }
        },
        async cliam(item, index) {
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, item.farmAddress)
            const tx = await farmContract.methods.getReward()
            const that = this
            await web3.eth.sendTransaction({
                from: this.fromAddress,
                to: item.farmAddress,
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
                    that.$emit('hideWait')
                    that.$emit('showSuccess', hash)
                    that.getStatus(hash, index, 3)
                }
            })
        },
        async showApproveBtn(item, index) {
            if (Number(item.pledgeVal) <= Number(item.lpBalance) && Number(item.pledgeVal) > 0) {
                this.allLp[index].hideError = true
                this.showApprove(item, index)
            } else {
                this.allLp[index].hideError = false
            }
        },
        async showReleaseBtn(item, index) {
            if (Number(item.releaseVal) <= Number(item.personLpNum) && Number(item.releaseVal) > 0) {
                this.allLp[index].hideError2 = true
            } else {
                this.allLp[index].hideError2 = false
            }
        },
        async showApprove(item, index) {
            const web3 = new Web3(window.ethereum)
            const stakingTokenAddress = item.address
            const stakingTokenContract = new web3.eth.Contract(pairAbi, stakingTokenAddress)
            const allowance = await stakingTokenContract.methods.allowance(this.fromAddress, item.farmAddress).call()
            const pool = new web3.eth.Contract(pairAbi, item.address)
            const lpDecimals = await pool.methods.decimals().call()
            const pledgeVal = item.pledgeVal * Math.pow(10, lpDecimals)
            if (Number(pledgeVal) > Number(allowance)) {
                this.allLp[index].approve = false
            } else {
                this.allLp[index].approve = true
            }
        },
        async approve(item, index) {
            const web3 = new Web3(window.ethereum)
            const amountToApprove = '115792089237316195423570985008687907853269984665640564039457584007913129639935' // 2^256-1
            const stakingTokenAddress = item.address
            const stakingTokenContract = new web3.eth.Contract(pairAbi, stakingTokenAddress)
            await stakingTokenContract.methods.approve(item.farmAddress, amountToApprove).send({ from: this.fromAddress })
            this.allLp[index].approve = true
        },
        async pledge(item, index) {
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, item.farmAddress)
            const pool = new web3.eth.Contract(pairAbi, item.address)
            const lpDecimals = await pool.methods.decimals().call()
            const pledgeVal = item.pledgeVal * Math.pow(10, lpDecimals)
            const tx = await farmContract.methods.stake(pledgeVal)
            const that = this
            await web3.eth.sendTransaction({
                from: this.fromAddress,
                to: item.farmAddress,
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
                    that.$emit('hideWait')
                    that.$emit('showSuccess', hash)
                    that.getStatus(hash, index, 1)
                }
            })
        },
        async release(item, index) {
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, item.farmAddress)
            const pool = new web3.eth.Contract(pairAbi, item.address)
            const lpDecimals = await pool.methods.decimals().call()
            const releaseVal = item.releaseVal * Math.pow(10, lpDecimals)
            const tx = await farmContract.methods.withdraw(releaseVal)
            const that = this
            await web3.eth.sendTransaction({
                from: this.fromAddress,
                to: item.farmAddress,
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
                    that.$emit('hideWait')
                    that.$emit('showSuccess', hash)
                    that.getStatus(hash, index, 2)
                }
            })
        },
        // 监听状态
        getStatus(val, index, num) {
            const web3 = new Web3(window.ethereum)
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
                            setTimeout(that.getStatus(val, index, num), 1000)
                        } else {
                            console.error('Transaction timed out')
                        }
                    } else if (receipt.status) {
                        that.$notify({
                            title: 'Transaction success',
                            type: 'success'
                        })
                        if (num === 1) {
                            that.refresh1(index)
                        } else if (num === 2) {
                            that.refresh2(index)
                        } else if (num === 3) {
                            that.refresh3(index)
                        }
                    } else {
                        that.$notify.error({
                            title: 'Transaction fail'
                        })
                    }
                }
            })
        },

        // 监听账户切换
        onChangeAccount() {
            if (window.ethereum) {
                const that = this
                window.ethereum.on('accountsChanged', function(res) {
                    that.changeFromAddress(res[0])
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
                        that.changeNetwork(false)
                    } else {
                        that.changeNetwork(true)
                        that.init()
                    }
                })
            }
        },
        async getDetailInfo(i) {
            this.allLp[i].detailLoading = true
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, this.allLp[i].farmAddress)

            // 个人可用lp数量
            const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
            const lpDecimals = await pool.methods.decimals().call()
            pool.methods.balanceOf(this.fromAddress).call().then(res => {
                const lpBalance = res
                const showBalance = lpBalance / Math.pow(10, lpDecimals)
                const lpBalanceValue = this.allLp[i].lpPrice * lpBalance
                this.$set(this.allLp[i], 'lpBalance', showBalance.toFixed(lpDecimals))
                this.$set(this.allLp[i], 'lpBalanceValue', lpBalanceValue)
            })

            // 个人抵押lp数量
            farmContract.methods.balanceOf(this.fromAddress).call().then(res => {
                const personLpNum = res
                const personLpNumShow = personLpNum / Math.pow(10, lpDecimals)

                this.$set(this.allLp[i], 'personLpNum', personLpNumShow.toFixed(lpDecimals))
                this.$set(this.allLp[i], 'personLpValue', personLpNum * this.allLp[i].lpPrice)
            })

            // 个人奖励token数量
            farmContract.methods.earned(this.fromAddress).call().then(res => {
                const rewardCount = res
                this.$set(this.allLp[i], 'rewardCount', rewardCount / Math.pow(10, 18))
            })
            this.allLp[i].detailLoading = false
        },
        initNoUser() {
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'close', true)
                this.$set(this.allLp[i], 'pledgeVal', null)
                this.$set(this.allLp[i], 'releaseVal', null)
                this.$set(this.allLp[i], 'approve', false)
                this.$set(this.allLp[i], 'hideError', false)
                this.$set(this.allLp[i], 'hideError2', false)
                this.$set(this.allLp[i], 'loading', false)
                this.$set(this.allLp[i], 'detailLoading', false)
                this.$set(this.allLp[i], 'apr', '0')
                this.$set(this.allLp[i], 'rewardRate', '0')
                this.$set(this.allLp[i], 'farmValue', '0')
            }
        },
        // 刷新个人可用lp数量
        async refresh1(i) {
            this.allLp[i].detailLoading = true
            const web3 = new Web3(window.ethereum)
            const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
            const lpDecimals = await pool.methods.decimals().call()
            const lpBalance = await pool.methods.balanceOf(this.fromAddress).call()
            const showBalance = lpBalance / Math.pow(10, lpDecimals)
            this.allLp[i].lpBalance = showBalance.toFixed(lpDecimals)
            const lpBalanceValue = this.allLp[i].lpPrice * lpBalance
            this.allLp[i].lpBalanceValue = lpBalanceValue
            this.refresh2(i)
            this.allLp[i].detailLoading = false
        },
        // 刷新个人抵押lp数量
        async refresh2(i) {
            this.allLp[i].detailLoading = true
            this.$set(this.allLp[i], 'pledgeVal', null)
            this.$set(this.allLp[i], 'releaseVal', null)
            this.$set(this.allLp[i], 'approve', false)
            this.$set(this.allLp[i], 'hideError', false)
            this.$set(this.allLp[i], 'hideError2', false)
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, this.allLp[i].farmAddress)
            const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
            const personLpNum = await farmContract.methods.balanceOf(this.fromAddress).call()
            const lpDecimals = await pool.methods.decimals().call()
            const personLpNumShow = personLpNum / Math.pow(10, lpDecimals)
            this.$set(this.allLp[i], 'personLpNum', personLpNumShow.toFixed(lpDecimals))
            this.$set(this.allLp[i], 'personLpValue', personLpNum * this.allLp[i].lpPrice)

            // Total Value
            farmContract.methods.totalSupply().call().then(res => {
                const totalSupply = res
                const farmValue = this.allLp[i].lpPrice * totalSupply
                this.$set(this.allLp[i], 'farmValue', farmValue)
            })

            this.allLp[i].detailLoading = false
        },
        // 刷新个人奖励token数量
        async refresh3(i) {
            this.allLp[i].detailLoading = true
            const web3 = new Web3(window.ethereum)
            const farmContract = new web3.eth.Contract(farmAbi, this.allLp[i].farmAddress)
            farmContract.methods.earned(this.fromAddress).call().then(res => {
                const rewardCount = res
                this.$set(this.allLp[i], 'rewardCount', rewardCount / Math.pow(10, 18))
            })
            this.allLp[i].detailLoading = false
        },
        async initList() {
            const web3 = new Web3(window.ethereum)
            console.log(new Date())
            await this.getTokenScale()
            console.log(new Date())
            for (const i in this.allLp) {
                this.$set(this.allLp[i], 'pledgeVal', null)
                this.$set(this.allLp[i], 'releaseVal', null)
                this.$set(this.allLp[i], 'approve', false)
                this.$set(this.allLp[i], 'hideError', false)
                this.$set(this.allLp[i], 'hideError2', false)
                this.$set(this.allLp[i], 'detailLoading', false)
                // this.allLp[i].loading = true
                if (this.allLp[i].farmAddress) {
                    // Total Value
                    const scaleContract = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                    const totalPrice = this.allLp[i].totalPrice
                    const totalSupply0 = await scaleContract.methods.totalSupply().call()
                    const lpPrice0 = totalPrice / totalSupply0
                    this.$set(this.allLp[i], 'lpPrice', lpPrice0)
                    const farmContract = new web3.eth.Contract(farmAbi, this.allLp[i].farmAddress)
                    farmContract.methods.totalSupply().call().then(res => {
                        const totalSupply = res
                        const farmValue = this.allLp[i].lpPrice * totalSupply
                        this.$set(this.allLp[i], 'farmValue', farmValue)

                        farmContract.methods.rewardRate().call().then(res => {
                        // 每天产出
                            const rewardRate = res
                            const rewardRateDay = rewardRate * 60 * 60 * 24 / Math.pow(10, 18)
                            this.$set(this.allLp[i], 'rewardRate0', rewardRate)
                            this.$set(this.allLp[i], 'rewardRate', rewardRateDay)
                            // APR
                            farmContract.methods.periodFinish().call().then(res => {
                                const periodFinish = res
                                const now = new Date()
                                const nowTime = Math.floor(now.getTime() / 1000)

                                if (nowTime <= periodFinish) { // 判断是否到期，到期后无奖励
                                    if (this.allLp[i].farmValue) {
                                        // const rewardRateYear = this.allLp[i].rewardRate0 * 3600 * 24 * 365 // 一年总奖励
                                        const jlsPrice = this.getTokenPrice(farmToken)
                                        const rewardRateYearValue = ((this.allLp[i].rewardRate0 * 3600 * 24 * 365) / Math.pow(10, 18)) * (1 / jlsPrice)
                                        const apr = rewardRateYearValue / this.allLp[i].farmValue * 100
                                        const showApr = this.getAprShow(apr) + '%'
                                        this.$set(this.allLp[i], 'apr', showApr)
                                    } else { // 池子没有抵押资产
                                        this.$set(this.allLp[i], 'apr', '∞')
                                    }
                                } else if (nowTime > periodFinish) {
                                    this.$set(this.allLp[i], 'apr', '0')
                                }
                            })
                        })
                    })

                    // this.allLp[i].loading = false
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
        // 获取兑换比例
        async getTokenScale() {
            for (const i in this.allLp) {
                const web3 = new Web3(window.ethereum)
                const scaleContract = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                const reserves = await scaleContract.methods.getReserves().call()
                const token0 = this.allLp[i].from
                const token1 = this.allLp[i].to
                const decimals0 = this.getTokenDecimals(token0)
                const decimals1 = this.getTokenDecimals(token1)
                const token0Balance = reserves._reserve0 / Math.pow(10, decimals0)
                const token1Balance = reserves._reserve1 / Math.pow(10, decimals1)
                const exchangeRate = token1Balance / token0Balance
                this.$set(this.allLp[i], 'scale', exchangeRate)
                // this.allLp[i].scale = exchangeRate
                this.getBaseVal(token0, token1, exchangeRate)
                const token0Price = 1 / this.getTokenPrice(token0)
                const token1Price = 1 / this.getTokenPrice(token1)
                const totalPrice = token0Balance * token0Price + token1Balance * token1Price
                this.$set(this.allLp[i], 'totalPrice', totalPrice)
            }
        },
        getTokenPrice(name) {
            for (const i of this.allToken) {
                if (i.name === name) {
                    return i.baseVal
                }
            }
        },
        // 获取精度
        getTokenDecimals(val) {
            for (const i of this.allToken) {
                if (val === i.name) {
                    return i.decimals
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
                return Number(num).toFixed(2)
            } else {
                return 0
            }
        },
        // 初始化
        async init() {
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
                        for (const i in this.allLp) {
                            this.$set(this.allLp[i], 'loading', false)
                            this.$set(this.allLp[i], 'close', true)
                        }
                        this.initList()
                    } else {
                        this.connectWeb3()
                    }
                } else {
                    this.initNoUser()
                }
            } else {
                this.initNoUser()
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
            text-align: left;
            padding-right: 30px;
            // flex:0.6;
            width: 100px;
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
                    background: #fff;
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
                text-align: left;
                // flex:0.6;
                width: 100px;
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
                        background: #fff;
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
                    .farmLeft,.farmMiddle,.farmRight{
                        flex:1;
                        width: 0;
                        flex-shrink: 0;
                    }
                    .farmMiddle{
                        margin:0 15px;
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
                    .pledgeInputDiv2{
                        height: 50px;
                        border-radius: 5px;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        padding:0 15px;
                        font-size: 18px;
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
                        cursor: pointer;
                    }
                    .disableBtn{
                        background: #E9EEF4;
                        color: rgba(18, 18, 18, 0.17);
                    }
                    .errorBtn{
                        height: 50px;
                        background: #E9EEF4;
                        border-radius: 5px;
                        color: rgba(18, 18, 18, 0.17);
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
