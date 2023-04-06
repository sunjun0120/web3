<template>
  <div class='farmTable'>
    <div class='title'>
        <div class='titleName leftName'>Featured</div>
        <div class='titleName second'>Total Value</div>
        <div class='titleName third'>Daily Reward</div>
        <div class='titleName rightName'>APR</div>
    </div>
    <div class='content'>
        <div class='item' v-for='i,index in 4' :key='index'>
            <div class='itemInfo' >
                <div class='itemName leftName'>
                    <div class='img'><img :src="getImg('JLS')" alt=""></div>
                    <div class='img'><img :src="getImg('USDC')" alt=""></div>
                    <div class='tokens'>JLS / USDC</div>
                </div>
                <div class='itemName second'>$34.10K</div>
                <div class='itemName third'>
                    <div class='tokenInfoDiv'>
                        <div class='tokenInfo'>
                            <div class='tokenImg'><img :src="getImg('JLS')" alt=""></div>
                            <div class='infoDesc'>4,807 JLS/day</div>
                        </div>
                        <div class='tokenInfo'>
                            <div class='tokenImg'><img :src="getImg('USDC')" alt=""></div>
                            <div class='infoDesc'>2018 USDC/day</div>
                        </div>
                    </div>
                </div>
                <div class='itemName rightName'>20%</div>
            </div>
            <div class='options'>
                <!-- <div class='connect'>
                    <div class='connectTip'>Connect to a Wallet to start farm</div>
                    <div class='connectBtn'>Connect Wallet</div>
                </div> -->
                <div class='farmContent'>
                    <div class='farmLeft'>
                        <div class='balanceTip'>Wallet Balance : 0.00000（$0.00）</div>
                        <div class='pledgeInputDiv'>
                            <div class='pledge'>
                                <el-input v-model="pledgeVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                            </div>
                            <div class='max'>greatest amount</div>
                        </div>
                        <div class='pledgeBtn'>pledge</div>
                    </div>
                    <div class='farmRight'>
                        <div class='balanceTip'>Your share of the liquidity pool: 0.00000（$0.00）</div>
                        <div class='pledgeInputDiv'>
                            <div class='pledge'>
                                <el-input v-model="releaseVal" placeholder="0.0" type="number" class='pledgeInput'></el-input>
                            </div>
                            <div class='max'>greatest amount</div>
                        </div>
                        <div class='pledgeBtn'>release mortgage</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { tokenList } from '../../constants/tokens'
export default {
    name: '',
    data () {
        return {
            allToken: tokenList,
            pledgeVal: null,
            releaseVal: null
        }
    },
    methods: {
        getImg(val) {
            for (const i in this.allToken) {
                if (this.allToken[i].name === val) {
                    return this.allToken[i].icon
                }
            }
        }
    }
}
</script>

<style lang="less" scoped>
.farmTable{
    .title{
        padding:0 40px 0 10px;
        display: flex;
        align-items: center;
        .titleName{
            font-size: 20px;
            font-weight: bold;
            color: rgba(0,0,0,0.85);
            flex:1;
        }
        .leftName{
            text-align: left;
        }
        .rightName{
            text-align: right;
            flex:0.8;
        }
        .second{
            flex:0.8;
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
                cursor: pointer;
                padding:0 40px 0 10px;
            }
            .itemName{
                flex:1;
                color: rgba(0,0,0,0.85);
            }
            .leftName{
                text-align: left;
                display: flex;
                align-items: center;
                .img{
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    margin-left:15px;
                    img{
                        width: 100%;
                        height: 100%;
                    }
                }
                .tokens{
                    color: rgba(0,0,0,0.85);
                    font-size: 20px;
                    margin-left: 20px;
                }
            }
            .rightName{
                text-align: right;
                flex:0.8;
                font-size: 20px;
                color: rgba(0,0,0,0.85);
            }
            .second{
                flex:0.8;
                font-size: 20px;
                color: rgba(0,0,0,0.85);
            }
            .third{
                .tokenInfoDiv{
                    width: 200px;
                    margin:0 auto;
                }
                .tokenInfo{
                    display: flex;
                    align-items: center;
                    margin-top:15px;
                    .tokenImg{
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        margin-right: 15px;
                        img{
                            width: 100%;
                            height: 100%;
                        }
                    }
                    .infoDesc{
                        font-size: 16px;
                    }
                }
                .tokenInfo:first-child{
                    margin-top: 0;
                }
            }
            .options{
                height: 222px;
                border-top:1px solid #DAE7F9;
                box-sizing: border-box;
                display: flex;
                // align-items: center;
                justify-content: center;
                .connect{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    .connectTip{
                        font-size: 20px;
                        color: rgba(0,0,0,0.85);
                    }
                    .connectBtn{
                        background: #E02020;
                        border-radius: 5px;
                        height: 54px;
                        width: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color:#FFF;
                        font-size: 20px;
                        cursor: pointer;
                        margin-top: 30px;
                    }
                }
                .farmContent{
                    flex:1;
                    padding:0 60px;
                    display: flex;
                    .farmLeft,.farmRight{
                        flex:1;
                    }
                    .farmLeft{
                        padding-right: 20px;
                    }
                    .farmRight{
                        padding-left: 20px;
                    }
                    .balanceTip{
                        font-size: 20px;
                        color: rgba(0,0,0,0.85);
                        margin-top: 10px;
                        margin-bottom: 20px;
                        text-align: left;
                    }
                    .pledgeInputDiv{
                        height: 62px;
                        background: #F5F8FC;
                        border-radius: 5px;
                        border: 1px solid #6D7278;
                        box-sizing: border-box;
                        display: flex;
                        align-items: center;
                        padding:0 20px;
                        .pledge{
                            flex:1;
                        }
                        .max{
                            background: #E02020;
                            border-radius: 16px;
                            color: rgba(253,250,250,0.85);
                            padding:5px 15px;
                            font-size: 14px;
                            cursor: pointer;
                        }
                    }
                    .pledgeBtn{
                        height: 54px;
                        background: #E02020;
                        border-radius: 5px;
                        color:#fff;
                        font-size: 20px;
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
             font-size: 20px;
        }
    }
}
</style>
