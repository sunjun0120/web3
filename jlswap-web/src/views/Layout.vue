<template>
    <div class="jlswap-layout">
        <el-container class="home">
            <el-header class="header" height="80px">
                <div class="left">
                    <div class="logoImg">JLS</div>
                    <div class="logo">JLSwap</div>
                    <div class="menus">
                        <el-menu class="menu"
                            :default-active="currentActivePath"
                            active-text-color="#0B0B0B"
                            text-color="#0B0B0B"
                            background-color="transparent"
                            mode='horizontal'
                            router
                            :unique-opened='true'
                        >
                            <template v-for="menu in MenuList">
                                <el-submenu :key="menu.menuName" :index="menu.menuName" v-if='menu.children.length > 0' class='topSubmenu'>
                                    <template slot="title">
                                        <span slot="title">{{ menu.menuName }}</span>
                                    </template>
                                    <el-menu-item v-for="subMenu in menu.children" class='subMenuList'
                                        :index="subMenu.path"
                                        :key="subMenu.menuName"
                                        :route="{ path: subMenu.path }"
                                    >
                                        <span class="subMenuTitle">{{ subMenu.menuName }}</span>
                                    </el-menu-item>
                                </el-submenu>
                                <el-menu-item :key="menu.path" :index="menu.path" :route="{ path: menu.path }" v-else>
                                    <span slot="title">{{ menu.menuName }}</span>
                                </el-menu-item>
                            </template>
                        </el-menu>
                    </div>
                </div>
                <div class="right">
                    <div class="all money">TVL<span class="moneyNum">{{all}}</span></div>
                    <div class="money">JLS<span  class="moneyNum">{{surplus}}</span></div>
                    <div class="connectWallet" @click="connect" v-if="!fromAddress">Connect Wallet</div>
                    <div v-else>
                        <div class='userAddress' v-if="network">{{showFrom(fromAddress)}}</div>
                        <div class="connectWallet" v-else>Network Error</div>
                    </div>
                </div>
            </el-header>
            <el-main class="main">
                <transition mode="out-in" name="fade">
                    <router-view></router-view>
                </transition>
            </el-main>
        </el-container>
    </div>
</template>
<script>
import Web3 from 'web3'
import utils from '../utils/storage'
// import abi from '../abi/ERC20.json'
export default {
    name: '',
    data () {
        return {
            MenuList: [
                {
                    menuName: 'Swap',
                    path: '/swap',
                    children: [
                    ]
                },
                {
                    menuName: 'Pool',
                    path: '/pool',
                    children: [
                    ]
                },
                {
                    menuName: 'Farm',
                    path: '/farm',
                    children: [
                    ]
                }
            ],
            all: '$0.00',
            surplus: '$0.00',
            network: utils.load('network'),
            fromAddress: utils.load('fromAddress'),
            chainId: 137 // Polygon Mainnet
        }
    },
    methods: {
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
        // 获取钱包余额
        async getBalance() {
            const web3 = new Web3(window.ethereum)
            const fromAddress = await web3.eth.getAccounts()
            console.log(web3.currentProvider)
            web3.eth.getBalance(fromAddress[0], (err, res) => {
                if (!err) {
                    console.log('余额：' + res / Math.pow(10, 18))
                }
            })
        },
        // 展示地址
        showFrom(val) {
            if (val) {
                return val.substring(0, 5) + '...' + val.substring(val.length - 4)
            } else {
                return ''
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
        },
        async init() {
            // 获取账户信息
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum)
                const fromAddress = await web3.eth.getAccounts()
                this.fromAddress = fromAddress[0]
                utils.put('fromAddress', this.fromAddress)
                const netId = await web3.eth.getChainId()
                if (this.chainId === netId) {
                    this.network = true
                } else {
                    this.network = false
                }
            } else {
                console.log('请安装MetaMask钱包')
            }
        }
    },
    computed: {
        currentActivePath () {
            const path = this.$route.path
            const params = this.$route.params
            if (!Object.keys(params).length) {
                return path
            } else {
                return `/${path.split('/')[1]}`
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
.jlswap-layout{
    .home{
        width:100vw;
        height: 100vh;
        .header {
            background: #F5F8FC;
            color: #0B0B0B;
            // padding:1rem 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .logo{
                cursor: pointer;
                font-size: 24px;
                font-weight: bold;
                margin-left: 20px;
                margin-right: 7.3vw;
            }
            .left{
                display: flex;
                align-items: center;
                .logoImg{
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: #CE2D32;
                    color:#fff;
                    font-size: 18px;
                    margin-left: 3.125vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
            .right{
                display: flex;
                font-size: 16px;
                align-items: center;
                .money{
                    font-size: 20px;
                    color: #CE2D32;
                    font-weight: bold;
                    .moneyNum{
                        margin-left: 6px;
                    }
                }
                .all{
                    margin-right: 40px;
                }
                .connectWallet{
                    background:#CE2D32;
                    color:#fff;
                    cursor: pointer;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding:10px 20px;
                    margin-left: 3.125vw;
                    font-size: 20px;
                    font-weight: bold;
                    // line-height: 40px;
                    // margin-right: 30px;
                }
                .userAddress{
                    margin-left: 3.125vw;
                    // margin-right: 30px;
                    display: flex;
                    align-items: center;
                    border:1px solid #CE2D32;
                    padding:10px 20px;
                    border-radius: 8px;
                }
                .userAddress::after{
                    display: block;
                    content: '';
                    width: 20px;
                    height: 20px;
                    background: url('../assets/metaMaskIcon.svg') no-repeat;
                    background-size: 100% 100%;
                    margin-left: 8px;
                }
            }
        }
        .main{
            background: rgba(245,248,252,0.52);
        }
    }
}
</style>
<style lang="less">
.jlswap-layout{

    .el-menu.el-menu--horizontal{
        border-bottom: none;
    }
    .el-menu--horizontal>.el-submenu .el-submenu__title{
        height: 50px;
        // line-height: 60px;
        display: flex;
        align-items: center;
    }
    .el-menu--horizontal>.el-menu-item{
        height: 50px;
        // line-height: 60px;
        margin-right: 3.125vw;
        border-radius: 20px;
        border-bottom:none;
        border-bottom-color: transparent!important;
        display: flex;
        align-items: center;
    }
    .el-menu-item:last-child{
        margin-right: 0;
    }
    .el-dropdown-menu__item, .el-menu-item{
        font-size: 24px;
    }
    .el-menu--horizontal>.el-submenu .el-submenu__title:hover{
         background-color:#DAE7F9!important;
    }
    .el-menu--horizontal>.is-opened .el-submenu__title:hover{
        color:#0B0B0B!important;
    }
    .el-menu--horizontal>.is-opened .el-submenu__title i{
        color:#0B0B0B!important;
    }
    .el-menu--horizontal>.el-menu-item.is-active{
        border-bottom:none;
        border-bottom-color: transparent!important;
        position: relative;
        background-color:#DAE7F9!important;
    }
    .el-menu--horizontal .el-menu-item:focus,.el-menu--horizontal .el-menu-item:hover{
        background-color:#DAE7F9!important;
        color:#0B0B0B!important;
    }
}
.el-loading-mask{
    background-color:rgba(245, 248, 252,0.8)!important;
}
.el-menu--popup-bottom-start{
    background-color:#000000!important;
    border-radius: 6px;
}
.subMenuList{
    background-color: #000000!important;
}
.subMenuList:hover{
    color:#fff!important;
    background-color: #000000!important;
}
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
