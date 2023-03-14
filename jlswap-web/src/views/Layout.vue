<template>
    <div class="jlswap-layout">
        <el-container class="home">
            <el-header class="header" height="72px">
                <div class="left">
                    <div class="logo">JLSwap</div>
                    <div class="menus">
                        <el-menu class="menu"
                            :default-active="currentActivePath"
                            active-text-color="#fff"
                            text-color="#bfbfbf"
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
                    <div class="all money">{{all}}</div>
                    <div class="surplus money">{{surplus}}</div>
                    <div class="connectWallet" @click="connect">连接钱包</div>
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
                    menuName: 'Farm',
                    path: '/farm',
                    children: [
                    ]
                }
            ],
            all: '$16.3M',
            surplus: '$0.00'
        }
    },
    methods: {
        // 连接钱包
        connect() {
            if (window.ethereum) {
                console.log(window.ethereum)
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
                    this.getBalance()
                })
            } else {
                // 唤起失败，跳转metaMask
                window.open('https://metamask.io/')
            }
        },
        // 获取钱包余额
        async getBalance() {
            const web3 = new Web3(window.ethereum)
            const fromAddress = await web3.eth.getAccounts()
            web3.eth.getBalance(fromAddress[0], (err, res) => {
                if (!err) {
                    console.log('余额：' + res / Math.pow(10, 18))
                }
            })
        },
        init() {
            // 唤起钱包
            if (window.ethereum) {
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
                    console.log('当前钱包地址：' + res[0])
                })
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
        // this.init()
    }
}
</script>
<style lang="less" scoped>
.jlswap-layout{
    .home{
        width:100vw;
        height: 100vh;
        .header {
            background: #0d1126;
            color: #fff;
            padding:1rem 0.75rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .logo{
                cursor: pointer;
                font-size: 28px;
                font-weight: bold;
                margin-left: 30px;
                margin-right: 50px;
            }
            .left{
                display: flex;
            }
            .right{
                display: flex;
                font-size: 16px;
                .money{
                    background: #000;
                    border-radius: 8px;
                    padding:0.5rem 0.75rem;
                    // line-height: 20px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                }
                .all{
                    color:rgba(124,255,107,1);
                    font-weight: bold;
                    margin-right: 30px;
                }
                .connectWallet{
                    background:#871061;
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding:0 1rem;
                    margin-left: 20px;
                    line-height: 40px;
                    margin-right: 30px;
                }
            }
        }
        .main{
            background: linear-gradient(45deg,#141938,#301748);
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
        height: 40px;
        line-height: 40px;
    }
    .el-menu--horizontal>.el-menu-item{
        height: 40px;
        line-height: 40px;
    }
    .el-dropdown-menu__item, .el-menu-item{
        font-size: 16px;
    }
    .el-menu--horizontal>.el-submenu .el-submenu__title:hover{
         background-color:transparent!important;
    }
    .el-menu--horizontal>.is-opened .el-submenu__title:hover{
        color:#FFF!important;
    }
    .el-menu--horizontal>.is-opened .el-submenu__title i{
        color:#FFF!important;
    }
    .el-menu--horizontal>.el-menu-item.is-active{
        border-bottom:none;
        border-bottom-color: transparent!important;
        position: relative;
    }
    .el-menu--horizontal .el-menu-item:focus,.el-menu--horizontal .el-menu-item:hover{
        background-color:transparent!important;
        color:#fff!important;
    }
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
