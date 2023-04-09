import { defineStore } from 'pinia'
import Web3 from 'web3'
import utils from '../utils/storage'
import { chainId, farmToken } from '../constants/common'
import { pairAbi } from '../constants/abi/pairAbi'
import { lpList } from '../constants/lpList.js'
import { tokenList } from '../constants/tokens'

export const baseInfoStore = defineStore('baseInfo', {
    state: () => ({
        fromAddress: utils.load('fromAddress'),
        network: utils.load('network'),
        chainId: chainId,
        allLp: lpList,
        allToken: tokenList,
        farmTokenPrice: '$0.00'
    }),
    actions: {
        // 头部初始化
        initHead() {
            this.farmTokenPrice = '$0.00'
        },
        // 获取兑换比例
        async getTokenScale() {
            const web3 = new Web3(window.ethereum)
            for (const i in this.allLp) {
                // 获取兑换比例
                const scaleContract = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                const reserves = await scaleContract.methods.getReserves().call()
                const token0 = await scaleContract.methods.token0().call()
                const token1 = await scaleContract.methods.token1().call()
                const decimals0 = this.getTokenDecimals(token0)
                const decimals1 = this.getTokenDecimals(token1)
                const token0Balance = reserves._reserve0 / Math.pow(10, decimals0)
                const token1Balance = reserves._reserve1 / Math.pow(10, decimals1)
                const exchangeRate = token1Balance / token0Balance

                this.allLp[i].scale = exchangeRate
                const name0 = this.getTokenName(token0)
                const name1 = this.getTokenName(token1)
                this.getBaseVal(name0, name1, exchangeRate)
                this.farmTokenPrice = this.getPrice()
            }
        },
        // 获取头部价格
        getPrice() {
            for (const i of this.allToken) {
                if (i.name === farmToken) {
                    const jlsPrice = i.baseVal
                    const decimals = i.decimals
                    const surplusVal = '$' + (jlsPrice / Math.pow(10, decimals)).toFixed(decimals)
                    return surplusVal
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
        // 获取token价格
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
        changeFromAddress(val) {
            this.fromAddress = val
        },
        changeNetwork(val) {
            this.network = val
        },
        // 连接钱包
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
                        utils.put('network', false)
                    } else {
                        that.network = true
                        utils.put('network', true)
                        console.log('网络切换正确！')
                    }
                })
            }
        }
    }
})
