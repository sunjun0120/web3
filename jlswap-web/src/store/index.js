import { defineStore } from 'pinia'
import Web3 from 'web3'
import utils from '../utils/storage'
import { chainId, nativeToken, nativeToErc20Token, erc20Token1, chainName, tokenSymbol, rpc, explorerHost, tokenId } from '../constants/common'
import { pairAbi } from '../constants/abi/pairAbi'
import { ERC20 } from '../constants/abi/ERC20'
import C from '../constants/contractAddress'
import { multicallAbi } from '../constants/abi/multicall'
import { lpList } from '../constants/lpList.js'
import { tokenList } from '../constants/tokens'

export const baseInfoStore = defineStore('baseInfo', {
    state: () => ({
        fromAddress: utils.load('fromAddress'),
        network: utils.load('network'),
        chainId: chainId,
        allLp: lpList,
        allToken: tokenList,
        provider: window.ethereum,
        topTvl: '$0.00'
    }),
    actions: {
        // 获取兑换比例
        async getTokenScale() {
            const web3 = new Web3(this.provider)
            let tvl = 0
            const calls = this.allLp.map(lp => {
                const contractAddress = lp.address
                const scaleContract = new web3.eth.Contract(pairAbi, contractAddress)
                return {
                    target: lp.address,
                    callData: scaleContract.methods.getReserves().encodeABI()
                }
            })
            const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
            const { returnData } = await multicallContract.methods.aggregate(calls).call()
            for (const i in this.allLp) {
                const reserves = web3.eth.abi.decodeParameters(['uint112', 'uint112', 'uint32'], returnData[i])
                const token0 = this.allLp[i].from
                const token1 = this.allLp[i].to
                const decimals0 = this.getTokenDecimals(token0)
                const decimals1 = this.getTokenDecimals(token1)
                const token0Balance = reserves[0] / Math.pow(10, decimals0)
                const token1Balance = reserves[1] / Math.pow(10, decimals1)
                this.allLp[i].scale = token1Balance / token0Balance
                this.getBaseVal(token0, token1, this.allLp[i].scale)
                const token0Price = 1 / this.getTokenPrice(token0)
                const token1Price = 1 / this.getTokenPrice(token1)
                const lpValue = token0Balance * token0Price + token1Balance * token1Price
                tvl = tvl + lpValue
            }
            // for (const i in this.allLp) {
            //     // 获取兑换比例
            //     const scaleContract = new web3.eth.Contract(pairAbi, this.allLp[i].address)
            //     const reserves = await scaleContract.methods.getReserves().call()
            //     console.log(reserves)
            //     // const token2 = await scaleContract.methods.token0().call()
            //     // const token3 = await scaleContract.methods.token1().call()
            //     // console.log(token2)
            //     // console.log(token3)
            //     const token0 = this.allLp[i].from
            //     const token1 = this.allLp[i].to
            //     const decimals0 = this.getTokenDecimals(token0)
            //     const decimals1 = this.getTokenDecimals(token1)
            //     const token0Balance = reserves._reserve0 / Math.pow(10, decimals0)
            //     const token1Balance = reserves._reserve1 / Math.pow(10, decimals1)
            //     const exchangeRate = token1Balance / token0Balance
            //     this.allLp[i].scale = exchangeRate
            //     this.getBaseVal(token0, token1, exchangeRate)
            //     const token0Price = 1 / this.getTokenPrice(token0)
            //     const token1Price = 1 / this.getTokenPrice(token1)
            //     const lpValue = token0Balance * token0Price + token1Balance * token1Price
            //     tvl = tvl + lpValue
            // }
            const tvlValue = tvl.toFixed(2).toLocaleString()
            this.topTvl = '$' + tvlValue
        },
        // 同时获取代币余额
        async aggregateBalance() {
            const web3 = new Web3(this.provider)
            const calls = this.allToken.map(token => {
                const contractAddress = token.address
                const ethContract = new web3.eth.Contract(ERC20, contractAddress)
                return {
                    target: token.address,
                    callData: ethContract.methods.balanceOf(this.fromAddress).encodeABI()
                }
            })
            const multicallContract = new web3.eth.Contract(multicallAbi, C.multicall_address)
            const { returnData } = await multicallContract.methods.aggregate(calls).call()
            for (const i in this.allToken) {
                if (i > 0) {
                    const balance = web3.eth.abi.decodeParameter('uint256', returnData[i])
                    this.allToken[i].balance = balance / Math.pow(10, this.allToken[i].decimals)
                } else {
                    const balance = await web3.eth.getBalance(this.fromAddress).then(res => {
                        return res / Math.pow(10, this.allToken[i].decimals)
                    })
                    this.allToken[i].balance = balance
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
            const web3 = new Web3(this.provider)
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
                if (i.name === erc20Token1) {
                    i.baseVal = 1
                }
                if (name0 === erc20Token1) {
                    if (i.name === name1) {
                        i.baseVal = scale
                    }
                    if (name1 === nativeToErc20Token && i.name === nativeToken) {
                        i.baseVal = 1 / scale
                    }
                }
                if (name1 === erc20Token1) {
                    if (i.name === name0) {
                        i.baseVal = 1 / scale
                    }
                }

                // if (name0 === nativeToErc20Token && name1 === erc20Token1) {
                //     if (i.name === name0) {
                //         i.baseVal = 1 / scale
                //     }
                //     if (i.name === nativeToken) {
                //         i.baseVal = 1 / scale
                //     }
                // }
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
            if (this.provider) {
                const that = this
                this.provider.request({ method: 'eth_requestAccounts' }).then(res => {
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
            if (this.provider) {
                const that = this
                try {
                    await this.provider.request({
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
                            await this.provider.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: Web3.utils.numberToHex(that.chainId),
                                        chainName: chainName,
                                        nativeCurrency: {
                                            name: tokenId,
                                            symbol: tokenSymbol,
                                            decimals: 18
                                        },
                                        rpcUrls: [rpc],
                                        blockExplorerUrls: [explorerHost]
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
            if (this.provider) {
                const that = this
                this.provider.on('accountsChanged', function(res) {
                    that.fromAddress = res[0]
                    utils.put('fromAddress', that.fromAddress)
                })
            }
        },
        // 监听链是否正确
        onChangeChain() {
            if (this.provider) {
                const that = this
                this.provider.on('chainChanged', function(val) {
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
