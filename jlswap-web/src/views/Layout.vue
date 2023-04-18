<template>
    <div class="jlswap-layout">
        <el-container class="home">
            <el-header class="header" height="70px">
                <div class="left">
                    <div class="logoImg">
                        <img :src="getImg()" alt="">
                    </div>
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
                    <div class="money">JLS<span  class="moneyNum">{{farmTokenPrice}}</span></div>
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
            <el-footer class="footer">
                <div class="link">
                    <div class="linkItem discord"></div>
                    <div class="linkItem tg"></div>
                    <div class="linkItem twitter" @click="goTwitter"></div>
                </div>
            </el-footer>
        </el-container>
    </div>
</template>
<script>
import { chainId, farmToken } from '../constants/common'
import Web3 from 'web3'
import { mapState, mapActions } from 'pinia'
import { baseInfoStore } from '../store/index'
import { pairAbi } from '../constants/abi/pairAbi'
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
            farmToken: farmToken,
            all: '$0.00',
            farmTokenPrice: '$0.00',
            chainId: chainId
        }
    },
    computed: {
        ...mapState(baseInfoStore, ['fromAddress', 'network', 'allToken', 'allLp']),
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
    methods: {
        ...mapActions(baseInfoStore, ['changeFromAddress', 'changeNetwork', 'getTokenScale', 'connect']),
        goTwitter() {
            window.open('https://twitter.com/JLSwap0001')
        },
        // 获取精度
        getTokenDecimals(val) {
            for (const i of this.allToken) {
                if (val === i.name) {
                    return i.decimals
                }
            }
        },
        getTokenPrice(name) {
            for (const i of this.allToken) {
                if (i.name === name) {
                    return i.baseVal
                }
            }
        },
        getImg() {
            for (const i of this.allToken) {
                if (i.name === this.farmToken) {
                    return i.icon
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
        // 展示地址
        showFrom(val) {
            if (val) {
                return val.substring(0, 5) + '...' + val.substring(val.length - 4)
            } else {
                return ''
            }
        },
        // 保留几位小数
        getAprShow(val) {
            if (val) {
                const balance = Math.round(val * Math.pow(10, 6)) / Math.pow(10, 6)
                return balance
            } else {
                return '0.00'
            }
        },
        async getTvl() {
            const web3 = new Web3(window.ethereum)
            let tvl = 0
            for (const i in this.allLp) {
                const pool = new web3.eth.Contract(pairAbi, this.allLp[i].address)
                const reserves = await pool.methods.getReserves().call()
                const token0 = this.allLp[i].from
                const token1 = this.allLp[i].to
                const decimals0 = this.getTokenDecimals(token0)
                const decimals1 = this.getTokenDecimals(token1)
                const token0Balance = reserves._reserve0 / Math.pow(10, decimals0)
                const token1Balance = reserves._reserve1 / Math.pow(10, decimals1)
                const token0Price = 1 / this.getTokenPrice(token0)
                const token1Price = 1 / this.getTokenPrice(token1)
                const lpValue = token0Balance * token0Price + token1Balance * token1Price
                tvl = tvl + lpValue
            }
            const tvlValue = tvl.toFixed(2).toLocaleString()
            // const tvlValue = parseInt(tvl).toLocaleString()
            this.all = '$' + tvlValue
        },
        async init() {
            // 初始化
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
                    await this.getTokenScale()
                    this.getTvl()
                    for (const i of this.allToken) {
                        if (i.name === farmToken) {
                            const jlsPrice = 1 / i.baseVal
                            // const decimals = i.decimals
                            // const surplusVal = '$' + (1 / jlsPrice).toFixed(decimals)

                            const surplusVal = '$' + this.getAprShow(jlsPrice)
                            this.farmTokenPrice = surplusVal
                        }
                    }
                } else {
                    this.farmTokenPrice = '$0.00'
                    this.all = '$0.00'
                }
            } else {
                this.farmTokenPrice = '$0.00'
                this.all = '$0.00'
            }
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
                        that.farmTokenPrice = '$0.00'
                        that.all = '$0.00'
                    } else {
                        that.changeNetwork(true)
                        that.init()
                    }
                })
            }
        }
    },
    watch: {
        fromAddress(newVal, oldVal) {
            if (!newVal) {
                this.farmTokenPrice = '$0.00'
                this.all = '$0.00'
            }
        },
        network(newVal, oldVal) {
            if (!newVal) {
                this.farmTokenPrice = '$0.00'
                this.all = '$0.00'
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
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-left: 3.125vw;
                    img{
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }
            }
            .right{
                display: flex;
                font-size: 16px;
                align-items: center;
                .money{
                    font-size: 16px;
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
                    font-size: 16px;
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
        .footer{
            background: rgba(245,248,252,0.52);
            height: 50px!important;
            .link{
                display: flex;
                justify-content: flex-end;
                .linkItem{
                    width: 20px;
                    height: 20px;
                    margin-right: 20px;
                    cursor: pointer;
                }
                .discord{
                    background: url('../assets/discord.png') no-repeat;
                    background-size: 100% 100%;
                }
                .tg{
                    background: url('../assets/tg.png') no-repeat;
                    background-size: 100% 100%;
                }
                .twitter{
                    background: url('../assets/twitter.png') no-repeat;
                    background-size: 100% 100%;
                }
            }
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
        line-height: 50px;
        margin-right: 3.125vw;
        border-radius: 15px;
        border-bottom:none;
        border-bottom-color: transparent!important;
        display: flex;
        align-items: center;
    }
    .el-menu-item:last-child{
        margin-right: 0;
    }
    .el-dropdown-menu__item, .el-menu-item{
        font-size: 18px;
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
        font-weight: bold;
    }
    .el-menu--horizontal .el-menu-item:focus,.el-menu--horizontal .el-menu-item:hover{
        background-color:#DAE7F9!important;
        color:#0B0B0B!important;
    }
}
.el-loading-mask{
    background-color:rgba(245, 248, 252,0.8)!important;
}
.el-dialog__headerbtn{
    font-size: 20px!important;
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
