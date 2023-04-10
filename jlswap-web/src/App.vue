<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<style lang="less">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #0B0B0B;
}
body {
    margin: 0;
    font-size: 14px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
input[type='number'] {
    appearance: textfield;
}
// 滚动条整体宽度
::-webkit-scrollbar {
    width: 8px;
    height: 3px;
}
// 滚动条滑槽样式
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 8px;
}
// 滚动条样式
::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: rgba(134, 134, 134, 0.7);
    box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
}
::-webkit-scrollbar-thumb:hover{
    background: rgba(134, 134, 134, 1);
}
::-webkit-scrollbar-thumb:active{
    background: rgba(134, 134, 134, 1);
}
</style>
