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
// input[type='number'] {
//   -moz-appearance: textfield;
// }
</style>
